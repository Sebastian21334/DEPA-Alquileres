import { Modalidad } from '../entity/modalidad.entity';
import { Rol } from '../entity/rol.entity';
import { TipoAnunciante } from '../entity/tipo-anunciante.entity';
import { TipoMoneda } from '../entity/tipo-moneda.entity';
import { TipoPropiedad } from '../entity/tipo-propiedad.entity';
import type { Estado } from '../entity/estado.entity';
import type { EntityManager } from 'typeorm';
import type { ClaveCatalogo } from '../codigos-catalogo';

export const CATALOGOS_REPOSITORY = 'CATALOGOS_REPOSITORY';

export interface ItemCatalogo {
  id: number;
  nombre: string;
  descripcion: string | null;
  permite_reservas_por_fecha?: boolean | null;
}

export interface ICatalogosRepository {
  conCatalogoBloqueado<T>(clave: ClaveCatalogo, operacion: (transaccion: EntityManager) => Promise<T>): Promise<T>;
  buscarItem(clave: ClaveCatalogo, id: number, transaccion: EntityManager): Promise<ItemCatalogo | null>;
  buscarNombre(clave: ClaveCatalogo, nombre: string, transaccion: EntityManager): Promise<ItemCatalogo | null>;
  guardarItem(clave: ClaveCatalogo, datos: Partial<ItemCatalogo>, transaccion: EntityManager): Promise<ItemCatalogo>;
  eliminarItem(clave: ClaveCatalogo, id: number, transaccion: EntityManager): Promise<void>;
  obtenerComision(transaccion?: EntityManager): Promise<number>;
  actualizarComision(porcentaje: number): Promise<number>;
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
