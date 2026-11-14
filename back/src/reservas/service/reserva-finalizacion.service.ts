import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Inject, Injectable, Logger, OnModuleDestroy, OnApplicationBootstrap } from '@nestjs/common';
import { fechaArgentina } from '../../common/utils/fechas';
import { RESERVA_REPOSITORY } from '../repository/reserva.repository.interface';
import type { IReservaRepository } from '../repository/reserva.repository.interface';

/** Persiste los cierres que ya corresponden según el estado de la estadía. */
@Injectable()
export class ReservaFinalizacionService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(ReservaFinalizacionService.name);
  private temporizador?: ReturnType<typeof setInterval>;
  private ejecutando = false;

  constructor(@Inject(RESERVA_REPOSITORY) private readonly reservas: IReservaRepository, private readonly catalogos: CatalogosService) {}

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
      await this.reservas.finalizarEstadiasVencidas(fechaArgentina(ahora), this.catalogos.codigoEstado('PAGO_RESERVA', 'APROBADO'));
    } catch (error) {
      this.logger.error('No se pudieron finalizar las estadías; se reintentará.', error);
    } finally {
      this.ejecutando = false;
    }
  }
}
