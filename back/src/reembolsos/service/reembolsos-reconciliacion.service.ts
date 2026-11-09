import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ReservaReembolsoAplicacionService } from '../../reservas/service/reserva-reembolso-aplicacion.service';
import { EstadoReembolso } from '../entity/reembolso.entity';
import { ReembolsosService } from './reembolsos.service';

/** Reintenta reembolsos que quedaron en proceso o fallaron. */
@Injectable()
export class ReembolsosReconciliacionService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(ReembolsosReconciliacionService.name);
  private temporizador?: ReturnType<typeof setInterval>;
  private ejecutando = false;

  constructor(
    private readonly reembolsos: ReembolsosService,
    private readonly aplicacion: ReservaReembolsoAplicacionService,
  ) {}

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
      const aprobados = await this.reembolsos.reconciliarPendientes();
      const yaAplicados = new Set(aprobados);
      const aprobadosPersistidos = await this.reembolsos.listarAprobados();
      for (const reembolso of aprobadosPersistidos) {
        if (
          reembolso.estado === EstadoReembolso.APROBADO &&
          !yaAplicados.has(reembolso.id)
        )
          aprobados.push(reembolso.id);
      }
      for (const id of aprobados) {
        try {
          await this.aplicacion.aplicarReembolsoConfirmado(id);
        } catch (error) {
          this.logger.error(
            `El reembolso ${id} se aprobó, pero no se pudo aplicar a la reserva`,
            error as Error,
          );
        }
      }
    } catch (error) {
      this.logger.error('No se pudieron conciliar los reembolsos', error);
    } finally {
      this.ejecutando = false;
    }
  }
}
