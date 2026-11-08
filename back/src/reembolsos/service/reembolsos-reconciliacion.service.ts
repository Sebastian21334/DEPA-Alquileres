import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ReembolsosService } from './reembolsos.service';

/** Reintenta reembolsos que quedaron en proceso o fallaron. */
@Injectable()
export class ReembolsosReconciliacionService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(ReembolsosReconciliacionService.name);
  private temporizador?: ReturnType<typeof setInterval>;
  private ejecutando = false;

  constructor(private readonly reembolsos: ReembolsosService) {}

  onModuleInit(): void {
    void this.ejecutar();
    this.temporizador = setInterval(() => void this.ejecutar(), 60_000);
  }

  onModuleDestroy(): void {
    if (this.temporizador) clearInterval(this.temporizador);
  }

  private async ejecutar(): Promise<void> {
    if (this.ejecutando) return;
    this.ejecutando = true;
    try {
      await this.reembolsos.reconciliarPendientes();
    } catch (error) {
      this.logger.error('No se pudieron conciliar los reembolsos', error);
    } finally {
      this.ejecutando = false;
    }
  }
}
