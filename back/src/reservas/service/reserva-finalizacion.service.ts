import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Inject, Injectable, Logger, OnModuleDestroy, OnApplicationBootstrap } from '@nestjs/common';
import { fechaArgentina } from '../../common/utils/fechas';
import { RESERVA_REPOSITORY } from '../repository/reserva.repository.interface';
import type { IReservaRepository } from '../repository/reserva.repository.interface';
import { ReservaNotificacionesService } from './reserva-notificaciones.service';

/** Persiste los cierres que ya corresponden según el estado de la estadía. */
@Injectable()
export class ReservaFinalizacionService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(ReservaFinalizacionService.name);
  private temporizador?: ReturnType<typeof setInterval>;
  private ejecutando = false;

  constructor(@Inject(RESERVA_REPOSITORY) private readonly reservas: IReservaRepository, private readonly catalogos: CatalogosService, private readonly notificaciones?: ReservaNotificacionesService) {}

  onApplicationBootstrap(): void {
    void this.ejecutar();
    this.temporizador = setInterval(() => void this.ejecutar(), 60_000);
  }

  onModuleDestroy(): void {
    if (this.temporizador) clearInterval(this.temporizador);
  }

  async ejecutar(ahora = new Date()): Promise<void> {
    if (this.ejecutando) return;
    this.ejecutando = true;
    try {
      const ids = await this.reservas.finalizarEstadiasVencidas(fechaArgentina(ahora), this.catalogos.codigoEstado('PAGO_RESERVA', 'APROBADO'));
      if (this.notificaciones) {
        for (const id of ids) {
          try {
            const reserva = await this.reservas.buscarPorId(id);
            if (reserva)
              await this.notificaciones.avisarCambio(reserva, ['inquilino', 'anunciante'], 'Estadía finalizada', 'La estadía finalizó. Podés consultar los detalles de la reserva en DEPA.');
          } catch {
            this.logger.warn(`No se pudo preparar el aviso de fin de estadía para la reserva ${id}`);
          }
        }
      }
    } catch (error) {
      this.logger.error('No se pudieron finalizar las estadías; se reintentará.', error);
    } finally {
      this.ejecutando = false;
    }
  }
}
