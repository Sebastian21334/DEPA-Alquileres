import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { guardarSinDuplicados } from '../../common/persistence/valor-duplicado.error';
import { paginar, type Pagina } from '../../common/persistence/paginacion';
import { Resena } from '../entity/resena.entity';
import type {
  DatosModeracionResena,
  FiltroResenasAdministracion,
  IResenaAccesoRepository,
  IResenaRepository,
  ResenaAcceso,
} from './resena.repository.interface';
import type {
  DatosResenaAnunciante,
  DatosResenaPublicacion,
  ResumenResenas,
  TipoObjetivoResena,
} from '../resenas.types';

const RESTRICCIONES_RESEÑA = [
  'uq_resena_publicacion_autor',
  'uq_resena_anunciante_autor',
];

@Injectable()
export class ResenasRepository implements IResenaRepository, IResenaAccesoRepository {
  constructor(@InjectRepository(Resena) private readonly repo: Repository<Resena>) {}

  crearParaPublicacion(datos: DatosResenaPublicacion): Resena {
    const { idUsuario, idPublicacion, ...resena } = datos;
    return this.repo.create({
      ...resena,
      actualizada_en: null,
      visible: true,
      motivo_moderacion: null,
      fecha_moderacion: null,
      denunciada: false,
      motivo_denuncia: null,
      fecha_denuncia: null,
      autor: { id: idUsuario },
      publicacion: { id: idPublicacion },
    });
  }

  crearParaAnunciante(datos: DatosResenaAnunciante): Resena {
    const { idUsuario, idAnunciante, ...resena } = datos;
    return this.repo.create({
      ...resena,
      actualizada_en: null,
      visible: true,
      motivo_moderacion: null,
      fecha_moderacion: null,
      denunciada: false,
      motivo_denuncia: null,
      fecha_denuncia: null,
      autor: { id: idUsuario },
      anunciante: { idUsuario: idAnunciante },
    });
  }

  guardar(resena: Resena): Promise<Resena> {
    return guardarSinDuplicados(
      () => this.repo.save(resena),
      RESTRICCIONES_RESEÑA,
    );
  }

  buscarPorId(id: number): Promise<Resena | null> {
    return this.repo.findOne({
      where: { id },
      relations: {
        autor: true,
        imagenes: true,
        publicacion: true,
        anunciante: { usuario: true, tipoAnunciante: true },
        moderador: true,
        denunciante: true,
      },
    });
  }

  async buscarParaImagenes(id: number): Promise<ResenaAcceso | null> {
    const resena = await this.repo.findOne({
      where: { id },
      select: { id: true, visible: true, autor: { id: true } },
      relations: { autor: true },
    });
    return resena
      ? { id: resena.id, visible: resena.visible, autor: { id: resena.autor.id } }
      : null;
  }

  buscarPorObjetivoYAutor(tipo: TipoObjetivoResena, idObjetivo: number, idUsuario: number): Promise<Resena | null> {
    return this.repo.findOne({
      where: {
        ...(tipo === 'PUBLICACION'
          ? { publicacion: { id: idObjetivo } }
          : { anunciante: { idUsuario: idObjetivo } }),
        autor: { id: idUsuario },
      },
      relations: { autor: true, imagenes: true },
    });
  }

  buscarPaginaPorObjetivo(
    tipo: TipoObjetivoResena,
    idObjetivo: number,
    pagina: number,
    limite: number,
    excluirAutorId?: number,
  ): Promise<Pagina<Resena>> {
    const consulta = this.repo
      .createQueryBuilder('resena')
      .leftJoinAndSelect('resena.autor', 'autor')
      .leftJoinAndSelect('resena.imagenes', 'imagen')
      .where('resena.visible = true')
      .orderBy('resena.fecha', 'DESC')
      .addOrderBy('resena.id', 'DESC');
    if (tipo === 'PUBLICACION') {
      consulta.andWhere('resena.id_publicacion = :idObjetivo', { idObjetivo });
    } else {
      consulta.andWhere('resena.id_anunciante = :idObjetivo', { idObjetivo });
    }
    if (excluirAutorId !== undefined) {
      consulta.andWhere('resena.id_usuario != :excluirAutorId', { excluirAutorId });
    }
    return paginar(consulta, { pagina, limite });
  }

  async obtenerResumen(tipo: TipoObjetivoResena, idObjetivo: number): Promise<ResumenResenas> {
    const consulta = this.repo
      .createQueryBuilder('resena')
      .select('resena.puntaje', 'puntaje')
      .addSelect('COUNT(*)::int', 'cantidad')
      .where('resena.visible = true')
      .groupBy('resena.puntaje');
    if (tipo === 'PUBLICACION') {
      consulta.andWhere('resena.id_publicacion = :idObjetivo', { idObjetivo });
    } else {
      consulta.andWhere('resena.id_anunciante = :idObjetivo', { idObjetivo });
    }
    const filas = await consulta.getRawMany<{ puntaje: number; cantidad: number }>();
    const porPuntaje = new Map(
      filas.map((fila) => [Number(fila.puntaje), Number(fila.cantidad)]),
    );
    const distribucion = [5, 4, 3, 2, 1].map((puntaje) => ({
      puntaje,
      cantidad: porPuntaje.get(puntaje) ?? 0,
    }));
    const cantidad = distribucion.reduce((total, fila) => total + fila.cantidad, 0);
    const suma = distribucion.reduce(
      (total, fila) => total + fila.puntaje * fila.cantidad,
      0,
    );
    return {
      cantidad,
      promedio: cantidad ? Math.round((suma / cantidad) * 100) / 100 : null,
      distribucion,
    };
  }

  actualizar(resena: Resena, cambios: Partial<Resena>): Promise<Resena> {
    return this.repo.save(Object.assign(resena, cambios));
  }

  async eliminar(resena: Resena): Promise<void> {
    await this.repo.remove(resena);
  }

  listarAdministracion(
    pagina: number,
    limite: number,
    filtro: FiltroResenasAdministracion,
    idResena?: number,
  ): Promise<Pagina<Resena>> {
    const consulta = this.repo
      .createQueryBuilder('resena')
      .leftJoinAndSelect('resena.autor', 'autor')
      .leftJoinAndSelect('resena.imagenes', 'imagen')
      .leftJoinAndSelect('resena.publicacion', 'publicacion')
      .leftJoinAndSelect('resena.anunciante', 'anunciante')
      .leftJoinAndSelect('anunciante.usuario', 'anuncianteUsuario')
      .leftJoinAndSelect('resena.moderador', 'moderador')
      .orderBy('resena.fecha', 'DESC')
      .addOrderBy('resena.id', 'DESC');
    if (filtro.visible !== undefined) {
      consulta.andWhere('resena.visible = :visible', { visible: filtro.visible });
    }
    if (filtro.denunciada !== undefined) {
      consulta.andWhere('resena.denunciada = :denunciada', { denunciada: filtro.denunciada });
    }
    if (idResena !== undefined) {
      consulta.andWhere('resena.id = :idResena', { idResena });
    }
    return paginar(consulta, { pagina, limite });
  }

  async registrarDenuncia(idResena: number, idUsuario: number, motivo: string, fecha: Date): Promise<void> {
    await this.repo.save(this.repo.create({
      id: idResena,
      denunciada: true,
      motivo_denuncia: motivo,
      fecha_denuncia: fecha,
      denunciante: { id: idUsuario },
    }));
  }

  async registrarModeracion(idResena: number, datos: DatosModeracionResena): Promise<void> {
    await this.repo.save(this.repo.create({
      id: idResena,
      visible: datos.visible,
      motivo_moderacion: datos.motivo,
      fecha_moderacion: datos.fecha,
      moderador: datos.idAdministrador === null ? null : { id: datos.idAdministrador },
    }));
  }

  async quitarDenuncia(idResena: number): Promise<void> {
    await this.repo.save(this.repo.create({
      id: idResena,
      denunciada: false,
      motivo_denuncia: null,
      fecha_denuncia: null,
      denunciante: null,
    }));
  }
}
