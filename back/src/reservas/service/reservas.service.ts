import { ReservaNotificacionesService } from './reserva-notificaciones.service';
import { generarCodigoAlojamiento } from './reservas.utils';
import { admiteReservaPorFecha } from '../../catalogos/service/modalidad.utils';
import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { EstadoPagoReserva, Reserva } from '../entity/reserva.entity';
import { CrearReservaDto } from '../dto/crear-reserva.dto';
import { ActualizarFechasReservaDto } from '../dto/actualizar-fechas-reserva.dto';
import { DisponibilidadService } from '../../disponibilidad/service/disponibilidad.service';
import type { IReservaRepository } from '../repository/reserva.repository.interface';
import { RESERVA_REPOSITORY } from '../repository/reserva.repository.interface';
import { UsuariosService } from '../../usuarios/service/usuarios.service';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { EstadoLiquidacionReserva } from '../entity/reserva.entity';

@Injectable()
export class ReservasService {
  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly reservaRepository: IReservaRepository,
    private readonly disponibilidadService: DisponibilidadService,
    private readonly usuariosService: UsuariosService,
    private readonly publicacionesService: PublicacionesService,
    private readonly notificacionesService: ReservaNotificacionesService,
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
  async crearPendiente(
    dto: CrearReservaDto,
    idUsuario: number,
  ): Promise<Reserva> {
    // El DTO trae el rango; Reserva conserva el periodo y Fecha mantiene
    // cada dia para bloquearlo en el calendario.
    const inicio = new Date(dto.fecha_inicio);
    const fin = new Date(dto.fecha_fin);

    if (inicio > fin) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser posterior a la de fin',
      );
    }

    const publicacion = await this.publicacionesService.buscarPorId(
      dto.id_publicacion,
    );
    if (!publicacion.activa) {
      throw new BadRequestException(
        'No se puede reservar una publicación inactiva',
      );
    }
    if (publicacion.anunciante?.idUsuario === idUsuario) {
      throw new BadRequestException('No podés reservar tu propia publicación');
    }
    if (!admiteReservaPorFecha(publicacion.modalidad)) {
      throw new BadRequestException(
        'Solo las publicaciones temporales o de alquiler diario admiten reservas por fecha',
      );
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (inicio < hoy || fin < hoy) {
      throw new BadRequestException(
        'Las fechas de la reserva no pueden ser anteriores a hoy',
      );
    }
    const cantidadDias =
      Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) +
      1;
    const precioDiario = Number(publicacion.precio);
    const montoCalculado = Number((precioDiario * cantidadDias).toFixed(2));

    if (!Number.isFinite(montoCalculado) || montoCalculado < 0) {
      throw new BadRequestException(
        'No se pudo calcular el monto de la reserva',
      );
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
      throw new ConflictException(
        'El rango de fechas seleccionado no está disponible',
      );
    }

    const usuario = await this.usuariosService.buscarPorId(idUsuario);
    if (!usuario) {
      throw new NotFoundException(
        'No se encontró el usuario que realiza la reserva',
      );
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
    if (!reserva)
      throw new NotFoundException(`No se encontró la reserva ${id}`);
    if (reserva.cancelada)
      throw new ConflictException('La reserva ya fue cancelada');

    let guardada = reserva;
    if (reserva.estado_pago !== EstadoPagoReserva.APROBADO) {
      reserva.estado_pago = EstadoPagoReserva.APROBADO;
      reserva.fecha_pago = fechaPago;
      reserva.pago_vencimiento = null;
      reserva.codigo_alojamiento = generarCodigoAlojamiento();
      reserva.codigo_generado_en = new Date();
      reserva.codigo_validado_en = null;
      reserva.intentos_codigo = 0;
      reserva.estado_liquidacion = EstadoLiquidacionReserva.RETENIDO;
      guardada = await this.reservaRepository.guardar(reserva);
    }

    await this.notificacionesService.enviarConfirmacion(guardada);
    return guardada;
  }

  /** Cierra una reserva cuyo pago falló o cuya preferencia no pudo crearse. */
  async rechazarPago(
    id: number,
    estado: EstadoPagoReserva = EstadoPagoReserva.RECHAZADO,
  ): Promise<Reserva> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva)
      throw new NotFoundException(`No se encontró la reserva ${id}`);
    if (reserva.estado_pago === EstadoPagoReserva.APROBADO) return reserva;
    if (reserva.cancelada && reserva.estado_pago === estado) return reserva;

    reserva.estado_pago = estado;
    reserva.estado_liquidacion =
      estado === EstadoPagoReserva.REEMBOLSADO
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
  async listarPorPublicacion(
    idPublicacion: number,
    idUsuarioQueOpera: number,
  ): Promise<Reserva[]> {
    const publicacion =
      await this.publicacionesService.buscarPorId(idPublicacion);
    if (publicacion.anunciante?.idUsuario !== idUsuarioQueOpera) {
      throw new ForbiddenException(
        'No tenés permiso para consultar las reservas de esta publicación',
      );
    }
    return this.reservaRepository.buscarPorPublicacion(idPublicacion);
  }

  /** Todas las reservas recibidas por publicaciones del anunciante autenticado. */
  async listarRecibidasPorAnunciante(
    idUsuarioAnunciante: number,
  ): Promise<Reserva[]> {
    return this.reservaRepository.buscarRecibidasPorAnunciante(
      idUsuarioAnunciante,
    );
  }

  async existeReservaAprobada(
    idPublicacion: number,
    idUsuarioInquilino: number,
  ): Promise<boolean> {
    return this.reservaRepository.existeAprobada(
      idPublicacion,
      idUsuarioInquilino,
    );
  }

  /**
   * El detalle de una reserva solo corresponde al inquilino que la realizó o
   * al anunciante dueño de la publicación. Así no basta un JWT y un ID válido.
   */
  async buscarPorId(id: number, idUsuarioQueOpera: number): Promise<Reserva> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva)
      throw new NotFoundException(`No se encontró la reserva ${id}`);
    this.verificarParticipanteOPropietario(reserva, idUsuarioQueOpera);
    return reserva;
  }

  /**
   * Marca la reserva como finalizada (ej: terminó la estadía).
   * No libera las fechas: quedan como historial de que ese período
   * ya fue efectivamente ocupado.
   */
  async finalizar(id: number, idUsuarioQueOpera: number): Promise<Reserva> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva)
      throw new NotFoundException(`No se encontró la reserva ${id}`);

    // Finalizar es una acción de gestión de la estadía; la realiza el
    // anunciante dueño. El inquilino puede consultar su propia reserva.
    if (reserva.publicacion?.anunciante?.idUsuario !== idUsuarioQueOpera) {
      throw new ForbiddenException(
        'Solo el anunciante de la publicación puede finalizar la reserva',
      );
    }
    if (reserva.cancelada)
      throw new BadRequestException(
        'No se puede finalizar una reserva cancelada',
      );
    if (reserva.estado_pago !== EstadoPagoReserva.APROBADO) {
      throw new BadRequestException(
        'No se puede finalizar una reserva cuyo pago no fue aprobado',
      );
    }
    if (!reserva.codigo_validado_en) {
      throw new BadRequestException(
        'No se puede finalizar la estadía antes de validar el código de alojamiento',
      );
    }
    reserva.finalizada = true;
    return this.reservaRepository.guardar(reserva);
  }

  /** El inquilino participante o el anunciante dueño pueden cancelar. */
  async cancelar(id: number, idUsuarioQueOpera: number): Promise<Reserva> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva)
      throw new NotFoundException(`No se encontró la reserva ${id}`);
    this.verificarParticipanteOPropietario(reserva, idUsuarioQueOpera);
    if (reserva.finalizada)
      throw new BadRequestException(
        'No se puede cancelar una reserva finalizada',
      );
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
    if (!reserva)
      throw new NotFoundException(`No se encontró la reserva ${id}`);
    if (reserva.usuario?.id !== idUsuarioQueOpera) {
      throw new ForbiddenException(
        'Solo el inquilino que realizó la reserva puede cambiar sus fechas',
      );
    }
    if (reserva.cancelada || reserva.finalizada) {
      throw new BadRequestException(
        'No se pueden modificar las fechas de una reserva cerrada',
      );
    }
    if (reserva.estado_pago !== EstadoPagoReserva.APROBADO) {
      throw new BadRequestException(
        'No se pueden modificar las fechas hasta que el pago esté aprobado',
      );
    }
    if (!reserva.publicacion)
      throw new BadRequestException(
        'La publicación de la reserva ya no está disponible',
      );

    const inicio = new Date(dto.fecha_inicio);
    const fin = new Date(dto.fecha_fin);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (inicio > fin || inicio < hoy || fin < hoy) {
      throw new BadRequestException('El nuevo rango de fechas no es válido');
    }
    const disponible = await this.disponibilidadService.reprogramarReserva(
      reserva.publicacion.id,
      inicio,
      fin,
      reserva.id,
    );
    if (!disponible)
      throw new ConflictException(
        'El nuevo rango de fechas no está disponible',
      );

    const dias =
      Math.floor((fin.getTime() - inicio.getTime()) / 86_400_000) + 1;
    reserva.fecha_inicio = inicio;
    reserva.fecha_fin = fin;
    reserva.monto_pago = Number(
      (Number(reserva.publicacion.precio) * dias).toFixed(2),
    );
    return this.reservaRepository.guardar(reserva);
  }

  private verificarParticipanteOPropietario(
    reserva: Reserva,
    idUsuarioQueOpera: number,
  ): void {
    const esInquilino = reserva.usuario?.id === idUsuarioQueOpera;
    const esAnunciante =
      reserva.publicacion?.anunciante?.idUsuario === idUsuarioQueOpera;
    if (!esInquilino && !esAnunciante) {
      throw new ForbiddenException(
        'No tenés permiso para consultar esta reserva',
      );
    }
  }

  private async liberarPendientesVencidas(): Promise<void> {
    const vencidas = await this.reservaRepository.buscarPendientesVencidas(
      new Date(),
    );
    for (const reserva of vencidas) {
      await this.rechazarPago(reserva.id, EstadoPagoReserva.CANCELADO);
    }
  }
}
