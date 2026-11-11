import type { Disputa } from '../entity/disputa.entity';

export const DISPUTAS_REPOSITORY = 'DISPUTAS_REPOSITORY';

export interface IDisputasRepository {
  buscarPorContracargo(chargebackId: string): Promise<Disputa | null>;
  buscarPorId(id: number): Promise<Disputa | null>;
  listarAdministracion(): Promise<Disputa[]>;
  crear(datos: Partial<Disputa>): Disputa;
  guardar(disputa: Disputa): Promise<Disputa>;
}
