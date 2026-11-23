import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
