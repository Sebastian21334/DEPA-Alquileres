import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { fechaArgentina } from '../../common/utils/fechas';
import { EstadoPagoReserva, Reserva } from '../entity/reserva.entity';

/** Persiste los cierres que ya corresponden según el estado de la estadía. */
@Injectable()
export class ReservaFinalizacionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReservaFinalizacionService.name);
  private temporizador?: ReturnType<typeof setInterval>;
  private ejecutando = false;

  constructor(
    @InjectRepository(Reserva)
    private readonly reservas: Repository<Reserva>,
  ) {}

  onModuleInit(): void {
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
      // UPDATE condicional atómico: PostgreSQL vuelve a comprobar las condiciones
      // si otra transacción modifica la reserva mientras espera el bloqueo.
      await this.reservas.createQueryBuilder()
        .update(Reserva)
        .set({ finalizada: true })
        .where('finalizada = false')
        .andWhere('cancelada = false')
        .andWhere('estado_pago = :aprobado', { aprobado: EstadoPagoReserva.APROBADO })
        .andWhere('codigo_validado_en IS NOT NULL')
        .andWhere('fecha_inicio IS NOT NULL AND fecha_fin IS NOT NULL')
        .andWhere('fecha_inicio <= fecha_fin')
        .andWhere('fecha_fin < :hoy', { hoy: fechaArgentina(ahora) })
        .execute();
    } catch (error) {
      this.logger.error('No se pudieron finalizar las estadías; se reintentará.', error);
    } finally {
      this.ejecutando = false;
    }
  }
}
