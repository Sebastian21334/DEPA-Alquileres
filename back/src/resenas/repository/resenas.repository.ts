import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type EntityManager } from 'typeorm';
import { guardarSinDuplicados } from '../../common/persistence/valor-duplicado.error';
import { paginar, type Pagina } from '../../common/persistence/paginacion';
import { Resena, type ObjetivoResena } from '../entity/resena.entity';
import type {
  DatosModeracionResena,
  DatosResenaAnunciante,
  DatosResenaPublicacion,
  DatosResolucionDenuncia,
  FiltroResenasAdministracion,
  IResenaAccesoRepository,
  IResenaRepository,
  ResenaAcceso,
  ResolucionDenunciaResena,
} from './resena.repository.interface';

const RESTRICCIONES_RESEÑA = [
  'uq_resena_publicacion_autor',
  'uq_resena_anunciante_autor',
];

@Injectable()
export class ResenasRepository implements IResenaRepository, IResenaAccesoRepository {
  constructor(@InjectRepository(Resena) private readonly repo: Repository<Resena>) {}

  conTransaccion<T>(operacion: (repositorio: IResenaRepository, transaccion: EntityManager) => Promise<T>): Promise<T> {
    return this.repo.manager.transaction((transaccion) =>
      operacion(new ResenasRepository(transaccion.getRepository(Resena)), transaccion),
    );
  }

  async buscarParaModerar(id: number): Promise<Resena | null> {
    const bloqueada = await this.repo.findOne({
      where: { id },
      select: { id: true },
      lock: { mode: 'pessimistic_write' },
    });
    return bloqueada ? this.buscarPorId(id) : null;
  }

  async registrarResolucionDenuncia(idResena: number, datos: DatosResolucionDenuncia): Promise<void> {
    await this.repo.manager.query(`
      INSERT INTO public.resena_denuncia_resolucion
        (id_resena, id_denunciante, motivo_denuncia, fecha_denuncia, aceptada, motivo_resolucion, id_administrador)
      SELECT id_resena, denunciada_por, motivo_denuncia, fecha_denuncia, $2, $3, $4
      FROM public.resena WHERE id_resena = $1
    `, [idResena, datos.aceptada, datos.motivo, datos.idAdministrador]);
    await this.repo.update(idResena, {
      denunciada: false,
      motivo_denuncia: null,
      fecha_denuncia: null,
      denunciante: null,
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

  buscarPorObjetivoYAutor(tipo: ObjetivoResena['tipo'], idObjetivo: number, idUsuario: number): Promise<Resena | null> {
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

  buscarPaginaPorObjetivo(tipo: ObjetivoResena['tipo'], idObjetivo: number, pagina: number, limite: number, excluirAutorId?: number): Promise<Pagina<Resena>> {
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

  contarVisiblesPorPuntaje(objetivo: ObjetivoResena): Promise<{ puntaje: number; cantidad: number }[]> {
    const consulta = this.repo
      .createQueryBuilder('resena')
      .select('resena.puntaje', 'puntaje')
      .addSelect('COUNT(*)::int', 'cantidad')
      .where('resena.visible = true')
      .groupBy('resena.puntaje');
    if (objetivo.tipo === 'PUBLICACION') {
      consulta.andWhere('resena.id_publicacion = :idObjetivo', { idObjetivo: objetivo.id });
    } else {
      consulta.andWhere('resena.id_anunciante = :idObjetivo', { idObjetivo: objetivo.id });
    }
    return consulta.getRawMany<{ puntaje: number; cantidad: number }>();
  }

  async bloquearResumen(objetivo: ObjetivoResena): Promise<void> {
    await this.repo.manager.query('SELECT pg_advisory_xact_lock(hashtext($1), $2)', [`depa:resenas:${objetivo.tipo}`, objetivo.id]);
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
    await this.repo.update(idResena, {
      visible: datos.visible,
      motivo_moderacion: datos.motivo,
      fecha_moderacion: datos.fecha,
      moderador: datos.idAdministrador === null ? null : { id: datos.idAdministrador },
    });
  }
}
