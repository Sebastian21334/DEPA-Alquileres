import { DisponibilidadService } from '../../disponibilidad/service/disponibilidad.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { conversionContratada, nombreInquilinoReserva } from './reservas.utils';
import { TOLERANCIA_MONETARIA } from '../../common/utils/dinero';
import { diasInclusivos, diasDeAntelacion, esFechaCalendarioValida, fechaArgentina } from '../../common/utils/fechas';
import { ActualizarFechasReservaDto } from '../dto/actualizar-fechas-reserva.dto';
import { Reserva } from '../entity/reserva.entity';
import {
  RESERVA_REPOSITORY,
  type IReservaRepository,
} from '../repository/reserva.repository.interface';
import { ReservaNotificacionesService } from './reserva-notificaciones.service';
import { ReservasService } from './reservas.service';
import { AnunciantesService } from '../../anunciantes/service/anunciantes.service';

const DIAS_MINIMOS_REPROGRAMACION = 6;

@Injectable()
export class ReservaReprogramacionService {
  constructor(@Inject(RESERVA_REPOSITORY) private readonly reservaRepository: IReservaRepository, private readonly disponibilidadService: DisponibilidadService, private readonly notificacionesService: ReservaNotificacionesService, private readonly reservasService: ReservasService, private readonly anunciantesService: AnunciantesService) {}

  /** Devuelve el calendario para que el inquilino de la reserva consulte posibles fechas de reprogramación. */
  async listarFechasDisponibles(id: number, idUsuario: number) {
    const reserva = await this.reservasService.buscarPorId(id, idUsuario);
    if (!this.reservasService.esDelInquilino(reserva, idUsuario)) {
      throw new ForbiddenException('Solo el inquilino puede consultar fechas para reprogramar');
    }
    if (!reserva.publicacion) {
      throw new BadRequestException('La publicación de la reserva ya no está disponible');
    }
    return this.disponibilidadService.listarParaReprogramacion(reserva.publicacion.id, reserva.id);
  }

  /** El inquilino puede cambiar sus fechas si el nuevo rango sigue libre. */
  async actualizarFechas(id: number, dto: ActualizarFechasReservaDto, idUsuarioQueOpera: number): Promise<Reserva> {
    const idCambio = await this.reservaRepository.conTransaccion(
      async (reservaRepository, transaccion) => {
        const reserva = await reservaRepository.buscarPorId(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        this.validarQueSePuedeReprogramar(reserva, idUsuarioQueOpera);
        const condiciones = this.obtenerCondicionesOriginales(reserva);
        const { inicio, fin } = this.validarNuevasFechas(dto, condiciones.dias);
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
          condiciones.publicacion.id,
          inicio,
          fin,
          reserva.id,
          transaccion,
        );
        if (!disponible)
          throw new ConflictException(
            'El nuevo rango de fechas no está disponible',
          );
        const { inicio: anteriorInicio, fin: anteriorFin } = condiciones;
        reserva.fecha_inicio = dto.fecha_inicio;
        reserva.fecha_fin = dto.fecha_fin;
        await reservaRepository.guardar(reserva);
        const contactoAnunciante = this.anunciantesService.datosContacto(
          condiciones.publicacion.anunciante,
        );
        const cambio = await reservaRepository.guardarReprogramacion({
          reserva,
          fecha_inicio_anterior: anteriorInicio,
          fecha_fin_anterior: anteriorFin,
          fecha_inicio_nueva: dto.fecha_inicio,
          fecha_fin_nueva: dto.fecha_fin,
          destinatario: contactoAnunciante.email ?? null,
          notificada_en: null,
          detalle: {
            conversion: conversionContratada(reserva),
            idReserva: reserva.id,
            titulo: condiciones.publicacion.titulo,
            nombreAnunciante: contactoAnunciante.nombre || 'Anfitrión',
            nombreInquilino: nombreInquilinoReserva(reserva) || 'Inquilino',
            inicioAnterior: anteriorInicio,
            finAnterior: anteriorFin,
            inicioNuevo: dto.fecha_inicio,
            finNuevo: dto.fecha_fin,
            cantidadDias: condiciones.dias,
            monto: condiciones.importe,
            moneda: condiciones.moneda,
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
    return this.reservasService.prepararRespuesta(actualizada);
  }

  /** Comprueba la identidad del inquilino y que el pago, la estadía y la liquidación permitan reprogramar. */
  private validarQueSePuedeReprogramar(reserva: Reserva, idUsuarioQueOpera: number): void {
    if (!this.reservasService.esDelInquilino(reserva, idUsuarioQueOpera)) {
      throw new ForbiddenException(
        'Solo el inquilino que realizó la reserva puede cambiar sus fechas',
      );
    }
    // Una estadía terminada por fecha también cuenta como cerrada.
    const estadoEstadia = this.reservasService.calcularEstadoEstadia(reserva);
    if (reserva.cancelada || estadoEstadia === 'FINALIZADA') {
      throw new BadRequestException(
        'No se pueden modificar las fechas de una reserva cerrada',
      );
    }
    if (!this.reservasService.pagoAprobado(reserva)) {
      throw new BadRequestException(
        'No se pueden modificar las fechas hasta que el pago esté aprobado',
      );
    }
    if (
      estadoEstadia !== 'CONFIRMADA' ||
      this.reservasService.codigoValidado(reserva)
    ) {
      throw new BadRequestException(
        'Solo se pueden reprogramar reservas antes del inicio de la estadía y sin ingreso validado',
      );
    }
    if (this.reservasService.liquidacionEnRevision(reserva)) {
      throw new BadRequestException(
        'No se puede reprogramar una reserva con un reclamo o liquidación en revisión',
      );
    }
    if (this.reservasService.liquidacionResuelta(reserva)) {
      throw new BadRequestException(
        'No se puede reprogramar una reserva con una liquidación resuelta',
      );
    }
  }

  /** Recupera las condiciones pagadas y rechaza reservas históricas cuyos datos requieren revisión. */
  private obtenerCondicionesOriginales(reserva: Reserva) {
    if (!reserva.publicacion)
      throw new BadRequestException(
        'La publicación de la reserva ya no está disponible',
      );
    // La reserva ya está confirmada: se permite reprogramar aunque la
    // publicación esté inactiva, siempre que las fechas sigan disponibles.
    if (
      !reserva.fecha_inicio ||
      !reserva.fecha_fin ||
      reserva.precio_unitario_contratado == null ||
      reserva.importe_contratado == null ||
      !reserva.moneda_contratada ||
      !['ARS', 'USD'].includes(reserva.moneda_contratada)
    ) {
      throw new ConflictException(
        'La reserva requiere revisar sus condiciones originales antes de reprogramar. Contactá a soporte.',
      );
    }
    const precioUnitario = Number(reserva.precio_unitario_contratado);
    const importeContratado = Number(reserva.importe_contratado);
    const montoPago = Number(reserva.monto_pago);
    if (
      !Number.isFinite(precioUnitario) ||
      precioUnitario <= 0 ||
      !Number.isFinite(importeContratado) ||
      importeContratado <= 0 ||
      !Number.isFinite(montoPago) ||
      montoPago <= 0
    ) {
      throw new ConflictException(
        'La reserva requiere revisar sus condiciones originales antes de reprogramar. Contactá a soporte.',
      );
    }
    if (Math.abs(montoPago - importeContratado) > TOLERANCIA_MONETARIA) {
      throw new ConflictException(
        'El importe registrado no coincide con el contratado. Contactá a soporte antes de reprogramar.',
      );
    }
    return {
      publicacion: reserva.publicacion,
      inicio: reserva.fecha_inicio,
      fin: reserva.fecha_fin,
      importe: importeContratado,
      moneda: reserva.moneda_contratada,
      dias: diasInclusivos(new Date(reserva.fecha_inicio), new Date(reserva.fecha_fin)),
    };
  }

  /** Valida el nuevo rango y exige conservar la cantidad de días de la reserva original. */
  private validarNuevasFechas(dto: ActualizarFechasReservaDto, diasOriginales: number): { inicio: Date; fin: Date } {
    const inicio = new Date(dto.fecha_inicio);
    const fin = new Date(dto.fecha_fin);
    const hoyTexto = fechaArgentina();
    if (
      !esFechaCalendarioValida(dto.fecha_inicio) ||
      !esFechaCalendarioValida(dto.fecha_fin) ||
      inicio > fin ||
      dto.fecha_inicio < hoyTexto
    ) {
      throw new BadRequestException(
        'El nuevo rango de fechas no es válido',
      );
    }
    if (diasDeAntelacion(dto.fecha_inicio, hoyTexto) < DIAS_MINIMOS_REPROGRAMACION) {
      throw new BadRequestException(
        `La reprogramación requiere al menos ${DIAS_MINIMOS_REPROGRAMACION} días de antelación`,
      );
    }
    const diasNuevos = diasInclusivos(inicio, fin);
    if (
      !Number.isSafeInteger(diasOriginales) ||
      diasOriginales < 1 ||
      diasNuevos !== diasOriginales
    ) {
      throw new BadRequestException(
        'La reprogramación debe conservar la misma cantidad de días y el importe pagado',
      );
    }
    return { inicio, fin };
  }

  /** Reintenta el correo de un cambio de fechas accesible para el usuario y devuelve la reserva actualizada. */
  async reintentarAvisoReprogramacion(id: number, idCambio: number, idUsuario: number): Promise<Reserva> {
    await this.reservasService.buscarPorId(id, idUsuario);
    await this.notificacionesService.enviarReprogramacion(idCambio, id);
    return this.reservasService.buscarPorId(id, idUsuario);
  }
}
