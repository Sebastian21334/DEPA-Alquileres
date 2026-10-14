import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Reserva } from '../entity/reserva.entity';
import { RESERVA_REPOSITORY } from '../repository/reserva.repository.interface';
import type { IReservaRepository } from '../repository/reserva.repository.interface';
import { MAIL_SERVICE } from '../../mail/mail.interface';
import type { IMailService } from '../../mail/mail.interface';
import { normalizarFechaReserva } from './reservas.utils';

@Injectable()
export class ReservaNotificacionesService {
  private readonly logger = new Logger(ReservaNotificacionesService.name);
  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly reservaRepository: IReservaRepository,
    @Inject(MAIL_SERVICE) private readonly mailService: IMailService,
  ) {}

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
    const nombreInquilino =
      `${reserva.usuario_nombre ?? ''} ${reserva.usuario_apellido ?? ''}`.trim();
    const anunciante = reserva.publicacion?.anunciante;
    const usuarioAnunciante = anunciante?.usuario;
    const emailAnunciante = usuarioAnunciante?.email;
    const nombreAnunciante =
      `${usuarioAnunciante?.nombre ?? ''} ${usuarioAnunciante?.apellido ?? ''}`.trim() ||
      'Anfitrión';
    const direccion = [
      reserva.publicacion?.direccion,
      reserva.publicacion?.ciudad?.nombre,
      reserva.publicacion?.provincia?.nombre,
    ]
      .filter(Boolean)
      .join(', ');
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
        ? [
            {
              tipo: 'inquilino',
              enviar: () =>
                this.mailService.enviarReservaConfirmada(
                  reserva.usuario_email!,
                  {
                    ...datosComunes,
                    nombreDestinatario: nombreInquilino || 'Huésped',
                    nombreContraparte: nombreAnunciante,
                    emailContraparte: usuarioAnunciante?.email,
                    telefonoContraparte:
                      anunciante?.numero_contacto ??
                      usuarioAnunciante?.telefono,
                  },
                ),
            },
          ]
        : []),
      ...(emailAnunciante && !reserva.email_nueva_reserva_anunciante_enviado
        ? [
            {
              tipo: 'anunciante',
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
      if (notificaciones[indice].tipo === 'inquilino') {
        reserva.email_confirmacion_inquilino_enviado = true;
      } else {
        reserva.email_nueva_reserva_anunciante_enviado = true;
      }
    });
    if (huboCambios) await this.reservaRepository.guardar(reserva);
    if (huboErrores) {
      // Un 5xx hace que Mercado Pago vuelva a notificar. Como los éxitos quedan
      // registrados, el próximo intento envía únicamente los correos pendientes.
      throw new ServiceUnavailableException(
        'El pago fue aprobado, pero quedó una notificación por correo pendiente',
      );
    }
  }
}
