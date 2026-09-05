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
  getRoles() {
    return this.catalogosRepo.buscarTodosRoles();
  }
  getRolPorNombre(nombre: string) {
    return this.catalogosRepo.buscarRolPorNombre(nombre);
  }
  async crearRol(datos: Partial<Rol>) {
    const existente = await this.catalogosRepo.buscarRolPorNombre(datos.nombre!);
    if (existente) {
      throw new ConflictException(`Ya existe el rol '${datos.nombre}'`);
    }
    return this.catalogosRepo.crearRol(datos);
  }
  async actualizarRol(id: number, datos: Partial<Rol>) {
    const rol = await this.catalogosRepo.buscarRolPorId(id);
    if (!rol) throw new NotFoundException(`El rol con ID ${id} no existe`);
    return this.catalogosRepo.actualizarRol(id, datos);
  }
  async eliminarRol(id: number) {
    const rol = await this.catalogosRepo.buscarRolPorId(id);
    if (!rol) throw new NotFoundException(`El rol con ID ${id} no existe`);
    await this.catalogosRepo.eliminarRol(id);
    return { mensaje: `Rol con ID ${id} eliminado correctamente` };
  }

  // --- TIPOS ANUNCIANTE ---
  getTiposAnunciante() {
    return this.catalogosRepo.buscarTodosTiposAnunciante();
  }
  async crearTipoAnunciante(datos: Partial<TipoAnunciante>) {
    const existente = await this.catalogosRepo.buscarTipoAnunciantePorNombre(datos.nombre!);
    if (existente) {
      throw new ConflictException(`Ya existe el tipo de anunciante '${datos.nombre}'`);
    }
    return this.catalogosRepo.crearTipoAnunciante(datos);
  }
  async actualizarTipoAnunciante(id: number, datos: Partial<TipoAnunciante>) {
    const item = await this.catalogosRepo.buscarTipoAnunciantePorId(id);
    if (!item) throw new NotFoundException(`El tipo de anunciante con ID ${id} no existe`);
    return this.catalogosRepo.actualizarTipoAnunciante(id, datos);
  }
  async eliminarTipoAnunciante(id: number) {
    const item = await this.catalogosRepo.buscarTipoAnunciantePorId(id);
    if (!item) throw new NotFoundException(`El tipo de anunciante con ID ${id} no existe`);
    await this.catalogosRepo.eliminarTipoAnunciante(id);
    return { mensaje: `Tipo de anunciante con ID ${id} eliminado correctamente` };
  }
  async getTipoAnunciantePorId(id: number) {
    const item = await this.catalogosRepo.buscarTipoAnunciantePorId(id);
    if (!item) throw new NotFoundException(`El tipo de anunciante con ID ${id} no existe`);
    return item;
  }

  // --- TIPOS PROPIEDAD ---
  getTiposPropiedad() {
    return this.catalogosRepo.buscarTodosTiposPropiedad();
  }
  async crearTipoPropiedad(datos: Partial<TipoPropiedad>) {
    const existente = await this.catalogosRepo.buscarTipoPropiedadPorNombre(datos.nombre!);
    if (existente) {
      throw new ConflictException(`Ya existe el tipo de propiedad '${datos.nombre}'`);
    }
  return this.catalogosRepo.crearTipoPropiedad(datos);
}
  async actualizarTipoPropiedad(id: number, datos: Partial<TipoPropiedad>) {
    const item = await this.catalogosRepo.buscarTipoPropiedadPorId(id);
    if (!item) throw new NotFoundException(`El tipo de propiedad con ID ${id} no existe`);
    return this.catalogosRepo.actualizarTipoPropiedad(id, datos);
  }
  async eliminarTipoPropiedad(id: number) {
    const item = await this.catalogosRepo.buscarTipoPropiedadPorId(id);
    if (!item) throw new NotFoundException(`El tipo de propiedad con ID ${id} no existe`);
    await this.catalogosRepo.eliminarTipoPropiedad(id);
    return { mensaje: `Tipo de propiedad con ID ${id} eliminado correctamente` };
  }

  // --- MODALIDADES ---
  getModalidades() {
    return this.catalogosRepo.buscarTodasModalidades();
  }
  async crearModalidad(datos: Partial<Modalidad>) {
    const existente = await this.catalogosRepo.buscarModalidadPorNombre(datos.nombre!);
    if (existente) {
      throw new ConflictException(`Ya existe la modalidad '${datos.nombre}'`);
    }
    return this.catalogosRepo.crearModalidad(datos);
  }
  async actualizarModalidad(id: number, datos: Partial<Modalidad>) {
    const item = await this.catalogosRepo.buscarModalidadPorId(id);
    if (!item) throw new NotFoundException(`La modalidad con ID ${id} no existe`);
    return this.catalogosRepo.actualizarModalidad(id, datos);
  }
  async eliminarModalidad(id: number) {
    const item = await this.catalogosRepo.buscarModalidadPorId(id);
    if (!item) throw new NotFoundException(`La modalidad con ID ${id} no existe`);
    await this.catalogosRepo.eliminarModalidad(id);
    return { mensaje: `Modalidad con ID ${id} eliminada correctamente` };
  }

  // --- MÉTODOS DE PAGO ---
  getMetodosPago() {
    return this.catalogosRepo.buscarTodosMetodosPago();
  }
  async crearMetodoPago(datos: Partial<MetodoPago>) {
    const existente = await this.catalogosRepo.buscarMetodoPagoPorNombre(datos.nombre!);
    if (existente) {
      throw new ConflictException(`Ya existe el método de pago '${datos.nombre}'`);
    }
    return this.catalogosRepo.crearMetodoPago(datos);
  }
  async actualizarMetodoPago(id: number, datos: Partial<MetodoPago>) {
    const item = await this.catalogosRepo.buscarMetodoPagoPorId(id);
    if (!item) throw new NotFoundException(`El método de pago con ID ${id} no existe`);
    return this.catalogosRepo.actualizarMetodoPago(id, datos);
  }
  async eliminarMetodoPago(id: number) {
    const item = await this.catalogosRepo.buscarMetodoPagoPorId(id);
    if (!item) throw new NotFoundException(`El método de pago con ID ${id} no existe`);
    await this.catalogosRepo.eliminarMetodoPago(id);
    return { mensaje: `Método de pago con ID ${id} eliminado correctamente` };
  }

  // --- TIPOS MONEDA ---
  getTiposMoneda() {
    return this.catalogosRepo.buscarTodosTiposMoneda();
  }
  async crearTipoMoneda(datos: Partial<TipoMoneda>) {
    const existente = await this.catalogosRepo.buscarTipoMonedaPorNombre(datos.nombre!);
    if (existente) {
      throw new ConflictException(`Ya existe el tipo de moneda '${datos.nombre}'`);
    }
    return this.catalogosRepo.crearTipoMoneda(datos);
  }
  async actualizarTipoMoneda(id: number, datos: Partial<TipoMoneda>) {
    const item = await this.catalogosRepo.buscarTipoMonedaPorId(id);
    if (!item) throw new NotFoundException(`El tipo de moneda con ID ${id} no existe`);
    return this.catalogosRepo.actualizarTipoMoneda(id, datos);
  }
  async eliminarTipoMoneda(id: number) {
    const item = await this.catalogosRepo.buscarTipoMonedaPorId(id);
    if (!item) throw new NotFoundException(`El tipo de moneda con ID ${id} no existe`);
    await this.catalogosRepo.eliminarTipoMoneda(id);
    return { mensaje: `Tipo de moneda con ID ${id} eliminado correctamente` };
  }
}