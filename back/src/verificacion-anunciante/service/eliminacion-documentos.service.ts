import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  ARCHIVO_REPOSITORY,
  type IArchivoRepository,
} from '../../common/almacenamiento/archivo.repository.interface';
import {
  VERIFICACION_REPOSITORY,
  type IVerificacionRepository,
} from '../repository/verificacion.repository.interface';

@Injectable()
export class EliminacionDocumentosService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(EliminacionDocumentosService.name);
  private temporizador?: ReturnType<typeof setInterval>;
  private ejecutando = false;

  constructor(
    @Inject(VERIFICACION_REPOSITORY)
    private readonly repo: IVerificacionRepository,
    @Inject(ARCHIVO_REPOSITORY) private readonly archivos: IArchivoRepository,
  ) {}

  onModuleInit(): void {
    void this.ejecutar();
    this.temporizador = setInterval(() => void this.ejecutar(), 30_000);
    this.temporizador.unref();
  }

  onModuleDestroy(): void {
    if (this.temporizador) clearInterval(this.temporizador);
  }

  async ejecutar(): Promise<void> {
    if (this.ejecutando) return;
    this.ejecutando = true;
    try {
      const resultado = await this.repo.procesarEliminacionesPendientes((url) =>
        this.archivos.eliminarDocumentoPropio(url),
      );
      if (resultado.fallidos) {
        this.logger.warn(
          `${resultado.fallidos} documentos pendientes de eliminación; se reintentará.`,
        );
      }
    } catch {
      // Nunca incluir URLs, contenido ni excepciones de Azure en los registros.
      this.logger.error(
        'No se pudo procesar la eliminación documental; se reintentará.',
      );
    } finally {
      this.ejecutando = false;
    }
  }
}
