import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { fechaArgentina } from '../../common/utils/fechas';
import {
  RESERVA_REPOSITORY,
  type IReservaRepository,
} from '../repository/reserva.repository.interface';

/** Programa el cierre de las estadías que ya terminaron. */
@Injectable()
export class ReservaFinalizacionService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(ReservaFinalizacionService.name);
  private temporizador?: ReturnType<typeof setInterval>;
  private ejecutando = false;

  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly reservas: IReservaRepository,
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
      await this.reservas.marcarFinalizadas(fechaArgentina(ahora));
    } catch (error) {
      this.logger.error(
        'No se pudieron finalizar las estadías; se reintentará.',
        error,
      );
    } finally {
      this.ejecutando = false;
    }
  }
}
