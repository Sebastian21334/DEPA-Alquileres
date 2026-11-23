import { Modalidad } from '../entity/modalidad.entity';
import { Rol } from '../entity/rol.entity';
import { TipoAnunciante } from '../entity/tipo-anunciante.entity';
import { TipoMoneda } from '../entity/tipo-moneda.entity';
import { TipoPropiedad } from '../entity/tipo-propiedad.entity';
import type { Estado } from '../entity/estado.entity';

export const CATALOGOS_REPOSITORY = 'CATALOGOS_REPOSITORY';

export interface ICatalogosRepository {
  listarEstados(): Promise<Estado[]>;

  buscarTodosRoles(): Promise<Rol[]>;
  buscarRolPorNombre(nombre: string): Promise<Rol | null>;

  buscarTodosTiposAnunciante(): Promise<TipoAnunciante[]>;
  buscarTipoAnunciantePorId(id: number): Promise<TipoAnunciante | null>;

  buscarTodosTiposPropiedad(): Promise<TipoPropiedad[]>;
  buscarTipoPropiedadPorId(id: number): Promise<TipoPropiedad | null>;

  buscarTodasModalidades(): Promise<Modalidad[]>;
  buscarModalidadPorId(id: number): Promise<Modalidad | null>;

  buscarTodosTiposMoneda(): Promise<TipoMoneda[]>;
  buscarTipoMonedaPorId(id: number): Promise<TipoMoneda | null>;
}
