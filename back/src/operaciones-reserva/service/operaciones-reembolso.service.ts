import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import { ReservasService } from '../../reservas/service/reservas.service';
import { ReservaNotificacionesService } from '../../reservas/service/reserva-notificaciones.service';
import { ReclamosService } from '../../reclamos/service/reclamos.service';
import { OrigenReembolso } from '../../reembolsos/entity/reembolso.entity';

@Injectable()
export class OperacionesReembolsoService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(OperacionesReembolsoService.name);
  private temporizador?: ReturnType<typeof setInterval>;
  private enCurso?: Promise<void>;
  private ultimoIdAplicacion = 0;

  constructor(private readonly reembolsos: ReembolsosService, private readonly reservas: ReservasService, private readonly reclamos: ReclamosService, private readonly notificaciones?: ReservaNotificacionesService) {}

  async ejecutar(id: number, idAdmin: number) {
    const reembolso = await this.reembolsos.ejecutar(id, idAdmin);
    if (!this.reembolsos.estaAprobado(reembolso)) return { reembolso, reserva: reembolso.reserva };
    return this.aplicarReembolsoConfirmado(id);
  }

  async recuperarConfirmacion(id: number, referencia: string, idAdmin: number) {
    await this.reembolsos.recuperarConfirmacion(id, referencia, idAdmin);
    return this.aplicarReembolsoConfirmado(id);
  }

  async registrarTransferencia(id: number, referencia: string, comprobante: Express.Multer.File | undefined, idAdmin: number) {
    await this.reembolsos.registrarTransferencia(id, referencia, comprobante, idAdmin);
    return this.aplicarReembolsoConfirmado(id);
  }

  async aplicarReembolsoConfirmado(id: number) {
    const aplicada = await this.reembolsos.aplicarConfirmado(id, async (reembolso, transaccion) => {
      if (reembolso.origen === OrigenReembolso.RECLAMO)
        return (await this.reclamos.aplicarResolucionReembolso(reembolso, transaccion)).reserva;
      return this.reservas.aplicarEfectoReembolso(reembolso, transaccion);
    });
    const reembolso = await this.reembolsos.buscar(id);
    if (aplicada) {
      const asunto = aplicada.cancelada ? 'Reserva cancelada y devolución registrada' : 'Devolución registrada';
      await this.notificaciones?.avisarCambio(aplicada, ['inquilino', 'anunciante'], asunto, 'La devolución del pago quedó registrada. Consultá el estado de la reserva en DEPA.');
    }
    return { reembolso, reserva: aplicada ?? reembolso.reserva };
  }

  onApplicationBootstrap(): void {
    this.iniciarConciliacion();
    this.temporizador = setInterval(() => this.iniciarConciliacion(), 60_000);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.temporizador) clearInterval(this.temporizador);
    await this.enCurso;
  }

  private iniciarConciliacion(): void {
    if (this.enCurso) return;
    this.enCurso = this.conciliar().finally(() => { this.enCurso = undefined; });
  }

  private async conciliar(): Promise<void> {
    try {
      await this.reembolsos.reconciliarPendientes();
      const pendientes = await this.reembolsos.listarPendientesAplicacion(this.ultimoIdAplicacion);
      this.ultimoIdAplicacion = pendientes.at(-1)?.id ?? 0;
      for (const { id } of pendientes) {
        try {
          await this.aplicarReembolsoConfirmado(id);
        } catch {
          this.logger.error(`El reembolso ${id} fue aprobado y queda pendiente de aplicar`);
        }
      }
    } catch {
      this.logger.error('No se pudieron conciliar los reembolsos pendientes');
    }
  }
}
