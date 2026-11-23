import { eliminarConIntegridad, RegistroEnUsoError } from '../../common/persistence/registro-en-uso.error';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository, type EntityManager } from 'typeorm';
import { Rol } from '../entity/rol.entity';
import { TipoAnunciante } from '../entity/tipo-anunciante.entity';
import { TipoPropiedad } from '../entity/tipo-propiedad.entity';
import { Modalidad } from '../entity/modalidad.entity';
import { TipoMoneda } from '../entity/tipo-moneda.entity';
import { Estado } from '../entity/estado.entity';
import { ICatalogosRepository } from './catalogos.repository.interface';

@Injectable()
export class CatalogosRepository implements ICatalogosRepository {
  constructor(@InjectRepository(Rol) private readonly rolRepo: Repository<Rol>, @InjectRepository(TipoAnunciante) private readonly tipoAnuncianteRepo: Repository<TipoAnunciante>, @InjectRepository(TipoPropiedad) private readonly tipoPropiedadRepo: Repository<TipoPropiedad>, @InjectRepository(Modalidad) private readonly modalidadRepo: Repository<Modalidad>, @InjectRepository(TipoMoneda) private readonly tipoMonedaRepo: Repository<TipoMoneda>, @InjectRepository(Estado) private readonly estadosRepo: Repository<Estado>) {}

  async obtenerComision(transaccion?: EntityManager): Promise<number> {
    const filas = await (transaccion ?? this.rolRepo.manager).query('SELECT porcentaje FROM configuracion_comision WHERE id = 1');
    if (!filas.length) throw new Error('Falta configurar la comisión de DEPA');
    return Number(filas[0].porcentaje);
  }

  async actualizarComision(porcentaje: number): Promise<number> {
    const filas = await this.rolRepo.manager.query('UPDATE configuracion_comision SET porcentaje = $1 WHERE id = 1 RETURNING porcentaje', [porcentaje]);
    if (!filas.length) throw new Error('Falta configurar la comisión de DEPA');
    return Number(filas[0].porcentaje);
  }

  private async actualizarSiNoEstaEnUso<T extends ObjectLiteral>(repo: Repository<T>, id: number, datos: Partial<T>, tabla: string, columna: string): Promise<T | null> {
    return repo.manager.transaction(async (manager) => {
      const repositorio = manager.getRepository(repo.target);
      const actual = await repositorio.createQueryBuilder('catalogo')
        .where('catalogo.id = :id', { id }).setLock('pessimistic_write').getOne();
      if (!actual) return null;
      // El bloqueo también serializa nuevas referencias por clave foránea.
      const referencias = await manager.query(`SELECT 1 FROM "${tabla}" WHERE "${columna}" = $1 LIMIT 1`, [id]);
      if (referencias.length) throw new RegistroEnUsoError(undefined);
      await repositorio.update(id, datos as any);
      return repositorio.findOneBy({ id } as any);
    });
  }

  listarEstados(): Promise<Estado[]> {
    return this.estadosRepo.find({ relations: { ambito: true } });
  }

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
    return this.actualizarSiNoEstaEnUso(this.rolRepo, id, datos, 'usuario', 'id_rol');
  }
  async eliminarRol(id: number): Promise<void> {
    await eliminarConIntegridad(() => this.rolRepo.delete(id));
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
  async actualizarTipoAnunciante(id: number, datos: Partial<TipoAnunciante>): Promise<TipoAnunciante | null> {
    return this.actualizarSiNoEstaEnUso(this.tipoAnuncianteRepo, id, datos, 'anunciante', 'id_tipo_anunciante');
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
  async crearTipoPropiedad(datos: Partial<TipoPropiedad>): Promise<TipoPropiedad> {
    return this.tipoPropiedadRepo.save(this.tipoPropiedadRepo.create(datos));
  }
  async actualizarTipoPropiedad(id: number, datos: Partial<TipoPropiedad>): Promise<TipoPropiedad | null> {
    return this.actualizarSiNoEstaEnUso(this.tipoPropiedadRepo, id, datos, 'publicacion', 'id_tipo_propiedad');
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
  async actualizarModalidad(id: number, datos: Partial<Modalidad>): Promise<Modalidad | null> {
    return this.actualizarSiNoEstaEnUso(this.modalidadRepo, id, datos, 'publicacion', 'id_modalidad');
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
  async actualizarTipoMoneda(id: number, datos: Partial<TipoMoneda>): Promise<TipoMoneda | null> {
    return this.actualizarSiNoEstaEnUso(this.tipoMonedaRepo, id, datos, 'publicacion', 'id_tipo_moneda');
  }
  async eliminarTipoMoneda(id: number): Promise<void> {
    await eliminarConIntegridad(() => this.tipoMonedaRepo.delete(id));
  }
}
