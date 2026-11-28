import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Provincia } from '../entity/provincia.entity';
import { Ciudad } from '../entity/ciudad.entity';
import { IUbicacionRepository } from './ubicacion.repository.interface';

@Injectable()
export class UbicacionRepository implements IUbicacionRepository {
  constructor(@InjectRepository(Provincia) private readonly provinciaRepo: Repository<Provincia>, @InjectRepository(Ciudad) private readonly ciudadRepo: Repository<Ciudad>) {}

  conUbicacionesBloqueadas<T>(operacion: (transaccion: EntityManager) => Promise<T>): Promise<T> {
    return this.provinciaRepo.manager.transaction(async (transaccion) => {
      await transaccion.query('SELECT pg_advisory_xact_lock($1, $2)', [62022, 1]);
      return operacion(transaccion);
    });
  }

  buscarProvinciaParaModificar(id: number, transaccion: EntityManager): Promise<Provincia | null> {
    return transaccion.getRepository(Provincia).findOneBy({ id });
  }

  buscarCiudadParaModificar(id: number, transaccion: EntityManager): Promise<Ciudad | null> {
    return transaccion.getRepository(Ciudad).findOne({ where: { id }, relations: { provincia: true } });
  }

  buscarProvinciaPorNombre(nombre: string, transaccion: EntityManager): Promise<Provincia | null> {
    return transaccion.getRepository(Provincia).createQueryBuilder('provincia').where('LOWER(TRIM(provincia.nombre)) = LOWER(:nombre)', { nombre }).getOne();
  }

  buscarCiudadPorNombre(nombre: string, provinciaId: number, transaccion: EntityManager): Promise<Ciudad | null> {
    return transaccion.getRepository(Ciudad).createQueryBuilder('ciudad').where('ciudad.id_provincia = :provinciaId', { provinciaId }).andWhere('LOWER(TRIM(ciudad.nombre)) = LOWER(:nombre)', { nombre }).getOne();
  }

  guardarProvincia(provincia: Provincia, transaccion: EntityManager): Promise<Provincia> {
    return transaccion.getRepository(Provincia).save(provincia);
  }

  guardarCiudad(ciudad: Ciudad, transaccion: EntityManager): Promise<Ciudad> {
    return transaccion.getRepository(Ciudad).save(ciudad);
  }

  crearProvincia(nombre: string, transaccion: EntityManager): Promise<Provincia> {
    const repo = transaccion.getRepository(Provincia);
    return repo.save(repo.create({ nombre }));
  }

  crearCiudad(nombre: string, provincia: Provincia, transaccion: EntityManager): Promise<Ciudad> {
    const repo = transaccion.getRepository(Ciudad);
    return repo.save(repo.create({ nombre, provincia }));
  }

  async eliminarProvincia(id: number, transaccion: EntityManager): Promise<void> {
    await transaccion.getRepository(Provincia).delete(id);
  }

  async eliminarCiudad(id: number, transaccion: EntityManager): Promise<void> {
    await transaccion.getRepository(Ciudad).delete(id);
  }

  buscarTodasProvincias(): Promise<Provincia[]> {
    return this.provinciaRepo.find();
  }

  buscarProvinciaPorId(id: number): Promise<Provincia | null> {
    return this.provinciaRepo.findOneBy({ id });
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

  async buscarIdsCiudadesPorNombre(nombre: string): Promise<number[]> {
    const ciudades = await this.ciudadRepo.createQueryBuilder('ciudad')
      .select('ciudad.id')
      .where("TRANSLATE(LOWER(ciudad.nombre), 'áéíóúüñ', 'aeiouun') = :nombre", { nombre })
      .getMany();
    return ciudades.map(({ id }) => id);
  }
}
