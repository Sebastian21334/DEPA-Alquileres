import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from '../entity/rol.entity';
import { TipoAnunciante } from '../entity/tipo-anunciante.entity';
import { TipoPropiedad } from '../entity/tipo-propiedad.entity';
import { Modalidad } from '../entity/modalidad.entity';
import { MetodoPago } from '../entity/metodo-pago.entity';
import { TipoMoneda } from '../entity/tipo-moneda.entity';

@Injectable()
export class CatalogosRepository {
  constructor(
    @InjectRepository(Rol) private rolRepo: Repository<Rol>,
    @InjectRepository(TipoAnunciante) private tipoAnuncianteRepo: Repository<TipoAnunciante>,
    @InjectRepository(TipoPropiedad) private tipoPropiedadRepo: Repository<TipoPropiedad>,
    @InjectRepository(Modalidad) private modalidadRepo: Repository<Modalidad>,
    @InjectRepository(MetodoPago) private metodoPagoRepo: Repository<MetodoPago>,
    @InjectRepository(TipoMoneda) private tipoMonedaRepo: Repository<TipoMoneda>,
  ) {}

  buscarTodosRoles(): Promise<Rol[]> {
    return this.rolRepo.find();
  }

  buscarRolPorNombre(nombre: string): Promise<Rol | null> {
    return this.rolRepo.findOneBy({ nombre });
  }

  buscarTodosTiposAnunciante(): Promise<TipoAnunciante[]> {
    return this.tipoAnuncianteRepo.find();
  }

  buscarTipoAnunciantePorId(id: number): Promise<TipoAnunciante | null> {
    return this.tipoAnuncianteRepo.findOneBy({ id });
  }

  buscarTodosTiposPropiedad(): Promise<TipoPropiedad[]> {
    return this.tipoPropiedadRepo.find();
  }

  buscarTodasModalidades(): Promise<Modalidad[]> {
    return this.modalidadRepo.find();
  }

  buscarTodosMetodosPago(): Promise<MetodoPago[]> {
    return this.metodoPagoRepo.find();
  }

  buscarTodosTiposMoneda(): Promise<TipoMoneda[]> {
    return this.tipoMonedaRepo.find();
  }
}