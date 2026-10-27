import {
  decimalEntero,
  importeTexto,
  monedaPublicacion,
} from '../../common/utils/importes';
import type { CondicionesCobro } from '../interfaces/condiciones-cobro.interface';
import { CotizacionDolar } from '../../cotizaciones/entity/cotizacion-dolar.entity';
import { ConfigService } from '@nestjs/config';
import { TRANSACCION_CALENDARIO } from '../../disponibilidad/repository/transaccion-calendario.interface';
import type { ITransaccionCalendario } from '../../disponibilidad/repository/transaccion-calendario.interface';
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
    private readonly config: ConfigService,
    @Inject(TRANSACCION_CALENDARIO)
    private readonly transaccion: ITransaccionCalendario,
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
   * La validación del calendario, la reserva y sus fechas se confirman
   * en una única transacción, con el calendario bloqueado.
   */
  async crearPendiente(
    dto: CrearReservaDto,
    idUsuario: number,
    condiciones?: CondicionesCobro,
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
    let moneda: 'ARS' | 'USD', original: string;
    try {
      moneda = monedaPublicacion(publicacion.tipoMoneda?.nombre);
      original = importeTexto(
        decimalEntero(publicacion.precio, 2) * BigInt(cantidadDias),
      );
      if (decimalEntero(original, 2) <= 0n)
        throw new Error('El precio debe ser mayor a cero');
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Precio inválido',
      );
    }
    if ((this.config.get<string>('MP_CURRENCY_ID') ?? 'ARS') !== 'ARS') {
      throw new BadRequestException(
        'Esta integración solo admite cobros en ARS',
      );
    }
    if (moneda === 'USD' && !condiciones)
      throw new BadRequestException(
        'Primero debés cotizar y aceptar la conversión a pesos',
      );
    if (
      condiciones &&
      (condiciones.moneda_origen !== moneda ||
        condiciones.total_origen !== original ||
        condiciones.precio_unitario_origen !==
          importeTexto(decimalEntero(publicacion.precio, 2)))
    ) {
      throw new ConflictException(
        'El precio o la moneda cambiaron. Solicitá un nuevo presupuesto.',
      );
    }
    const precioDiario = Number(publicacion.precio);
    const montoCalculado = Number(condiciones?.total_cobro ?? original);

    const usuario = await this.usuariosService.buscarPorId(idUsuario);
    if (!usuario) {
      throw new NotFoundException(
        'No se encontró el usuario que realiza la reserva',
      );
    }

    // Una preferencia vencida no debe dejar bloqueado el calendario para siempre.
    await this.liberarPendientesVencidas();

    return this.transaccion.ejecutar(
      async ({ reservas: reservaRepository, fechas: fechaRepository }) => {
        await fechaRepository.bloquearPublicacion(dto.id_publicacion);
        const actual = await reservaRepository.buscarCondicionesPublicacion(
          dto.id_publicacion,
        );
        let monedaActual: 'ARS' | 'USD' | undefined;
        try {
          monedaActual = monedaPublicacion(actual?.tipoMoneda?.nombre);
        } catch {
          monedaActual = undefined;
        }
        if (
          !actual?.activa ||
          Number(actual.precio) !== precioDiario ||
          monedaActual !== moneda
        ) {
          throw new ConflictException(
            'La publicación cambió. Volvé a cotizar antes de pagar.',
          );
        }
        if (
          condiciones &&
          new Date(condiciones.vence_en).getTime() <= Date.now()
        ) {
          throw new ConflictException(
            'El presupuesto venció. Volvé a cotizar antes de pagar.',
          );
        }
        // Delegamos la pregunta "¿está libre este rango?" al módulo que es
        // dueño de esa lógica (Disponibilidad), en vez de duplicarla acá
        const disponible =
          await this.disponibilidadService.verificarDisponibilidad(
            dto.id_publicacion,
            inicio,
            fin,
            fechaRepository,
          );

        if (!disponible) {
          throw new ConflictException(
            'El rango de fechas seleccionado no está disponible',
          );
        }

        // Las relaciones se crean con solo el ID: TypeORM puede resolver las FK sin cargar entidades completas.
        const reserva = reservaRepository.crear({
          finalizada: false,
          cancelada: false,
          fecha_cancelacion: null,
          monto_pago: montoCalculado,
          precio_unitario_contratado: precioDiario,
          importe_contratado: montoCalculado,
          moneda_contratada: 'ARS',
          moneda_origen: moneda,
          importe_origen: Number(original),
          cotizacion_dolar: condiciones?.cotizacion_id
            ? Object.assign(new CotizacionDolar(), {
                id: condiciones.cotizacion_id,
              })
            : null,
          cotizacion_aceptada_en: condiciones ? new Date() : null,
          presupuesto_emitido_en: condiciones
            ? new Date(condiciones.emitida_en)
            : null,
          presupuesto_vence_en: condiciones
            ? new Date(condiciones.vence_en)
            : null,
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
          pago_vencimiento: condiciones
            ? new Date(condiciones.vence_en)
            : new Date(Date.now() + 15 * 60 * 1000),
          fecha_inicio: inicio.toISOString().slice(0, 10),
          fecha_fin: fin.toISOString().slice(0, 10),
          usuario_nombre: usuario.nombre,
          usuario_apellido: usuario.apellido,
          usuario_email: usuario.email,
          usuario_telefono: usuario.telefono,
          usuario,
          publicacion,
        });

        // Persistimos la reserva primero para obtener su ID antes de asociarlo a las fechas.
        const reservaGuardada = await reservaRepository.guardar(reserva);

        // Primero se guarda la reserva para no enlazar fechas a una reserva sin ID.
        await this.disponibilidadService.marcarComoReservadas(
          dto.id_publicacion,
          inicio,
          fin,
          reservaGuardada.id,
          fechaRepository,
        );

        return reservaGuardada;
      },
    );
  }

  /** Confirma la reserva únicamente después de verificar el pago con Mercado Pago. */
  async confirmarPago(id: number, fechaPago: Date): Promise<Reserva> {
    const guardada = await this.transaccion.ejecutar(
      async ({ reservas: reservaRepository }) => {
        const reserva = await reservaRepository.buscarPorId(id);
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
          guardada = await reservaRepository.guardar(reserva);
        }

        return guardada;
      },
    );
    await this.notificacionesService.enviarConfirmacion(guardada);
    return guardada;
  }

  /** Cierra una reserva cuyo pago falló o cuya preferencia no pudo crearse. */
  async rechazarPago(
    id: number,
    estado: EstadoPagoReserva = EstadoPagoReserva.RECHAZADO,
  ): Promise<Reserva> {
    return this.transaccion.ejecutar(
      async ({ reservas: reservaRepository, fechas: fechaRepository }) => {
        const reserva = await reservaRepository.buscarPorId(id);
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
        const guardada = await reservaRepository.guardar(reserva);
        await this.disponibilidadService.liberarReserva(id, fechaRepository);
        return guardada;
      },
    );
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
    return this.transaccion.ejecutar(
      async ({ reservas: reservaRepository }) => {
        const reserva = await reservaRepository.buscarPorId(id);
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
        return reservaRepository.guardar(reserva);
      },
    );
  }

  /** El inquilino participante o el anunciante dueño pueden cancelar. */
  async cancelar(id: number, idUsuarioQueOpera: number): Promise<Reserva> {
    return this.transaccion.ejecutar(
      async ({ reservas: reservaRepository, fechas: fechaRepository }) => {
        const reserva = await reservaRepository.buscarPorId(id);
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
        const guardada = await reservaRepository.guardar(reserva);
        await this.disponibilidadService.liberarReserva(
          reserva.id,
          fechaRepository,
        );
        return guardada;
      },
    );
  }

  /** El inquilino puede cambiar sus fechas si el nuevo rango sigue libre. */
  async actualizarFechas(
    id: number,
    dto: ActualizarFechasReservaDto,
    idUsuarioQueOpera: number,
  ): Promise<Reserva> {
    const idCambio = await this.transaccion.ejecutar(
      async ({ reservas: reservaRepository, fechas: fechaRepository }) => {
        const reserva = await reservaRepository.buscarPorId(id);
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
        if (
          !reserva.fecha_inicio ||
          !reserva.fecha_fin ||
          reserva.importe_contratado == null ||
          !reserva.moneda_contratada
        ) {
          throw new ConflictException(
            'La reserva requiere revisar sus condiciones originales antes de reprogramar. Contactá a soporte.',
          );
        }
        if (
          Math.abs(
            Number(reserva.monto_pago) - Number(reserva.importe_contratado),
          ) > 0.009
        ) {
          throw new ConflictException(
            'El importe registrado no coincide con el contratado. Contactá a soporte antes de reprogramar.',
          );
        }
        const inicio = new Date(dto.fecha_inicio);
        const fin = new Date(dto.fecha_fin);
        const hoy = new Date();
        const hoyTexto = [
          hoy.getFullYear(),
          String(hoy.getMonth() + 1).padStart(2, '0'),
          String(hoy.getDate()).padStart(2, '0'),
        ].join('-');
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(dto.fecha_inicio) ||
          !/^\d{4}-\d{2}-\d{2}$/.test(dto.fecha_fin) ||
          !Number.isFinite(inicio.getTime()) ||
          !Number.isFinite(fin.getTime()) ||
          inicio.toISOString().slice(0, 10) !== dto.fecha_inicio ||
          fin.toISOString().slice(0, 10) !== dto.fecha_fin ||
          inicio > fin ||
          dto.fecha_inicio < hoyTexto
        ) {
          throw new BadRequestException(
            'El nuevo rango de fechas no es válido',
          );
        }
        const diasOriginales =
          Math.floor(
            (new Date(reserva.fecha_fin).getTime() -
              new Date(reserva.fecha_inicio).getTime()) /
              86400000,
          ) + 1;
        const diasNuevos =
          Math.floor((fin.getTime() - inicio.getTime()) / 86400000) + 1;
        if (
          !Number.isSafeInteger(diasOriginales) ||
          diasOriginales < 1 ||
          diasNuevos !== diasOriginales
        ) {
          throw new BadRequestException(
            'La reprogramación debe conservar la misma cantidad de días y el importe pagado',
          );
        }
        // Repetir la misma solicitud no genera otro cambio ni otro aviso.
        if (
          dto.fecha_inicio === reserva.fecha_inicio &&
          dto.fecha_fin === reserva.fecha_fin
        ) {
          return (
            (reserva.reprogramaciones ?? [])
              .filter(
                (c) =>
                  c.fecha_inicio_nueva === dto.fecha_inicio &&
                  c.fecha_fin_nueva === dto.fecha_fin,
              )
              .sort((a, b) => b.id - a.id)[0]?.id ?? null
          );
        }
        const disponible = await this.disponibilidadService.reprogramarReserva(
          reserva.publicacion.id,
          inicio,
          fin,
          reserva.id,
          fechaRepository,
        );
        if (!disponible)
          throw new ConflictException(
            'El nuevo rango de fechas no está disponible',
          );
        const anteriorInicio = reserva.fecha_inicio;
        const anteriorFin = reserva.fecha_fin;
        reserva.fecha_inicio = dto.fecha_inicio;
        reserva.fecha_fin = dto.fecha_fin;
        await reservaRepository.guardar(reserva);
        const propietario = reserva.publicacion.anunciante?.usuario;
        const cambio = await reservaRepository.guardarReprogramacion({
          reserva,
          fecha_inicio_anterior: anteriorInicio,
          fecha_fin_anterior: anteriorFin,
          fecha_inicio_nueva: dto.fecha_inicio,
          fecha_fin_nueva: dto.fecha_fin,
          destinatario: propietario?.email ?? null,
          notificada_en: null,
          detalle: {
            conversion:
              reserva.cotizacion_dolar &&
              reserva.importe_origen != null &&
              reserva.moneda_origen
                ? {
                    importeOrigen: Number(reserva.importe_origen),
                    monedaOrigen: reserva.moneda_origen,
                    cotizacionVenta: Number(reserva.cotizacion_dolar.venta),
                    fechaFuente: new Date(
                      reserva.cotizacion_dolar.actualizada_fuente_en,
                    ).toISOString(),
                    proveedor: reserva.cotizacion_dolar.proveedor,
                  }
                : undefined,
            idReserva: reserva.id,
            titulo: reserva.publicacion.titulo,
            nombreAnunciante:
              [propietario?.nombre, propietario?.apellido]
                .filter(Boolean)
                .join(' ') || 'Anfitrión',
            nombreInquilino:
              [reserva.usuario_nombre, reserva.usuario_apellido]
                .filter(Boolean)
                .join(' ') || 'Inquilino',
            inicioAnterior: anteriorInicio,
            finAnterior: anteriorFin,
            inicioNuevo: dto.fecha_inicio,
            finNuevo: dto.fecha_fin,
            cantidadDias: diasOriginales,
            monto: Number(reserva.importe_contratado),
            moneda: reserva.moneda_contratada,
          },
        });
        return cambio.id;
      },
    );
    // El correo usa su propia transacción y nunca mantiene bloqueado el calendario.
    if (idCambio)
      await this.notificacionesService.enviarReprogramacion(idCambio, id);
    const actualizada = await this.reservaRepository.buscarPorId(id);
    if (!actualizada)
      throw new NotFoundException(`No se encontró la reserva ${id}`);
    return actualizada;
  }

  async reintentarAvisoReprogramacion(
    id: number,
    idCambio: number,
    idUsuario: number,
  ): Promise<Reserva> {
    const reserva = await this.buscarPorId(id, idUsuario);
    this.verificarParticipanteOPropietario(reserva, idUsuario);
    await this.notificacionesService.enviarReprogramacion(idCambio, id);
    return this.buscarPorId(id, idUsuario);
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
