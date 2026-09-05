import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from '../entity/rol.entity';
import { TipoAnunciante } from '../entity/tipo-anunciante.entity';
import { TipoPropiedad } from '../entity/tipo-propiedad.entity';
import { Modalidad } from '../entity/modalidad.entity';
import { MetodoPago } from '../entity/metodo-pago.entity';
import { TipoMoneda } from '../entity/tipo-moneda.entity';
import { ICatalogosRepository } from './catalogos.repository.interface';

@Injectable()
export class CatalogosRepository implements ICatalogosRepository {
  constructor(
    @InjectRepository(Rol) private rolRepo: Repository<Rol>,
    @InjectRepository(TipoAnunciante) private tipoAnuncianteRepo: Repository<TipoAnunciante>,
    @InjectRepository(TipoPropiedad) private tipoPropiedadRepo: Repository<TipoPropiedad>,
    @InjectRepository(Modalidad) private modalidadRepo: Repository<Modalidad>,
    @InjectRepository(MetodoPago) private metodoPagoRepo: Repository<MetodoPago>,
    @InjectRepository(TipoMoneda) private tipoMonedaRepo: Repository<TipoMoneda>,
  ) {}

  // --- ROLES ---
  buscarTodosRoles(): Promise<Rol[]> {
    return this.rolRepo.find();
  }
  buscarRolPorNombre(nombre: string): Promise<Rol | null> {
    return this.rolRepo.findOneBy({ nombre });
  }
  buscarRolPorId(id: number): Promise<Rol | null> {
    return this.rolRepo.findOneBy({ id });
  }
  async crearRol(datos: Partial<Rol>): Promise<Rol> {
    return this.rolRepo.save(this.rolRepo.create(datos));
  }
  async actualizarRol(id: number, datos: Partial<Rol>): Promise<Rol> {
    await this.rolRepo.update(id, datos);
    return this.buscarRolPorId(id) as Promise<Rol>;
  }
  async eliminarRol(id: number): Promise<void> {
    await this.rolRepo.delete(id);
  }

  // --- TIPOS ANUNCIANTE ---
  buscarTodosTiposAnunciante(): Promise<TipoAnunciante[]> {
    return this.tipoAnuncianteRepo.find();
  }
  buscarTipoAnunciantePorNombre(nombre: string): Promise<TipoAnunciante | null> {
    return this.tipoAnuncianteRepo.findOneBy({ nombre });
  }
  buscarTipoAnunciantePorId(id: number): Promise<TipoAnunciante | null> {
    return this.tipoAnuncianteRepo.findOneBy({ id });
  }
  async crearTipoAnunciante(datos: Partial<TipoAnunciante>): Promise<TipoAnunciante> {
    return this.tipoAnuncianteRepo.save(this.tipoAnuncianteRepo.create(datos));
  }
  async actualizarTipoAnunciante(id: number, datos: Partial<TipoAnunciante>): Promise<TipoAnunciante> {
    await this.tipoAnuncianteRepo.update(id, datos);
    return this.buscarTipoAnunciantePorId(id) as Promise<TipoAnunciante>;
  }
  async eliminarTipoAnunciante(id: number): Promise<void> {
    await this.tipoAnuncianteRepo.delete(id);
  }

  // --- TIPOS PROPIEDAD ---
  buscarTodosTiposPropiedad(): Promise<TipoPropiedad[]> {
    return this.tipoPropiedadRepo.find();
  }
  buscarTipoPropiedadPorNombre(nombre: string): Promise<TipoPropiedad | null> {
    return this.tipoPropiedadRepo.findOneBy({ nombre });
  }
  buscarTipoPropiedadPorId(id: number): Promise<TipoPropiedad | null> {
    return this.tipoPropiedadRepo.findOneBy({ id });
  }
  async crearTipoPropiedad(datos: Partial<TipoPropiedad>): Promise<TipoPropiedad> {
    return this.tipoPropiedadRepo.save(this.tipoPropiedadRepo.create(datos));
  }
  async actualizarTipoPropiedad(id: number, datos: Partial<TipoPropiedad>): Promise<TipoPropiedad> {
    await this.tipoPropiedadRepo.update(id, datos);
    return this.buscarTipoPropiedadPorId(id) as Promise<TipoPropiedad>;
  }
  async eliminarTipoPropiedad(id: number): Promise<void> {
    await this.tipoPropiedadRepo.delete(id);
  }

  // --- MODALIDADES ---
  buscarTodasModalidades(): Promise<Modalidad[]> {
    return this.modalidadRepo.find();
  }
  buscarModalidadPorNombre(nombre: string): Promise<Modalidad | null> {
    return this.modalidadRepo.findOneBy({ nombre });
  }
  buscarModalidadPorId(id: number): Promise<Modalidad | null> {
    return this.modalidadRepo.findOneBy({ id });
  }
  async crearModalidad(datos: Partial<Modalidad>): Promise<Modalidad> {
    return this.modalidadRepo.save(this.modalidadRepo.create(datos));
  }
  async actualizarModalidad(id: number, datos: Partial<Modalidad>): Promise<Modalidad> {
    await this.modalidadRepo.update(id, datos);
    return this.buscarModalidadPorId(id) as Promise<Modalidad>;
  }
  async eliminarModalidad(id: number): Promise<void> {
    await this.modalidadRepo.delete(id);
  }

  // --- MÉTODOS DE PAGO ---
  buscarTodosMetodosPago(): Promise<MetodoPago[]> {
    return this.metodoPagoRepo.find();
  }
  buscarMetodoPagoPorNombre(nombre: string): Promise<MetodoPago | null> {
    return this.metodoPagoRepo.findOneBy({ nombre });
  }
  buscarMetodoPagoPorId(id: number): Promise<MetodoPago | null> {
    return this.metodoPagoRepo.findOneBy({ id });
  }
  async crearMetodoPago(datos: Partial<MetodoPago>): Promise<MetodoPago> {
    return this.metodoPagoRepo.save(this.metodoPagoRepo.create(datos));
  }
  async actualizarMetodoPago(id: number, datos: Partial<MetodoPago>): Promise<MetodoPago> {
    await this.metodoPagoRepo.update(id, datos);
    return this.buscarMetodoPagoPorId(id) as Promise<MetodoPago>;
  }
  async eliminarMetodoPago(id: number): Promise<void> {
    await this.metodoPagoRepo.delete(id);
  }

  // --- TIPOS MONEDA ---
  buscarTodosTiposMoneda(): Promise<TipoMoneda[]> {
    return this.tipoMonedaRepo.find();
  }
  buscarTipoMonedaPorNombre(nombre: string): Promise<TipoMoneda | null> {
    return this.tipoMonedaRepo.findOneBy({ nombre });
  }
  buscarTipoMonedaPorId(id: number): Promise<TipoMoneda | null> {
    return this.tipoMonedaRepo.findOneBy({ id });
  }
  async crearTipoMoneda(datos: Partial<TipoMoneda>): Promise<TipoMoneda> {
    return this.tipoMonedaRepo.save(this.tipoMonedaRepo.create(datos));
  }
  async actualizarTipoMoneda(id: number, datos: Partial<TipoMoneda>): Promise<TipoMoneda> {
    await this.tipoMonedaRepo.update(id, datos);
    return this.buscarTipoMonedaPorId(id) as Promise<TipoMoneda>;
  }
  async eliminarTipoMoneda(id: number): Promise<void> {
    await this.tipoMonedaRepo.delete(id);
  }
}