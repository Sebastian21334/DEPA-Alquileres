import { Injectable, NotFoundException } from '@nestjs/common';
import { CatalogosRepository } from '../repository/catalogos.repository';
import { Rol } from '../entity/rol.entity';
import { TipoAnunciante } from '../entity/tipo-anunciante.entity';
import { TipoPropiedad } from '../entity/tipo-propiedad.entity';
import { Modalidad } from '../entity/modalidad.entity';
import { MetodoPago } from '../entity/metodo-pago.entity';
import { TipoMoneda } from '../entity/tipo-moneda.entity';

@Injectable()
export class CatalogosService {
  constructor(private catalogosRepo: CatalogosRepository) {}

  // --- ROLES ---
  getRoles() {
    return this.catalogosRepo.buscarTodosRoles();
  }
  getRolPorNombre(nombre: string) {
    return this.catalogosRepo.buscarRolPorNombre(nombre);
  }
  crearRol(datos: Partial<Rol>) {
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
  crearTipoAnunciante(datos: Partial<TipoAnunciante>) {
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
  crearTipoPropiedad(datos: Partial<TipoPropiedad>) {
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
  crearModalidad(datos: Partial<Modalidad>) {
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
  crearMetodoPago(datos: Partial<MetodoPago>) {
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
  crearTipoMoneda(datos: Partial<TipoMoneda>) {
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