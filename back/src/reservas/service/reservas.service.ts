import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { EstadoPagoReserva, Reserva } from '../entity/reserva.entity';
import { CrearReservaDto } from '../dto/crear-reserva.dto';
import { ActualizarFechasReservaDto } from '../dto/actualizar-fechas-reserva.dto';
import { DisponibilidadService } from '../../disponibilidad/service/disponibilidad.service';
import type { IReservaRepository } from '../repository/reserva.repository.interface';
import { RESERVA_REPOSITORY } from '../repository/reserva.repository.interface';
import { UsuariosService } from '../../usuarios/service/usuarios.service';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { Modalidad } from '../../catalogos/entity/modalidad.entity';
import type { IMailService } from '../../mail/mail.interface';
import { MAIL_SERVICE } from '../../mail/mail.interface';
import { normalizarFechaReserva } from './reservas.utils';
import { randomBytes, timingSafeEqual } from 'crypto';
import { EstadoLiquidacionReserva } from '../entity/reserva.entity';
import { ResolverLiquidacionDto } from '../dto/resolver-liquidacion.dto';

@Injectable()
export class ReservasService {
  private readonly logger = new Logger(ReservasService.name);
  constructor(
    // Repositorio por interfaz, igual criterio que en Disponibilidad
    @Inject(RESERVA_REPOSITORY)
    private readonly reservaRepository: IReservaRepository,
    // Este SÍ se inyecta directo por clase: DisponibilidadService no tiene
    // interfaz propia, es un service normal que exporta lógica de negocio
    // (no una capa de acceso a datos), así que no necesita el mismo patrón.
    private readonly disponibilidadService: DisponibilidadService,
    private readonly usuariosService: UsuariosService,
    private readonly publicacionesService: PublicacionesService,
    @Inject(MAIL_SERVICE) private readonly mailService: IMailService,
  ) {}

  /**
  * Crea una reserva y conserva una copia del periodo y de los datos del
  * inquilino para mantener el historial aunque la cuenta sea eliminada.
  * El flujo es:
   *   1) validar el rango recibido en el DTO
   *   2) preguntarle a Disponibilidad si ese rango está libre
   *   3) recién ahí crear la Reserva
   *   4) y por último, marcar esas Fechas como ocupadas
   */
  async crearPendiente(dto: CrearReservaDto, idUsuario: number): Promise<Reserva> {
    // El DTO trae el rango; Reserva conserva el periodo y Fecha mantiene
    // cada dia para bloquearlo en el calendario.
    const inicio = new Date(dto.fecha_inicio);
    const fin = new Date(dto.fecha_fin);

    if (inicio > fin) {
      throw new BadRequestException('La fecha de inicio no puede ser posterior a la de fin');
    }

    const publicacion = await this.publicacionesService.buscarPorId(dto.id_publicacion);
    if (!publicacion.activa) {
      throw new BadRequestException('No se puede reservar una publicación inactiva');
    }
    if (publicacion.anunciante?.idUsuario === idUsuario) {
      throw new BadRequestException('No podés reservar tu propia publicación');
    }
    if (!this.admiteReservaPorFecha(publicacion.modalidad)) {
      throw new BadRequestException('Solo las publicaciones temporales o de alquiler diario admiten reservas por fecha');
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (inicio < hoy || fin < hoy) {
      throw new BadRequestException('Las fechas de la reserva no pueden ser anteriores a hoy');
    }
    const cantidadDias = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const precioDiario = Number(publicacion.precio);
    const montoCalculado = Number((precioDiario * cantidadDias).toFixed(2));

    if (!Number.isFinite(montoCalculado) || montoCalculado < 0) {
      throw new BadRequestException('No se pudo calcular el monto de la reserva');
    }

    // Una preferencia vencida no debe dejar bloqueado el calendario para siempre.
    await this.liberarPendientesVencidas();

    // Delegamos la pregunta "¿está libre este rango?" al módulo que es
    // dueño de esa lógica (Disponibilidad), en vez de duplicarla acá
    const disponible = await this.disponibilidadService.verificarDisponibilidad(
      dto.id_publicacion,
      inicio,
      fin,
    );

    if (!disponible) {
      throw new ConflictException('El rango de fechas seleccionado no está disponible');
    }

    const usuario = await this.usuariosService.buscarPorId(idUsuario);
    if (!usuario) {
      throw new NotFoundException('No se encontró el usuario que realiza la reserva');
    }

    // Las relaciones se crean con solo el ID: TypeORM puede resolver las FK sin cargar entidades completas.
    const reserva = this.reservaRepository.crear({
      finalizada: false,
      cancelada: false,
      fecha_cancelacion: null,
      monto_pago: montoCalculado,
      fecha_pago: null,
      estado_pago: EstadoPagoReserva.PENDIENTE,
      estado_liquidacion: EstadoLiquidacionReserva.NO_APLICA,
      codigo_alojamiento: null,
      codigo_generado_en: null,
      codigo_validado_en: null,
      intentos_codigo: 0,
      fecha_resolucion_liquidacion: null,
      referencia_liquidacion: null,
      observacion_liquidacion: null,
      pago_vencimiento: new Date(Date.now() + 15 * 60 * 1000),
      fecha_inicio: inicio,
      fecha_fin: fin,
      usuario_nombre: usuario.nombre,
      usuario_apellido: usuario.apellido,
      usuario_email: usuario.email,
      usuario_telefono: usuario.telefono,
      usuario,
      publicacion,
    });

    // Persistimos la reserva primero para obtener su ID antes de asociarlo a las fechas.
    const reservaGuardada = await this.reservaRepository.guardar(reserva);

    // Primero se guarda la reserva para no enlazar fechas a una reserva sin ID.
    await this.disponibilidadService.marcarComoReservadas(
      dto.id_publicacion,
      inicio,
      fin,
      reservaGuardada.id,
    );

    return reservaGuardada;
  }

  /** Confirma la reserva únicamente después de verificar el pago con Mercado Pago. */
  async confirmarPago(id: number, fechaPago: Date): Promise<Reserva> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva) throw new NotFoundException(`No se encontró la reserva ${id}`);
    if (reserva.cancelada) throw new ConflictException('La reserva ya fue cancelada');

    let guardada = reserva;
    if (reserva.estado_pago !== EstadoPagoReserva.APROBADO) {
      reserva.estado_pago = EstadoPagoReserva.APROBADO;
      reserva.fecha_pago = fechaPago;
      reserva.pago_vencimiento = null;
      reserva.codigo_alojamiento = this.generarCodigoAlojamiento();
      reserva.codigo_generado_en = new Date();
      reserva.codigo_validado_en = null;
      reserva.intentos_codigo = 0;
      reserva.estado_liquidacion = EstadoLiquidacionReserva.RETENIDO;
      guardada = await this.reservaRepository.guardar(reserva);
    }

    const titulo = reserva.publicacion?.titulo ?? 'Alojamiento';
    // PostgreSQL/TypeORM entrega las columnas `date` como strings aunque la
    // entidad las declare Date. Normalizarlas evita que falle el armado del
    // correo después de que el pago ya quedó aprobado.
    const inicio = normalizarFechaReserva(reserva.fecha_inicio);
    const fin = reserva.fecha_fin ? normalizarFechaReserva(reserva.fecha_fin) : inicio;
    const cantidadDias = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const nombreInquilino = `${reserva.usuario_nombre ?? ''} ${reserva.usuario_apellido ?? ''}`.trim();
    const anunciante = reserva.publicacion?.anunciante;
    const usuarioAnunciante = anunciante?.usuario;
    const emailAnunciante = usuarioAnunciante?.email;
    const nombreAnunciante = `${usuarioAnunciante?.nombre ?? ''} ${usuarioAnunciante?.apellido ?? ''}`.trim() || 'Anfitrión';
    const direccion = [
      reserva.publicacion?.direccion,
      reserva.publicacion?.ciudad?.nombre,
      reserva.publicacion?.provincia?.nombre,
    ].filter(Boolean).join(', ');
    const datosComunes = {
      idReserva: reserva.id,
      titulo,
      direccion,
      fechaInicio: inicio,
      fechaFin: fin,
      cantidadDias,
      monto: Number(reserva.monto_pago),
      moneda: reserva.publicacion?.tipoMoneda?.nombre ?? 'ARS',
    };
    const notificaciones = [
      ...(reserva.usuario_email && !reserva.email_confirmacion_inquilino_enviado
        ? [{ tipo: 'inquilino', enviar: () => this.mailService.enviarReservaConfirmada(reserva.usuario_email!, {
          ...datosComunes,
          nombreDestinatario: nombreInquilino || 'Huésped',
          nombreContraparte: nombreAnunciante,
          emailContraparte: usuarioAnunciante?.email,
          telefonoContraparte: anunciante?.numero_contacto ?? usuarioAnunciante?.telefono,
        }) }]
        : []),
      ...(emailAnunciante && !reserva.email_nueva_reserva_anunciante_enviado
        ? [{ tipo: 'anunciante', enviar: () => this.mailService.enviarNuevaReserva(emailAnunciante, {
          ...datosComunes,
          nombreDestinatario: nombreAnunciante,
          nombreContraparte: nombreInquilino || 'Huésped',
          emailContraparte: reserva.usuario_email,
          telefonoContraparte: reserva.usuario_telefono,
        }) }]
        : []),
    ];
    const resultados = await Promise.allSettled(notificaciones.map((notificacion) => notificacion.enviar()));
    let huboCambios = false;
    let huboErrores = false;
    resultados.forEach((resultado, indice) => {
      if (resultado.status === 'rejected') {
        huboErrores = true;
        this.logger.error(`No se pudo enviar la notificación de reserva al ${notificaciones[indice].tipo}`, resultado.reason);
        return;
      }
      huboCambios = true;
      if (notificaciones[indice].tipo === 'inquilino') {
        reserva.email_confirmacion_inquilino_enviado = true;
      } else {
        reserva.email_nueva_reserva_anunciante_enviado = true;
      }
    });
    if (huboCambios) guardada = await this.reservaRepository.guardar(reserva);
    if (huboErrores) {
      // Un 5xx hace que Mercado Pago vuelva a notificar. Como los éxitos quedan
      // registrados, el próximo intento envía únicamente los correos pendientes.
      throw new ServiceUnavailableException('El pago fue aprobado, pero quedó una notificación por correo pendiente');
    }

    return guardada;
  }

  /** Cierra una reserva cuyo pago falló o cuya preferencia no pudo crearse. */
  async rechazarPago(
    id: number,
    estado: EstadoPagoReserva = EstadoPagoReserva.RECHAZADO,
  ): Promise<Reserva> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva) throw new NotFoundException(`No se encontró la reserva ${id}`);
    if (reserva.estado_pago === EstadoPagoReserva.APROBADO) return reserva;
    if (reserva.cancelada && reserva.estado_pago === estado) return reserva;

    reserva.estado_pago = estado;
    reserva.estado_liquidacion = estado === EstadoPagoReserva.REEMBOLSADO
      ? EstadoLiquidacionReserva.DEVUELTO_INQUILINO
      : EstadoLiquidacionReserva.NO_APLICA;
    reserva.cancelada = true;
    reserva.fecha_cancelacion = new Date();
    reserva.pago_vencimiento = null;
    const guardada = await this.reservaRepository.guardar(reserva);
    await this.disponibilidadService.liberarReserva(id);
    return guardada;
  }

  /**
   * Historial de reservas del inquilino logueado.
   */
  async listarPorUsuario(idUsuario: number): Promise<Reserva[]> {
    return this.reservaRepository.buscarPorUsuario(idUsuario);
  }

  /**
   * Reservas recibidas sobre una publicación puntual, para que el
   * anunciante vea quién reservó su propiedad.
   */
  async listarPorPublicacion(idPublicacion: number, idUsuarioQueOpera: number): Promise<Reserva[]> {
    const publicacion = await this.publicacionesService.buscarPorId(idPublicacion);
    if (publicacion.anunciante?.idUsuario !== idUsuarioQueOpera) {
      throw new ForbiddenException('No tenés permiso para consultar las reservas de esta publicación');
    }
    return this.reservaRepository.buscarPorPublicacion(idPublicacion);
  }

  /** Todas las reservas recibidas por publicaciones del anunciante autenticado. */
  async listarRecibidasPorAnunciante(idUsuarioAnunciante: number): Promise<Reserva[]> {
    return this.reservaRepository.buscarRecibidasPorAnunciante(idUsuarioAnunciante);
  }

  async existeReservaAprobada(idPublicacion: number, idUsuarioInquilino: number): Promise<boolean> {
    return this.reservaRepository.existeAprobada(idPublicacion, idUsuarioInquilino);
  }

  /**
   * El detalle de una reserva solo corresponde al inquilino que la realizó o
   * al anunciante dueño de la publicación. Así no basta un JWT y un ID válido.
   */
  async buscarPorId(id: number, idUsuarioQueOpera: number): Promise<Reserva> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva) throw new NotFoundException(`No se encontró la reserva ${id}`);
    this.verificarParticipanteOPropietario(reserva, idUsuarioQueOpera);
    return reserva;
  }

  /** Devuelve el código únicamente al inquilino que realizó la reserva. */
  async consultarCodigoAlojamiento(id: number, idUsuario: number) {
    const reserva = await this.reservaRepository.buscarPorIdConCodigo(id);
    if (!reserva) throw new NotFoundException(`No se encontró la reserva ${id}`);
    if (reserva.usuario?.id !== idUsuario) {
      throw new ForbiddenException('Solo el inquilino puede consultar el código de alojamiento');
    }
    if (reserva.estado_pago !== EstadoPagoReserva.APROBADO || reserva.cancelada) {
      throw new ConflictException('El código estará disponible cuando el pago se encuentre aprobado');
    }
    if (!reserva.codigo_alojamiento) {
      // Compatibilidad con reservas aprobadas antes de incorporar RF21.
      reserva.codigo_alojamiento = this.generarCodigoAlojamiento();
      reserva.codigo_generado_en = new Date();
      reserva.estado_liquidacion = EstadoLiquidacionReserva.RETENIDO;
      await this.reservaRepository.guardar(reserva);
    }
    return {
      reserva_id: reserva.id,
      codigo: reserva.codigo_alojamiento,
      generado_en: reserva.codigo_generado_en,
      validado_en: reserva.codigo_validado_en,
      estado_liquidacion: reserva.estado_liquidacion,
    };
  }

  /** El anunciante presenta el código entregado físicamente por el huésped. */
  async validarCodigoAlojamiento(id: number, codigo: string, idUsuarioAnunciante: number): Promise<Reserva> {
    const reserva = await this.reservaRepository.buscarPorIdConCodigo(id);
    if (!reserva) throw new NotFoundException(`No se encontró la reserva ${id}`);
    if (reserva.publicacion?.anunciante?.idUsuario !== idUsuarioAnunciante) {
      throw new ForbiddenException('Solo el anunciante de la publicación puede validar el código');
    }
    if (reserva.estado_pago !== EstadoPagoReserva.APROBADO || reserva.cancelada) {
      throw new ConflictException('La reserva no se encuentra confirmada');
    }
    if (reserva.codigo_validado_en) {
      throw new ConflictException('El código de esta reserva ya fue utilizado');
    }
    if (reserva.estado_liquidacion === EstadoLiquidacionReserva.EN_REVISION) {
      throw new ConflictException('La reserva tiene un reclamo abierto y debe revisarla un administrador');
    }
    if (reserva.intentos_codigo >= 5) {
      throw new ConflictException('Se alcanzó el límite de intentos. Contactá a un administrador');
    }

    const recibido = codigo.trim().toUpperCase();
    const esperado = reserva.codigo_alojamiento ?? '';
    const coincide = recibido.length === esperado.length
      && timingSafeEqual(Buffer.from(recibido), Buffer.from(esperado));
    if (!coincide) {
      reserva.intentos_codigo += 1;
      if (reserva.intentos_codigo >= 5) {
        reserva.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
        reserva.observacion_liquidacion = 'Código bloqueado después de cinco intentos incorrectos';
      }
      await this.reservaRepository.guardar(reserva);
      throw new BadRequestException(`Código incorrecto. Quedan ${5 - reserva.intentos_codigo} intentos`);
    }

    reserva.codigo_validado_en = new Date();
    reserva.estado_liquidacion = EstadoLiquidacionReserva.PENDIENTE_PAGO_PROPIETARIO;
    reserva.observacion_liquidacion = 'Código de alojamiento validado por el anunciante';
    await this.reservaRepository.guardar(reserva);
    return (await this.reservaRepository.buscarPorId(id))!;
  }

  /** El reclamo del inquilino congela cualquier liquidación manual pendiente. */
  async reportarProblema(id: number, motivo: string, idUsuario: number): Promise<Reserva> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva) throw new NotFoundException(`No se encontró la reserva ${id}`);
    if (reserva.usuario?.id !== idUsuario) {
      throw new ForbiddenException('Solo el inquilino de la reserva puede reportar un problema');
    }
    if (reserva.estado_pago !== EstadoPagoReserva.APROBADO || reserva.cancelada) {
      throw new ConflictException('Solo se pueden reportar problemas sobre reservas confirmadas');
    }
    if (reserva.estado_liquidacion === EstadoLiquidacionReserva.PAGADO_PROPIETARIO
      || reserva.estado_liquidacion === EstadoLiquidacionReserva.DEVUELTO_INQUILINO) {
      throw new ConflictException('La liquidación de esta reserva ya fue resuelta');
    }
    reserva.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
    reserva.observacion_liquidacion = `Reclamo del inquilino: ${motivo.trim()}`;
    reserva.fecha_resolucion_liquidacion = null;
    return this.reservaRepository.guardar(reserva);
  }

  listarLiquidacionesAdministracion(): Promise<Reserva[]> {
    return this.reservaRepository.buscarLiquidacionesAdministracion();
  }

  /** Registra una decisión administrativa; no ejecuta movimientos de dinero reales. */
  async resolverLiquidacion(id: number, dto: ResolverLiquidacionDto): Promise<Reserva> {
    const permitidos = [
      EstadoLiquidacionReserva.PAGADO_PROPIETARIO,
      EstadoLiquidacionReserva.DEVUELTO_INQUILINO,
      EstadoLiquidacionReserva.EN_REVISION,
      EstadoLiquidacionReserva.PENDIENTE_PAGO_PROPIETARIO,
      EstadoLiquidacionReserva.RETENIDO,
    ];
    if (!permitidos.includes(dto.estado)) {
      throw new BadRequestException('El estado solicitado no es una resolución administrativa válida');
    }
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva) throw new NotFoundException(`No se encontró la reserva ${id}`);
    if (reserva.estado_pago !== EstadoPagoReserva.APROBADO) {
      throw new ConflictException('La reserva no posee un pago aprobado para liquidar');
    }
    if (dto.estado === EstadoLiquidacionReserva.PAGADO_PROPIETARIO && !reserva.codigo_validado_en) {
      throw new ConflictException('No se puede registrar el pago al propietario sin validar el código');
    }
    reserva.estado_liquidacion = dto.estado;
    reserva.referencia_liquidacion = dto.referencia?.trim() || null;
    reserva.observacion_liquidacion = dto.observacion?.trim() || reserva.observacion_liquidacion;
    reserva.fecha_resolucion_liquidacion = [
      EstadoLiquidacionReserva.PAGADO_PROPIETARIO,
      EstadoLiquidacionReserva.DEVUELTO_INQUILINO,
    ].includes(dto.estado) ? new Date() : null;
    if (dto.estado === EstadoLiquidacionReserva.RETENIDO) {
      reserva.intentos_codigo = 0;
    }
    if (dto.estado === EstadoLiquidacionReserva.DEVUELTO_INQUILINO) {
      reserva.estado_pago = EstadoPagoReserva.REEMBOLSADO;
      reserva.cancelada = true;
      reserva.fecha_cancelacion = new Date();
      await this.disponibilidadService.liberarReserva(reserva.id);
    }
    return this.reservaRepository.guardar(reserva);
  }

  /**
   * Marca la reserva como finalizada (ej: terminó la estadía).
   * No libera las fechas: quedan como historial de que ese período
   * ya fue efectivamente ocupado.
   */
  async finalizar(id: number, idUsuarioQueOpera: number): Promise<Reserva> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva) throw new NotFoundException(`No se encontró la reserva ${id}`);

    // Finalizar es una acción de gestión de la estadía; la realiza el
    // anunciante dueño. El inquilino puede consultar su propia reserva.
    if (reserva.publicacion?.anunciante?.idUsuario !== idUsuarioQueOpera) {
      throw new ForbiddenException('Solo el anunciante de la publicación puede finalizar la reserva');
    }
    if (reserva.cancelada) throw new BadRequestException('No se puede finalizar una reserva cancelada');
    if (reserva.estado_pago !== EstadoPagoReserva.APROBADO) {
      throw new BadRequestException('No se puede finalizar una reserva cuyo pago no fue aprobado');
    }
    if (!reserva.codigo_validado_en) {
      throw new BadRequestException('No se puede finalizar la estadía antes de validar el código de alojamiento');
    }
    reserva.finalizada = true;
    return this.reservaRepository.guardar(reserva);
  }

  /** El inquilino participante o el anunciante dueño pueden cancelar. */
  async cancelar(id: number, idUsuarioQueOpera: number): Promise<Reserva> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva) throw new NotFoundException(`No se encontró la reserva ${id}`);
    this.verificarParticipanteOPropietario(reserva, idUsuarioQueOpera);
    if (reserva.finalizada) throw new BadRequestException('No se puede cancelar una reserva finalizada');
    if (reserva.cancelada) return reserva;
    if (reserva.estado_pago === EstadoPagoReserva.APROBADO) {
      throw new BadRequestException(
        'La reserva está pagada. Primero debe implementarse y procesarse su devolución en Mercado Pago.',
      );
    }

    reserva.cancelada = true;
    reserva.fecha_cancelacion = new Date();
    const guardada = await this.reservaRepository.guardar(reserva);
    await this.disponibilidadService.liberarReserva(reserva.id);
    return guardada;
  }

  /** El inquilino puede cambiar sus fechas si el nuevo rango sigue libre. */
  async actualizarFechas(
    id: number,
    dto: ActualizarFechasReservaDto,
    idUsuarioQueOpera: number,
  ): Promise<Reserva> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva) throw new NotFoundException(`No se encontró la reserva ${id}`);
    if (reserva.usuario?.id !== idUsuarioQueOpera) {
      throw new ForbiddenException('Solo el inquilino que realizó la reserva puede cambiar sus fechas');
    }
    if (reserva.cancelada || reserva.finalizada) {
      throw new BadRequestException('No se pueden modificar las fechas de una reserva cerrada');
    }
    if (reserva.estado_pago !== EstadoPagoReserva.APROBADO) {
      throw new BadRequestException('No se pueden modificar las fechas hasta que el pago esté aprobado');
    }
    if (!reserva.publicacion) throw new BadRequestException('La publicación de la reserva ya no está disponible');

    const inicio = new Date(dto.fecha_inicio);
    const fin = new Date(dto.fecha_fin);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (inicio > fin || inicio < hoy || fin < hoy) {
      throw new BadRequestException('El nuevo rango de fechas no es válido');
    }
    const disponible = await this.disponibilidadService.reprogramarReserva(reserva.publicacion.id, inicio, fin, reserva.id);
    if (!disponible) throw new ConflictException('El nuevo rango de fechas no está disponible');

    const dias = Math.floor((fin.getTime() - inicio.getTime()) / 86_400_000) + 1;
    reserva.fecha_inicio = inicio;
    reserva.fecha_fin = fin;
    reserva.monto_pago = Number((Number(reserva.publicacion.precio) * dias).toFixed(2));
    return this.reservaRepository.guardar(reserva);
  }

  private verificarParticipanteOPropietario(reserva: Reserva, idUsuarioQueOpera: number): void {
    const esInquilino = reserva.usuario?.id === idUsuarioQueOpera;
    const esAnunciante = reserva.publicacion?.anunciante?.idUsuario === idUsuarioQueOpera;
    if (!esInquilino && !esAnunciante) {
      throw new ForbiddenException('No tenés permiso para consultar esta reserva');
    }
  }

  private admiteReservaPorFecha(modalidad?: Modalidad): boolean {
    if (modalidad?.permite_reservas_por_fecha !== null && modalidad?.permite_reservas_por_fecha !== undefined) {
      return modalidad.permite_reservas_por_fecha;
    }
    return /tempor|diari/i.test(modalidad?.nombre ?? '');
  }

  private generarCodigoAlojamiento(): string {
    const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = randomBytes(8);
    return Array.from(bytes, (byte) => alfabeto[byte % alfabeto.length]).join('');
  }

  private async liberarPendientesVencidas(): Promise<void> {
    const vencidas = await this.reservaRepository.buscarPendientesVencidas(new Date());
    for (const reserva of vencidas) {
      await this.rechazarPago(reserva.id, EstadoPagoReserva.CANCELADO);
    }
  }
}
