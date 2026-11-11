import type { EntityManager } from 'typeorm';
import type { Anunciante } from '../entity/anunciante.entity';

export const ANUNCIANTES_REPOSITORY = 'ANUNCIANTES_REPOSITORY';

export interface IAnunciantesRepository {
  crear(datos: Partial<Anunciante>): Anunciante;
  guardar(anunciante: Anunciante, transaccion?: EntityManager): Promise<Anunciante>;
  archivarCuit(idUsuario: number, transaccion: EntityManager): Promise<void>;
  actualizarVerificacion(idUsuario: number, verificado: boolean, transaccion: EntityManager): Promise<void>;
  buscarPorUsuario(idUsuario: number, transaccion?: EntityManager): Promise<Anunciante | null>;
  buscarPendientes(): Promise<Anunciante[]>;
  eliminar(anunciante: Anunciante): Promise<Anunciante>;
  buscarPorId(id: number): Promise<Anunciante | null>;
  /** true si una cuenta vigente ya usa ese CUIT/CUIL (se comparan solo los dígitos). */
  existeCuitVigente(cuit: string, transaccion?: EntityManager): Promise<boolean>;
}
