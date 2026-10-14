import { eliminarConIntegridad } from '../../common/persistence/registro-en-uso.error';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from '../entity/rol.entity';
import { TipoAnunciante } from '../entity/tipo-anunciante.entity';
import { TipoPropiedad } from '../entity/tipo-propiedad.entity';
import { Modalidad } from '../entity/modalidad.entity';
import { TipoMoneda } from '../entity/tipo-moneda.entity';
import { ICatalogosRepository } from './catalogos.repository.interface';

@Injectable()
export class CatalogosRepository implements ICatalogosRepository {
  constructor(
    @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>,
    @InjectRepository(TipoAnunciante)
    private readonly tipoAnuncianteRepo: Repository<TipoAnunciante>,
    @InjectRepository(TipoPropiedad)
    private readonly tipoPropiedadRepo: Repository<TipoPropiedad>,
    @InjectRepository(Modalidad)
    private readonly modalidadRepo: Repository<Modalidad>,
    @InjectRepository(TipoMoneda)
    private readonly tipoMonedaRepo: Repository<TipoMoneda>,
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
  async actualizarRol(id: number, datos: Partial<Rol>): Promise<Rol | null> {
    await this.rolRepo.update(id, datos);
    return this.buscarRolPorId(id);
  }
  async eliminarRol(id: number): Promise<void> {
    await eliminarConIntegridad(() => this.rolRepo.delete(id));
  }

  // --- TIPOS ANUNCIANTE ---
  buscarTodosTiposAnunciante(): Promise<TipoAnunciante[]> {
    return this.tipoAnuncianteRepo.find();
  }
  buscarTipoAnunciantePorNombre(
    nombre: string,
  ): Promise<TipoAnunciante | null> {
    return this.tipoAnuncianteRepo.findOneBy({ nombre });
  }
  buscarTipoAnunciantePorId(id: number): Promise<TipoAnunciante | null> {
    return this.tipoAnuncianteRepo.findOneBy({ id });
  }
  async crearTipoAnunciante(
    datos: Partial<TipoAnunciante>,
  ): Promise<TipoAnunciante> {
    return this.tipoAnuncianteRepo.save(this.tipoAnuncianteRepo.create(datos));
  }
  async actualizarTipoAnunciante(
    id: number,
    datos: Partial<TipoAnunciante>,
  ): Promise<TipoAnunciante | null> {
    await this.tipoAnuncianteRepo.update(id, datos);
    return this.buscarTipoAnunciantePorId(id);
  }
  async eliminarTipoAnunciante(id: number): Promise<void> {
    await eliminarConIntegridad(() => this.tipoAnuncianteRepo.delete(id));
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
  async crearTipoPropiedad(
    datos: Partial<TipoPropiedad>,
  ): Promise<TipoPropiedad> {
    return this.tipoPropiedadRepo.save(this.tipoPropiedadRepo.create(datos));
  }
  async actualizarTipoPropiedad(
    id: number,
    datos: Partial<TipoPropiedad>,
  ): Promise<TipoPropiedad | null> {
    await this.tipoPropiedadRepo.update(id, datos);
    return this.buscarTipoPropiedadPorId(id);
  }
  async eliminarTipoPropiedad(id: number): Promise<void> {
    await eliminarConIntegridad(() => this.tipoPropiedadRepo.delete(id));
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
  async actualizarModalidad(
    id: number,
    datos: Partial<Modalidad>,
  ): Promise<Modalidad | null> {
    await this.modalidadRepo.update(id, datos);
    return this.buscarModalidadPorId(id);
  }
  async eliminarModalidad(id: number): Promise<void> {
    await eliminarConIntegridad(() => this.modalidadRepo.delete(id));
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
  async actualizarTipoMoneda(
    id: number,
    datos: Partial<TipoMoneda>,
  ): Promise<TipoMoneda | null> {
    await this.tipoMonedaRepo.update(id, datos);
    return this.buscarTipoMonedaPorId(id);
  }
  async eliminarTipoMoneda(id: number): Promise<void> {
    await eliminarConIntegridad(() => this.tipoMonedaRepo.delete(id));
  }
}
