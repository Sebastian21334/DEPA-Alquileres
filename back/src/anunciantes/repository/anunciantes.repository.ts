import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Anunciante } from '../entity/anunciante.entity';
import { IAnunciantesRepository } from './anunciantes.repository.interface';
import { guardarSinDuplicados } from '../../common/persistence/valor-duplicado.error';

/** Índice único de la migración 20261104-cuit-email-historicos.sql. */
export const RESTRICCION_CUIT_UNICO = 'uq_anunciante_cuit_cuil_digitos';

@Injectable()
export class AnunciantesRepository implements IAnunciantesRepository {
  constructor(
    @InjectRepository(Anunciante)
    private readonly repo: Repository<Anunciante>,
  ) {}

  crear(datos: Partial<Anunciante>): Anunciante {
    return this.repo.create(datos);
  }

  guardar(anunciante: Anunciante): Promise<Anunciante> {
    // El índice único resuelve dos solicitudes simultáneas con el mismo CUIT/CUIL.
    return guardarSinDuplicados(
      () => this.repo.save(anunciante),
      [RESTRICCION_CUIT_UNICO],
    );
  }

  existeCuitVigente(cuit: string): Promise<boolean> {
    // Las cuentas dadas de baja tienen cuit_cuil en null, por eso no cuentan.
    return this.repo
      .createQueryBuilder('anunciante')
      .where(
        "regexp_replace(anunciante.cuit_cuil, '[^0-9]', '', 'g') = :digitos",
        { digitos: Anunciante.digitosCuit(cuit) },
      )
      .getExists();
  }

  buscarPorUsuario(idUsuario: number): Promise<Anunciante | null> {
    return this.repo.findOneBy({ idUsuario });
  }

  buscarPendientes(): Promise<Anunciante[]> {
    // El administrador necesita usuario y tipo para revisar la solicitud completa.
    return this.repo.find({
      where: { verificado: false },
      relations: {
        usuario: true,
        tipoAnunciante: true,
      },
    });
  }

  eliminar(anunciante: Anunciante): Promise<Anunciante> {
    return this.repo.remove(anunciante);
  }

  buscarPorId(id: number): Promise<Anunciante | null> {
    // id coincide con idUsuario porque esa columna es la PK de Anunciante.
    return this.repo.findOne({
      where: { idUsuario: id },
      relations: { usuario: true, tipoAnunciante: true },
    });
  }
}
