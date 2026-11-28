import { Logger } from '@nestjs/common';

const logger = new Logger('TareasEnSegundoPlano');

/** Ejecuta tareas posteriores al guardado y registra sus fallas sin afectar la respuesta. */
export function ejecutarEnSegundoPlano(tarea: () => Promise<unknown> | undefined, mensajeDeError: string): void {
  void Promise.resolve().then(tarea).catch(() => logger.warn(mensajeDeError));
}
