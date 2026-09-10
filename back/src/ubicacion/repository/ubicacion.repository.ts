import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provincia } from '../entity/provincia.entity';
import { Ciudad } from '../entity/ciudad.entity';
import { IUbicacionRepository } from './ubicacion.repository.interface';

@Injectable()
export class UbicacionRepository implements IUbicacionRepository {
  constructor(
    @InjectRepository(Provincia)
    private readonly provinciaRepo: Repository<Provincia>,
    @InjectRepository(Ciudad)
    private readonly ciudadRepo: Repository<Ciudad>,
  ) {}

  buscarTodasProvincias(): Promise<Provincia[]> {
    return this.provinciaRepo.find();
  }

  buscarProvinciaPorId(id: number): Promise<Provincia | null> {
    return this.provinciaRepo.findOneBy({ id });
  }

  crearProvincia(datos: Partial<Provincia>): Promise<Provincia> {
    const provincia = this.provinciaRepo.create(datos);
    return this.provinciaRepo.save(provincia);
  }

  async actualizarProvincia(
    id: number,
    datos: Partial<Provincia>,
  ): Promise<Provincia> {
    await this.provinciaRepo.update(id, datos);
    return (await this.buscarProvinciaPorId(id))!;
  }

  async eliminarProvincia(id: number): Promise<void> {
    await this.provinciaRepo.delete(id);
  }

  buscarCiudadPorId(id: number): Promise<Ciudad | null> {
    // La provincia se carga para validar y reutilizar la relación al crear publicaciones.
    return this.ciudadRepo.findOne({
      where: { id },
      relations: { provincia: true },
    });
  }

  buscarCiudadesPorProvincia(idProvincia: number): Promise<Ciudad[]> {
    return this.ciudadRepo.find({
      where: { provincia: { id: idProvincia } },
    });
  }

  crearCiudad(datos: Partial<Ciudad>): Promise<Ciudad> {
    const ciudad = this.ciudadRepo.create(datos);
    return this.ciudadRepo.save(ciudad);
  }

  async actualizarCiudad(id: number, datos: Partial<Ciudad>): Promise<Ciudad> {
    await this.ciudadRepo.update(id, datos);
    return (await this.buscarCiudadPorId(id))!;
  }

  async eliminarCiudad(id: number): Promise<void> {
    await this.ciudadRepo.delete(id);
  }
}
