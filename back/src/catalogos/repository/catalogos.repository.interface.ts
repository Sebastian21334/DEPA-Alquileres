import { MetodoPago } from '../entity/metodo-pago.entity';
import { Modalidad } from '../entity/modalidad.entity';
import { Rol } from '../entity/rol.entity';
import { TipoAnunciante } from '../entity/tipo-anunciante.entity';
import { TipoMoneda } from '../entity/tipo-moneda.entity';
import { TipoPropiedad } from '../entity/tipo-propiedad.entity';

export const CATALOGOS_REPOSITORY = 'CATALOGOS_REPOSITORY';

export interface ICatalogosRepository {
  buscarTodosRoles(): Promise<Rol[]>;
  buscarRolPorNombre(nombre: string): Promise<Rol | null>;
  buscarRolPorId(id: number): Promise<Rol | null>;
  crearRol(datos: Partial<Rol>): Promise<Rol>;
  actualizarRol(id: number, datos: Partial<Rol>): Promise<Rol>;
  eliminarRol(id: number): Promise<void>;

  buscarTodosTiposAnunciante(): Promise<TipoAnunciante[]>;
  buscarTipoAnunciantePorId(id: number): Promise<TipoAnunciante | null>;
  buscarTipoAnunciantePorNombre(nombre: string): Promise<TipoAnunciante | null>;
  crearTipoAnunciante(datos: Partial<TipoAnunciante>): Promise<TipoAnunciante>;
  actualizarTipoAnunciante(id: number, datos: Partial<TipoAnunciante>): Promise<TipoAnunciante>;
  eliminarTipoAnunciante(id: number): Promise<void>;

  buscarTodosTiposPropiedad(): Promise<TipoPropiedad[]>;
  buscarTipoPropiedadPorId(id: number): Promise<TipoPropiedad | null>;
  buscarTipoPropiedadPorNombre(nombre: string): Promise<TipoPropiedad | null>;
  crearTipoPropiedad(datos: Partial<TipoPropiedad>): Promise<TipoPropiedad>;
  actualizarTipoPropiedad(id: number, datos: Partial<TipoPropiedad>): Promise<TipoPropiedad>;
  eliminarTipoPropiedad(id: number): Promise<void>;

  buscarTodasModalidades(): Promise<Modalidad[]>;
  buscarModalidadPorId(id: number): Promise<Modalidad | null>;
  buscarModalidadPorNombre(nombre: string): Promise<Modalidad | null>;
  crearModalidad(datos: Partial<Modalidad>): Promise<Modalidad>;
  actualizarModalidad(id: number, datos: Partial<Modalidad>): Promise<Modalidad>;
  eliminarModalidad(id: number): Promise<void>;

  buscarTodosMetodosPago(): Promise<MetodoPago[]>;
  buscarMetodoPagoPorId(id: number): Promise<MetodoPago | null>;
  buscarMetodoPagoPorNombre(nombre: string): Promise<MetodoPago | null>;
  crearMetodoPago(datos: Partial<MetodoPago>): Promise<MetodoPago>;
  actualizarMetodoPago(id: number, datos: Partial<MetodoPago>): Promise<MetodoPago>;
  eliminarMetodoPago(id: number): Promise<void>;

  buscarTodosTiposMoneda(): Promise<TipoMoneda[]>;
  buscarTipoMonedaPorId(id: number): Promise<TipoMoneda | null>;
  buscarTipoMonedaPorNombre(nombre: string): Promise<TipoMoneda | null>;
  crearTipoMoneda(datos: Partial<TipoMoneda>): Promise<TipoMoneda>;
  actualizarTipoMoneda(id: number, datos: Partial<TipoMoneda>): Promise<TipoMoneda>;
  eliminarTipoMoneda(id: number): Promise<void>;
}