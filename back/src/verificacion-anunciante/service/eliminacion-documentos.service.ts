import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { AlmacenamientoService } from '../../almacenamiento/service/almacenamiento.service';
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

  constructor(@Inject(VERIFICACION_REPOSITORY) private readonly repo: IVerificacionRepository, private readonly almacenamientoService: AlmacenamientoService) {}

  onModuleInit(): void {
    void this.ejecutar();
    this.temporizador = setInterval(() => void this.ejecutar(), 30_000);
    this.temporizador.unref();
  }

  onModuleDestroy(): void {
    if (this.temporizador) clearInterval(this.temporizador);
  }

  async ejecutar(ahora = new Date()): Promise<void> {
    if (this.ejecutando) return;
    this.ejecutando = true;
    try {
      const resultado = await this.repo.conEliminacionesPendientes(
        async (documentos, persistencia) => {
          let eliminados = 0;
          let fallidos = 0;
          for (const documento of documentos) {
            try {
              await this.almacenamientoService.eliminarDocumentoPropio(documento.url);
            } catch {
              documento.intentos += 1;
              const espera = Math.min(
                3_600_000,
                30_000 * 2 ** Math.min(documento.intentos - 1, 7),
              );
              documento.proximo_intento = new Date(ahora.getTime() + espera);
              await persistencia.guardar(documento);
              fallidos += 1;
              continue;
            }
            // Repetir un borrado tras un COMMIT incierto es seguro.
            await persistencia.eliminar(documento.id);
            eliminados += 1;
          }
          return { eliminados, fallidos };
        },
        ahora,
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
