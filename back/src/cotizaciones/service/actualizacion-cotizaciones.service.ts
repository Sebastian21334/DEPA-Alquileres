import { Injectable, Logger, type OnApplicationBootstrap, type OnModuleDestroy } from '@nestjs/common';
import { CotizacionesService } from './cotizaciones.service';

const INTERVALO_REVISION_MS = 60_000;

// Separa el temporizador de las reglas que deciden cuándo actualizar y cómo guardar la cotización.
@Injectable()
export class ActualizacionCotizacionesService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(ActualizacionCotizacionesService.name);
  private timer?: ReturnType<typeof setInterval>;

  constructor(private readonly cotizaciones: CotizacionesService) {}

  /** Pide una revisión al iniciar y programa revisiones periódicas mientras el backend está activo. */
  onApplicationBootstrap(): void {
    this.revisar();
    this.timer = setInterval(() => this.revisar(), INTERVALO_REVISION_MS);
    this.timer.unref();
  }

  /** Detiene las revisiones programadas al cerrar el módulo. */
  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  /** Delega la revisión y registra los fallos para que se puedan reintentar en la próxima ejecución. */
  private revisar(): void {
    void this.cotizaciones.actualizarSiCorresponde().catch(() =>
      this.logger.warn('No se pudo revisar el dólar; se reintentará con el backend activo'),
    );
  }
}
