import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CATALOGOS_REPOSITORY } from '../repository/catalogos.repository.interface';
import type { ICatalogosRepository } from '../repository/catalogos.repository.interface';
import { Rol } from '../entity/rol.entity';
import { TipoAnunciante } from '../entity/tipo-anunciante.entity';
import { TipoPropiedad } from '../entity/tipo-propiedad.entity';
import { Modalidad } from '../entity/modalidad.entity';
import { MetodoPago } from '../entity/metodo-pago.entity';
import { TipoMoneda } from '../entity/tipo-moneda.entity';

@Injectable()
export class CatalogosService {
  constructor(
    @Inject(CATALOGOS_REPOSITORY)
    private catalogosRepo: ICatalogosRepository,
  ) {}

  // --- ROLES ---
  /** Lista los roles disponibles para administracion y registro de usuarios. */
  getRoles() {
    return this.catalogosRepo.buscarTodosRoles();
  }
  /** Busca un rol por nombre; se usa al asignar roles automaticamente. */
  getRolPorNombre(nombre: string) {
    return this.catalogosRepo.buscarRolPorNombre(nombre);
  }
  /** Crea un rol y evita duplicados por nombre. */
  async crearRol(datos: Partial<Rol>) {
    // Se consulta antes de insertar porque el catálogo no depende solo del error de DB.
    const existente = await this.catalogosRepo.buscarRolPorNombre(datos.nombre!);
    if (existente) {
      throw new ConflictException(`Ya existe el rol '${datos.nombre}'`);
    }
    return this.catalogosRepo.crearRol(datos);
  }
  /** Actualiza un rol existente despues de validar su existencia. */
  async actualizarRol(id: number, datos: Partial<Rol>) {
    const rol = await this.catalogosRepo.buscarRolPorId(id);
    if (!rol) throw new NotFoundException(`El rol con ID ${id} no existe`);
    return this.catalogosRepo.actualizarRol(id, datos);
  }
  /** Elimina un rol existente y devuelve un mensaje de confirmacion. */
  async eliminarRol(id: number) {
    const rol = await this.catalogosRepo.buscarRolPorId(id);
    if (!rol) throw new NotFoundException(`El rol con ID ${id} no existe`);
    await this.catalogosRepo.eliminarRol(id);
    return { mensaje: `Rol con ID ${id} eliminado correctamente` };
  }

  // --- TIPOS ANUNCIANTE ---
  /** Lista las categorias de anunciante. */
  getTiposAnunciante() {
    return this.catalogosRepo.buscarTodosTiposAnunciante();
  }
  /** Crea una categoria de anunciante sin permitir nombres repetidos. */
  async crearTipoAnunciante(datos: Partial<TipoAnunciante>) {
    const existente = await this.catalogosRepo.buscarTipoAnunciantePorNombre(datos.nombre!);
    if (existente) {
      throw new ConflictException(`Ya existe el tipo de anunciante '${datos.nombre}'`);
    }
    return this.catalogosRepo.crearTipoAnunciante(datos);
  }
  /** Actualiza una categoria de anunciante existente. */
  async actualizarTipoAnunciante(id: number, datos: Partial<TipoAnunciante>) {
    const item = await this.catalogosRepo.buscarTipoAnunciantePorId(id);
    if (!item) throw new NotFoundException(`El tipo de anunciante con ID ${id} no existe`);
    return this.catalogosRepo.actualizarTipoAnunciante(id, datos);
  }
  /** Elimina una categoria de anunciante validando primero el ID. */
  async eliminarTipoAnunciante(id: number) {
    const item = await this.catalogosRepo.buscarTipoAnunciantePorId(id);
    if (!item) throw new NotFoundException(`El tipo de anunciante con ID ${id} no existe`);
    await this.catalogosRepo.eliminarTipoAnunciante(id);
    return { mensaje: `Tipo de anunciante con ID ${id} eliminado correctamente` };
  }
  /** Busca una categoria de anunciante o informa que la relacion no existe. */
  async getTipoAnunciantePorId(id: number) {
    const item = await this.catalogosRepo.buscarTipoAnunciantePorId(id);
    if (!item) throw new NotFoundException(`El tipo de anunciante con ID ${id} no existe`);
    return item;
  }

  // --- TIPOS PROPIEDAD ---
  /** Lista los tipos de propiedad usados en las publicaciones. */
  getTiposPropiedad() {
    return this.catalogosRepo.buscarTodosTiposPropiedad();
  }
  /** Crea un tipo de propiedad y controla la unicidad del nombre. */
  async crearTipoPropiedad(datos: Partial<TipoPropiedad>) {
    const existente = await this.catalogosRepo.buscarTipoPropiedadPorNombre(datos.nombre!);
    if (existente) {
      throw new ConflictException(`Ya existe el tipo de propiedad '${datos.nombre}'`);
    }
    return this.catalogosRepo.crearTipoPropiedad(datos);
  }
  /** Actualiza un tipo de propiedad previamente existente. */
  async actualizarTipoPropiedad(id: number, datos: Partial<TipoPropiedad>) {
    const item = await this.catalogosRepo.buscarTipoPropiedadPorId(id);
    if (!item) throw new NotFoundException(`El tipo de propiedad con ID ${id} no existe`);
    return this.catalogosRepo.actualizarTipoPropiedad(id, datos);
  }
  /** Elimina un tipo de propiedad despues de verificarlo. */
  async eliminarTipoPropiedad(id: number) {
    const item = await this.catalogosRepo.buscarTipoPropiedadPorId(id);
    if (!item) throw new NotFoundException(`El tipo de propiedad con ID ${id} no existe`);
    await this.catalogosRepo.eliminarTipoPropiedad(id);
    return { mensaje: `Tipo de propiedad con ID ${id} eliminado correctamente` };
  }
  /** Resuelve el tipo de propiedad requerido al crear una publicacion. */
  async getTipoPropiedadPorId(id: number) {
    const item = await this.catalogosRepo.buscarTipoPropiedadPorId(id);
    if (!item) throw new NotFoundException(`El tipo de propiedad con ID ${id} no existe`);
    return item;
  }

  // --- MODALIDADES ---
  /** Lista las modalidades de alquiler disponibles. */
  getModalidades() {
    return this.catalogosRepo.buscarTodasModalidades();
  }
  /** Crea una modalidad sin duplicar nombres existentes. */
  async crearModalidad(datos: Partial<Modalidad>) {
    const existente = await this.catalogosRepo.buscarModalidadPorNombre(datos.nombre!);
    if (existente) {
      throw new ConflictException(`Ya existe la modalidad '${datos.nombre}'`);
    }
    return this.catalogosRepo.crearModalidad(datos);
  }
  /** Actualiza una modalidad existente. */
  async actualizarModalidad(id: number, datos: Partial<Modalidad>) {
    const item = await this.catalogosRepo.buscarModalidadPorId(id);
    if (!item) throw new NotFoundException(`La modalidad con ID ${id} no existe`);
    return this.catalogosRepo.actualizarModalidad(id, datos);
  }
  /** Elimina una modalidad despues de validar que exista. */
  async eliminarModalidad(id: number) {
    const item = await this.catalogosRepo.buscarModalidadPorId(id);
    if (!item) throw new NotFoundException(`La modalidad con ID ${id} no existe`);
    await this.catalogosRepo.eliminarModalidad(id);
    return { mensaje: `Modalidad con ID ${id} eliminada correctamente` };
  }
  /** Resuelve una modalidad para asociarla a una publicacion. */
  async getModalidadPorId(id: number) {
    const item = await this.catalogosRepo.buscarModalidadPorId(id);
    if (!item) throw new NotFoundException(`La modalidad con ID ${id} no existe`);
    return item;
  }

  // --- MÉTODOS DE PAGO ---
  /** Lista los medios de pago habilitados para las reservas. */
  getMetodosPago() {
    return this.catalogosRepo.buscarTodosMetodosPago();
  }
  /** Crea un medio de pago sin permitir nombres duplicados. */
  async crearMetodoPago(datos: Partial<MetodoPago>) {
    const existente = await this.catalogosRepo.buscarMetodoPagoPorNombre(datos.nombre!);
    if (existente) {
      throw new ConflictException(`Ya existe el método de pago '${datos.nombre}'`);
    }
    return this.catalogosRepo.crearMetodoPago(datos);
  }
  /** Actualiza un medio de pago existente. */
  async actualizarMetodoPago(id: number, datos: Partial<MetodoPago>) {
    const item = await this.catalogosRepo.buscarMetodoPagoPorId(id);
    if (!item) throw new NotFoundException(`El método de pago con ID ${id} no existe`);
    return this.catalogosRepo.actualizarMetodoPago(id, datos);
  }
  /** Elimina un medio de pago despues de verificar que exista. */
  async eliminarMetodoPago(id: number) {
    const item = await this.catalogosRepo.buscarMetodoPagoPorId(id);
    if (!item) throw new NotFoundException(`El método de pago con ID ${id} no existe`);
    await this.catalogosRepo.eliminarMetodoPago(id);
    return { mensaje: `Método de pago con ID ${id} eliminado correctamente` };
  }

  // --- TIPOS MONEDA ---
  /** Lista las monedas disponibles para publicar precios. */
  getTiposMoneda() {
    return this.catalogosRepo.buscarTodosTiposMoneda();
  }
  /** Crea un tipo de moneda y controla nombres repetidos. */
  async crearTipoMoneda(datos: Partial<TipoMoneda>) {
    const existente = await this.catalogosRepo.buscarTipoMonedaPorNombre(datos.nombre!);
    if (existente) {
      throw new ConflictException(`Ya existe el tipo de moneda '${datos.nombre}'`);
    }
    return this.catalogosRepo.crearTipoMoneda(datos);
  }
  /** Actualiza un tipo de moneda existente. */
  async actualizarTipoMoneda(id: number, datos: Partial<TipoMoneda>) {
    const item = await this.catalogosRepo.buscarTipoMonedaPorId(id);
    if (!item) throw new NotFoundException(`El tipo de moneda con ID ${id} no existe`);
    return this.catalogosRepo.actualizarTipoMoneda(id, datos);
  }
  /** Elimina un tipo de moneda despues de validar su existencia. */
  async eliminarTipoMoneda(id: number) {
    const item = await this.catalogosRepo.buscarTipoMonedaPorId(id);
    if (!item) throw new NotFoundException(`El tipo de moneda con ID ${id} no existe`);
    await this.catalogosRepo.eliminarTipoMoneda(id);
    return { mensaje: `Tipo de moneda con ID ${id} eliminado correctamente` };
  }
  /** Resuelve la moneda asociada al precio de una publicacion. */
  async getTipoMonedaPorId(id: number) {
    const item = await this.catalogosRepo.buscarTipoMonedaPorId(id);
    if (!item) throw new NotFoundException(`El tipo de moneda con ID ${id} no existe`);
    return item;
  }
}