import type { Disputa } from '../entity/disputa.entity';

export const DISPUTAS_REPOSITORY = 'DISPUTAS_REPOSITORY';

export interface IDisputasRepository {
  crear(datos: Partial<Disputa>): Disputa;
  guardar(disputa: Disputa): Promise<Disputa>;
  buscarPorChargebackId(chargebackId: string): Promise<Disputa | null>;
  buscarPorId(id: number): Promise<Disputa | null>;
  buscarPorIdConBloqueo(id: number): Promise<Disputa | null>;
  listarAdministracion(): Promise<Disputa[]>;
}
