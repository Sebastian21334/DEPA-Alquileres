import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Reclamo } from '../../reclamos/entity/reclamo.entity';
import type { Disputa } from '../../disputas/entity/disputa.entity';
import type { Reembolso } from '../../reembolsos/entity/reembolso.entity';
import type { Reserva } from '../../reservas/entity/reserva.entity';
import { MAIL_SERVICE, type IMailService } from '../../mail/mail.interface';
import { UsuariosService } from '../../usuarios/service/usuarios.service';

/**
 * Avisos de incidentes de reservas. Se ejecutan después de confirmar la
 * operación de dominio y nunca revierten una transacción por un fallo de mail.
 */
@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    @Inject(MAIL_SERVICE) private readonly mail: IMailService,
    private readonly usuarios: UsuariosService,
  ) {}

  async cancelacionSolicitada(reserva: Reserva, motivo: string): Promise<void> {
    await this.enviar(
      [
        this.emailAnunciante(reserva),
        ...(await this.emailsAdministradores()),
      ],
      `Solicitud de cancelación de la reserva #${reserva.id}`,
      `El Inquilino solicitó cancelar la reserva #${reserva.id}.\nMotivo: ${motivo}`,
    );
  }

  async cancelacionResuelta(
    reserva: Reserva,
    aprobada: boolean,
    motivo?: string,
  ): Promise<void> {
    const estado = aprobada ? 'aprobada' : 'rechazada';
    await this.enviar(
      [this.emailInquilino(reserva), this.emailAnunciante(reserva)],
      `Cancelación ${estado} de la reserva #${reserva.id}`,
      `La solicitud de cancelación de la reserva #${reserva.id} fue ${estado}.${
        motivo ? `\nObservación: ${motivo}` : ''
      }`,
    );
  }

  async reembolso(reembolso: Reembolso): Promise<void> {
    await this.enviar(
      [
        this.emailInquilino(reembolso.reserva),
        ...(await this.emailsAdministradores()),
      ],
      `Devolución de la reserva #${reembolso.reserva.id}`,
      `La devolución de ${reembolso.moneda} ${Number(
        reembolso.importe,
      ).toFixed(2)} quedó en estado ${reembolso.estado}.\nMotivo: ${
        reembolso.motivo
      }`,
    );
  }

  async reclamoCreado(reclamo: Reclamo): Promise<void> {
    await this.enviar(
      [
        this.emailAnunciante(reclamo.reserva),
        ...(await this.emailsAdministradores()),
      ],
      `Nuevo reclamo en la reserva #${reclamo.reserva.id}`,
      `Se abrió el reclamo #${reclamo.id} (${reclamo.categoria}).\n${reclamo.descripcion}`,
    );
  }

  async reclamoMensaje(
    reclamo: Reclamo,
    autorId: number,
    texto: string,
  ): Promise<void> {
    const destinatarios = [
      reclamo.inquilino.id !== autorId
        ? this.emailInquilino(reclamo.reserva)
        : null,
      reclamo.anunciante?.id !== autorId
        ? this.emailAnunciante(reclamo.reserva)
        : null,
      ...(await this.emailsAdministradores()),
    ];
    await this.enviar(
      destinatarios,
      `Nuevo mensaje en el reclamo #${reclamo.id}`,
      `Se agregó un mensaje al reclamo #${reclamo.id} de la reserva #${reclamo.reserva.id}.\n${texto}`,
    );
  }

  async reclamoResuelto(reclamo: Reclamo): Promise<void> {
    await this.enviar(
      [
        this.emailInquilino(reclamo.reserva),
        this.emailAnunciante(reclamo.reserva),
        ...(await this.emailsAdministradores()),
      ],
      `Reclamo #${reclamo.id} resuelto`,
      `El reclamo #${reclamo.id} de la reserva #${reclamo.reserva.id} fue resuelto con la decisión ${reclamo.resolucion ?? reclamo.estado}.`,
    );
  }

  async reclamoCerrado(reclamo: Reclamo): Promise<void> {
    await this.enviar(
      [
        this.emailInquilino(reclamo.reserva),
        this.emailAnunciante(reclamo.reserva),
      ],
      `Reclamo #${reclamo.id} cerrado`,
      `El reclamo #${reclamo.id} de la reserva #${reclamo.reserva.id} quedó cerrado.`,
    );
  }

  async disputaCreada(disputa: Disputa): Promise<void> {
    await this.enviar(
      [
        this.emailInquilino(disputa.reserva),
        this.emailAnunciante(disputa.reserva),
        ...(await this.emailsAdministradores()),
      ],
      `Contracargo abierto en la reserva #${disputa.reserva.id}`,
      `Se registró un contracargo por ${disputa.moneda} ${Number(
        disputa.importe,
      ).toFixed(2)}.\nMotivo: ${disputa.motivo ?? 'No informado'}`,
    );
  }

  async disputaResuelta(disputa: Disputa): Promise<void> {
    await this.enviar(
      [
        this.emailInquilino(disputa.reserva),
        this.emailAnunciante(disputa.reserva),
        ...(await this.emailsAdministradores()),
      ],
      `Contracargo de la reserva #${disputa.reserva.id} resuelto`,
      `El contracargo quedó en estado ${disputa.estado}.\n${disputa.resolucion ?? ''}`,
    );
  }

  async reservaAfectadaPorBloqueo(
    reserva: Reserva,
    resultado:
      | 'canceladasPendientes'
      | 'canceladasConDevolucion'
      | 'enRevision',
  ): Promise<void> {
    const detalle =
      resultado === 'canceladasConDevolucion'
        ? 'La reserva fue cancelada y se generó una devolución.'
        : resultado === 'canceladasPendientes'
          ? 'La reserva fue cancelada.'
          : 'La reserva quedó en revisión administrativa.';
    await this.enviar(
      [this.emailInquilino(reserva)],
      `Actualización de la reserva #${reserva.id}`,
      `El Anunciante fue bloqueado por un Administrador.\n${detalle}`,
    );
  }

  private emailInquilino(reserva: Reserva): string | null {
    return reserva.usuario_email ?? reserva.usuario?.email ?? null;
  }

  private emailAnunciante(reserva: Reserva): string | null {
    return reserva.publicacion?.anunciante?.usuario?.email ?? null;
  }

  private async emailsAdministradores(): Promise<string[]> {
    try {
      return await this.usuarios.emailsAdministradores();
    } catch {
      this.logger.warn('No se pudieron obtener los correos administrativos');
      return [];
    }
  }

  private async enviar(
    destinatarios: Array<string | null | undefined>,
    asunto: string,
    mensaje: string,
  ): Promise<void> {
    const unicos = [...new Set(destinatarios.filter((email): email is string => !!email))];
    if (unicos.length === 0) return;
    const resultados = await Promise.allSettled(
      unicos.map((destinatario) =>
        this.mail.enviarAviso(destinatario, asunto, mensaje),
      ),
    );
    resultados.forEach((resultado) => {
      if (resultado.status === 'rejected')
        this.logger.error(
          `No se pudo enviar el aviso "${asunto}"`,
          resultado.reason,
        );
    });
  }
}
