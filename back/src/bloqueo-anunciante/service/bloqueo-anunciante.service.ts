import { BadRequestException, ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { MAIL_SERVICE, type IMailService } from '../../mail/mail.interface';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { ReservaBloqueoAnuncianteService } from '../../reservas/service/reserva-bloqueo-anunciante.service';
import { BLOQUEO_ANUNCIANTE_REPOSITORY, type IBloqueoAnuncianteRepository } from '../repository/bloqueo-anunciante.repository.interface';

@Injectable()
export class BloqueoAnuncianteService {
  private readonly logger = new Logger(BloqueoAnuncianteService.name);

  constructor(@Inject(BLOQUEO_ANUNCIANTE_REPOSITORY) private readonly repositorio: IBloqueoAnuncianteRepository, private readonly bloqueo: ReservaBloqueoAnuncianteService, private readonly publicaciones: PublicacionesService, @Inject(MAIL_SERVICE) private readonly mail: IMailService) {}

  async cambiarBloqueo(idUsuario: number, bloqueado: boolean, idOperador: number, motivo?: string) {
    if (idUsuario === idOperador)
      throw new BadRequestException('No podés bloquearte o habilitarte a vos mismo');

    const motivoNormalizado = motivo?.trim();
    const { usuario, cambio } = await this.repositorio.conTransaccion(async (transaccion) => {
      const usuario = await this.repositorio.buscarBloqueado(idUsuario, transaccion);
      if (!usuario) throw new NotFoundException('Usuario no encontrado');
      if (!usuario.activa)
        throw new ConflictException('La cuenta fue dada de baja: no se puede bloquear ni habilitar');
      if (usuario.bloqueado === bloqueado) return { usuario, cambio: false };

      await this.publicaciones.bloquearPublicacionesParaCambioDeCuenta(idUsuario, transaccion);
      usuario.bloqueado = bloqueado;
      if (bloqueado) {
        usuario.bloqueoDetalle = {
          id: randomUUID(),
          motivo: motivoNormalizado || null,
          administradorId: idOperador,
          fecha: new Date().toISOString(),
        };
      }
      await this.repositorio.guardar(usuario, transaccion);
      return { usuario, cambio: true };
    });

    if (cambio && usuario.email) {
      try {
        await this.mail.enviarCambioBloqueo(usuario.email, bloqueado, motivoNormalizado);
      } catch (error) {
        this.logger.error(`No se pudo notificar el cambio de acceso a ${usuario.email}`, error as Error);
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
          idOperador,
          motivo,
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
