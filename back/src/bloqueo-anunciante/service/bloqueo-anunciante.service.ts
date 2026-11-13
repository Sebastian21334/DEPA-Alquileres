import { Inject, Injectable, Logger } from '@nestjs/common';
import { MAIL_SERVICE, type IMailService } from '../../mail/mail.interface';
import { ReservaBloqueoAnuncianteService } from '../../reservas/service/reserva-bloqueo-anunciante.service';
import { UsuariosService } from '../../usuarios/service/usuarios.service';

@Injectable()
export class BloqueoAnuncianteService {
  private readonly logger = new Logger(BloqueoAnuncianteService.name);

  constructor(private readonly usuarios: UsuariosService, private readonly bloqueo: ReservaBloqueoAnuncianteService, @Inject(MAIL_SERVICE) private readonly mail: IMailService) {}

  async cambiarBloqueo(idUsuario: number, bloqueado: boolean, idOperador: number, motivo?: string) {
    const motivoNormalizado = motivo?.trim();
    const { usuario, cambio } = await this.usuarios.cambiarBloqueoAdministrativo(idUsuario, bloqueado, idOperador, motivoNormalizado);

    if (cambio && usuario.email) {
      try {
        await this.mail.enviarCambioBloqueo(usuario.email, bloqueado, motivoNormalizado);
      } catch (error) {
        this.logger.error(`No se pudo notificar el cambio de acceso del usuario ${idUsuario}`, error as Error);
      }
    }

    const resultado = {
      mensaje: bloqueado ? 'Usuario bloqueado correctamente' : 'Usuario habilitado correctamente',
    };

    if (!bloqueado || usuario.rol?.nombre !== 'Anunciante') return resultado;

    try {
      const reservas =
        await this.bloqueo.cancelarReservasPorBloqueoAnunciante(
          idUsuario,
          usuario.bloqueoDetalle?.administradorId ?? idOperador,
          usuario.bloqueoDetalle ? usuario.bloqueoDetalle.motivo ?? undefined : motivoNormalizado,
        );
      this.logger.log(
        `Bloqueo del anunciante ${idUsuario}: ${reservas.canceladasPendientes} pendientes, ` +
          `${reservas.canceladasConDevolucion} con devolución, ` +
          `${reservas.enRevision} en revisión, ${reservas.fallidas} fallidas`,
      );
      if (reservas.fallidas > 0) {
        return {
          ...resultado,
          reservas,
          advertencia: `${reservas.fallidas} reserva(s) no se pudieron resolver automáticamente. Revisá el detalle en el panel administrativo.`,
        };
      }
      return { ...resultado, reservas };
    } catch (error) {
      this.logger.error(
        `El anunciante ${idUsuario} quedó bloqueado, pero no se pudieron resolver sus reservas`,
        error as Error,
      );
      return {
        ...resultado,
        reservas: null,
        advertencia:
          'La cuenta quedó bloqueada, pero no se pudieron resolver automáticamente sus reservas. Revisá el panel administrativo.',
      };
    }
  }
}
