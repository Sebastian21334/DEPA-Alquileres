import { Anunciante } from '../entity/anunciante.entity';

export const ANUNCIANTES_REPOSITORY = 'ANUNCIANTES_REPOSITORY';

export interface IAnunciantesRepository {
  crear(datos: Partial<Anunciante>): Anunciante;
  guardar(anunciante: Anunciante): Promise<Anunciante>;
  buscarPorUsuario(idUsuario: number): Promise<Anunciante | null>;
  buscarPendientes(): Promise<Anunciante[]>;
  eliminar(anunciante: Anunciante): Promise<Anunciante>;
  buscarPorId(id: number): Promise<Anunciante | null>;
  /** true si una cuenta vigente ya usa ese CUIT/CUIL (se comparan solo los dígitos). */
  existeCuitVigente(cuit: string): Promise<boolean>;
}