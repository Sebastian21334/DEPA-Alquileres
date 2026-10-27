import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  NotFoundException,
} from '@nestjs/common';
import { Reserva } from '../entity/reserva.entity';
import { RESERVA_REPOSITORY } from '../repository/reserva.repository.interface';
import type { IReservaRepository } from '../repository/reserva.repository.interface';
import { MAIL_SERVICE } from '../../mail/mail.interface';
import type { IMailService } from '../../mail/mail.interface';
import { normalizarFechaReserva } from './reservas.utils';
import { TRANSACCION_CALENDARIO } from '../../disponibilidad/repository/transaccion-calendario.interface';
import type { ITransaccionCalendario } from '../../disponibilidad/repository/transaccion-calendario.interface';

@Injectable()
export class ReservaNotificacionesService {
  private readonly logger = new Logger(ReservaNotificacionesService.name);
  constructor(
    @Inject(TRANSACCION_CALENDARIO)
    private readonly transaccion: ITransaccionCalendario,
    @Inject(RESERVA_REPOSITORY)
    private readonly reservaRepository: IReservaRepository,
    @Inject(MAIL_SERVICE) private readonly mailService: IMailService,
  ) {}

  async enviarReprogramacion(
    idCambio: number,
    idReserva: number,
  ): Promise<boolean> {
    try {
      return await this.transaccion.ejecutar(async ({ reservas }) => {
        // Serializa reintentos del mismo aviso sin bloquear reserva ni calendario.
        const cambio = await reservas.buscarReprogramacion(idCambio, idReserva);
        if (!cambio)
          throw new NotFoundException('Reprogramación no encontrada');
        if (cambio.notificada_en) return true;
        if (!cambio.destinatario) return false;
        await this.mailService.enviarReprogramacionReserva(
          cambio.destinatario,
          cambio.detalle,
        );
        await reservas.marcarReprogramacionNotificada(cambio.id);
        return true;
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Quedó pendiente el aviso de reprogramación ${idCambio}`,
        error,
      );
      return false;
    }
  }

  async enviarConfirmacion(reserva: Reserva): Promise<void> {
    const titulo = reserva.publicacion?.titulo ?? 'Alojamiento';
    // PostgreSQL/TypeORM entrega las columnas `date` como strings aunque la
    // entidad las declare Date. Normalizarlas evita que falle el armado del
    // correo después de que el pago ya quedó aprobado.
    const inicio = normalizarFechaReserva(reserva.fecha_inicio);
    const fin = reserva.fecha_fin
      ? normalizarFechaReserva(reserva.fecha_fin)
      : inicio;
    const cantidadDias =
      Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) +
      1;
    const nombreInquilino = reserva.nombreInquilino();
    const emailAnunciante = reserva.emailDelAnunciante();
    const nombreAnunciante = reserva.nombreDelAnunciante() || 'Anfitrión';
    const direccion = reserva.publicacion?.direccionCompleta() ?? '';
    const datosComunes = {
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
      titulo,
      direccion,
      fechaInicio: inicio,
      fechaFin: fin,
      cantidadDias,
      monto: Number(reserva.monto_pago),
      moneda:
        reserva.moneda_contratada ??
        reserva.publicacion?.nombreMoneda() ??
        'ARS',
    };
    const notificaciones = [
      ...(reserva.usuario_email && !reserva.email_confirmacion_inquilino_enviado
        ? [
            {
              tipo: 'inquilino' as const,
              enviar: () =>
                this.mailService.enviarReservaConfirmada(
                  reserva.usuario_email!,
                  {
                    ...datosComunes,
                    nombreDestinatario: nombreInquilino || 'Huésped',
                    nombreContraparte: nombreAnunciante,
                    emailContraparte: emailAnunciante,
                    telefonoContraparte:
                      reserva.publicacion?.telefonoDelAnunciante(),
                  },
                ),
            },
          ]
        : []),
      ...(emailAnunciante && !reserva.email_nueva_reserva_anunciante_enviado
        ? [
            {
              tipo: 'anunciante' as const,
              enviar: () =>
                this.mailService.enviarNuevaReserva(emailAnunciante, {
                  ...datosComunes,
                  nombreDestinatario: nombreAnunciante,
                  nombreContraparte: nombreInquilino || 'Huésped',
                  emailContraparte: reserva.usuario_email,
                  telefonoContraparte: reserva.usuario_telefono,
                }),
            },
          ]
        : []),
    ];
    const resultados = await Promise.allSettled(
      notificaciones.map((notificacion) => notificacion.enviar()),
    );
    let huboCambios = false;
    let huboErrores = false;
    resultados.forEach((resultado, indice) => {
      if (resultado.status === 'rejected') {
        huboErrores = true;
        this.logger.error(
          `No se pudo enviar la notificación de reserva al ${notificaciones[indice].tipo}`,
          resultado.reason,
        );
        return;
      }
      huboCambios = true;
      reserva.marcarAvisoEnviado(notificaciones[indice].tipo);
    });
    if (huboCambios)
      await this.reservaRepository.registrarNotificaciones(reserva.id, {
        ...(reserva.email_confirmacion_inquilino_enviado
          ? { email_confirmacion_inquilino_enviado: true }
          : {}),
        ...(reserva.email_nueva_reserva_anunciante_enviado
          ? { email_nueva_reserva_anunciante_enviado: true }
          : {}),
      });
    if (huboErrores) {
      // Un 5xx hace que Mercado Pago vuelva a notificar. Como los éxitos quedan
      // registrados, el próximo intento envía únicamente los correos pendientes.
      throw new ServiceUnavailableException(
        'El pago fue aprobado, pero quedó una notificación por correo pendiente',
      );
    }
  }
}
