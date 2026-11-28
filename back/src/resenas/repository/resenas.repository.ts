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
  ResolucionDenunciaResena,
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

  async resolverDenuncia(idResena: number, idAdministrador: number, aceptada: boolean, motivo: string): Promise<boolean> {
    return this.repo.manager.transaction(async (manager) => {
      const filas = await manager.query('SELECT id_resena, denunciada, motivo_denuncia, fecha_denuncia, denunciada_por FROM public.resena WHERE id_resena = $1 FOR UPDATE', [idResena]);
      const resena = filas[0];
      if (!resena?.denunciada) return false;
      await manager.query('INSERT INTO public.resena_denuncia_resolucion (id_resena, id_denunciante, motivo_denuncia, fecha_denuncia, aceptada, motivo_resolucion, id_administrador) VALUES ($1, $2, $3, $4, $5, $6, $7)', [idResena, resena.denunciada_por, resena.motivo_denuncia, resena.fecha_denuncia, aceptada, motivo, idAdministrador]);
      await manager.query('UPDATE public.resena SET denunciada = false, motivo_denuncia = NULL, fecha_denuncia = NULL, denunciada_por = NULL, visible = CASE WHEN $2 THEN false ELSE visible END, motivo_moderacion = CASE WHEN $2 THEN $3 ELSE motivo_moderacion END, fecha_moderacion = CASE WHEN $2 THEN now() ELSE fecha_moderacion END, moderada_por = CASE WHEN $2 THEN $4 ELSE moderada_por END WHERE id_resena = $1', [idResena, aceptada, motivo, idAdministrador]);
      return true;
    });
  }

  historialDenuncias(): Promise<ResolucionDenunciaResena[]> {
    return this.repo.manager.query('SELECT h.id, h.id_resena, h.motivo_denuncia, h.fecha_denuncia, h.aceptada, h.motivo_resolucion, h.fecha_resolucion, h.id_administrador, u.nombre AS administrador_nombre, u.apellido AS administrador_apellido FROM public.resena_denuncia_resolucion h LEFT JOIN public.usuario u ON u.id_usuario = h.id_administrador ORDER BY h.fecha_resolucion DESC, h.id DESC LIMIT 100');
  }

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

  buscarVisiblesRecibidas(idAnunciante: number, autores: number[], publicaciones: number[]): Promise<{ autor: number; publicacion: number | null; anunciante: number | null }[]> {
    if (!autores.length || !publicaciones.length) return Promise.resolve([]);
    return this.repo.createQueryBuilder('resena')
      .select('resena.id_usuario', 'autor')
      .addSelect('resena.id_publicacion', 'publicacion')
      .addSelect('resena.id_anunciante', 'anunciante')
      .where('resena.visible = true AND resena.id_usuario IN (:...autores)', { autores })
      .andWhere('(resena.id_publicacion IN (:...publicaciones) OR resena.id_anunciante = :idAnunciante)', { publicaciones, idAnunciante })
      .getRawMany();
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

  async registrarDenuncia(idResena: number, idUsuario: number, motivo: string, fecha: Date): Promise<boolean> {
    const resultado = await this.repo.createQueryBuilder().update(Resena)
      .set({ denunciada: true, motivo_denuncia: motivo, fecha_denuncia: fecha, denunciante: { id: idUsuario } as Resena['denunciante'] })
      .where('id_resena = :id AND visible = true AND denunciada = false', { id: idResena })
      .execute();
    return (resultado.affected ?? 0) > 0;
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
