import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type EntityManager, type EntityTarget } from 'typeorm';
import { Rol } from '../entity/rol.entity';
import { TipoAnunciante } from '../entity/tipo-anunciante.entity';
import { TipoPropiedad } from '../entity/tipo-propiedad.entity';
import { Modalidad } from '../entity/modalidad.entity';
import { TipoMoneda } from '../entity/tipo-moneda.entity';
import { Estado } from '../entity/estado.entity';
import { CLAVES_CATALOGO, type ClaveCatalogo } from '../codigos-catalogo';
import type { ItemCatalogo, ICatalogosRepository } from './catalogos.repository.interface';

const ENTIDADES_CATALOGO: Record<ClaveCatalogo, EntityTarget<ItemCatalogo>> = {
  'tipos-anunciante': TipoAnunciante,
  'tipos-propiedad': TipoPropiedad,
  modalidades: Modalidad,
  'tipos-moneda': TipoMoneda,
};

@Injectable()
export class CatalogosRepository implements ICatalogosRepository {
  constructor(@InjectRepository(Rol) private readonly rolRepo: Repository<Rol>, @InjectRepository(TipoAnunciante) private readonly tipoAnuncianteRepo: Repository<TipoAnunciante>, @InjectRepository(TipoPropiedad) private readonly tipoPropiedadRepo: Repository<TipoPropiedad>, @InjectRepository(Modalidad) private readonly modalidadRepo: Repository<Modalidad>, @InjectRepository(TipoMoneda) private readonly tipoMonedaRepo: Repository<TipoMoneda>, @InjectRepository(Estado) private readonly estadosRepo: Repository<Estado>) {}

  conCatalogoBloqueado<T>(clave: ClaveCatalogo, operacion: (transaccion: EntityManager) => Promise<T>): Promise<T> {
    return this.rolRepo.manager.transaction(async (transaccion) => {
      // Serializa altas y ediciones del mismo catálogo, incluso desde distintos procesos.
      await transaccion.query('SELECT pg_advisory_xact_lock(62021, $1)', [CLAVES_CATALOGO.indexOf(clave)]);
      return operacion(transaccion);
    });
  }

  buscarItem(clave: ClaveCatalogo, id: number, transaccion: EntityManager): Promise<ItemCatalogo | null> {
    return transaccion.getRepository(ENTIDADES_CATALOGO[clave]).findOneBy({ id });
  }

  buscarNombre(clave: ClaveCatalogo, nombre: string, transaccion: EntityManager): Promise<ItemCatalogo | null> {
    return transaccion.getRepository(ENTIDADES_CATALOGO[clave]).createQueryBuilder('item')
      .where('LOWER(TRIM(item.nombre)) = LOWER(:nombre)', { nombre }).getOne();
  }

  guardarItem(clave: ClaveCatalogo, datos: Partial<ItemCatalogo>, transaccion: EntityManager): Promise<ItemCatalogo> {
    const repo = transaccion.getRepository(ENTIDADES_CATALOGO[clave]);
    return repo.save(repo.create(datos));
  }

  async eliminarItem(clave: ClaveCatalogo, id: number, transaccion: EntityManager): Promise<void> {
    await transaccion.getRepository(ENTIDADES_CATALOGO[clave]).delete(id);
  }

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

  // --- TIPOS ANUNCIANTE ---
  buscarTodosTiposAnunciante(): Promise<TipoAnunciante[]> {
    return this.tipoAnuncianteRepo.find();
  }
  buscarTipoAnunciantePorId(id: number): Promise<TipoAnunciante | null> {
    return this.tipoAnuncianteRepo.findOneBy({ id });
  }

  // --- TIPOS PROPIEDAD ---
  buscarTodosTiposPropiedad(): Promise<TipoPropiedad[]> {
    return this.tipoPropiedadRepo.find();
  }
  buscarTipoPropiedadPorId(id: number): Promise<TipoPropiedad | null> {
    return this.tipoPropiedadRepo.findOneBy({ id });
  }

  // --- MODALIDADES ---
  buscarTodasModalidades(): Promise<Modalidad[]> {
    return this.modalidadRepo.find();
  }
  buscarModalidadPorId(id: number): Promise<Modalidad | null> {
    return this.modalidadRepo.findOneBy({ id });
  }

  // --- TIPOS MONEDA ---
  buscarTodosTiposMoneda(): Promise<TipoMoneda[]> {
    return this.tipoMonedaRepo.find();
  }
  buscarTipoMonedaPorId(id: number): Promise<TipoMoneda | null> {
    return this.tipoMonedaRepo.findOneBy({ id });
  }
}
