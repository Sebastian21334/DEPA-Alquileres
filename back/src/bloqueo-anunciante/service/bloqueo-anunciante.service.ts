import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ReservaBloqueoAnuncianteService } from '../../reservas/service/reserva-bloqueo-anunciante.service';
import { UsuariosService } from '../../usuarios/service/usuarios.service';

/**
 * Caso de uso de bloqueo de un Anunciante. Vive en un módulo de composición
 * porque Usuarios y Reservas se necesitan mutuamente y ARQ-10 prohíbe ciclos.
 */
@Injectable()
export class BloqueoAnuncianteService {
  private readonly logger = new Logger(BloqueoAnuncianteService.name);

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly bloqueo: ReservaBloqueoAnuncianteService,
  ) {}

  async cambiarBloqueo(
    idUsuario: number,
    bloqueado: boolean,
    idOperador: number,
    motivo?: string,
  ) {
    const usuario = await this.usuariosService.buscarPorId(idUsuario);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const resultado = await this.usuariosService.cambiarBloqueo(
      idUsuario,
      bloqueado,
      idOperador,
      motivo,
    );

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
