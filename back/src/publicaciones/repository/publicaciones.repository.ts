import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { ListarPublicacionesAdministracionDto } from '../dto/listar-publicaciones-administracion.dto';
import type { EstadoPublicacionAdministracion } from '../dto/listar-publicaciones-administracion.dto';
import { ListarMisPublicacionesDto } from '../dto/listar-mis-publicaciones.dto';
import { paginar } from '../../common/persistence/paginacion';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { Publicacion } from '../entity/publicacion.entity';
import { Imagen } from '../../imagenes/entity/imagen.entity';
import {
  AreaMapaPublicaciones,
  CategoriaInicio,
  ConsultaPublicaciones,
  FiltrosPublicaciones,
  IPublicacionesRepository,
  PaginaPublicaciones,
  PuntoPublicacion,
} from './publicaciones.repository.interface';
import { PATRON_RESERVA_POR_FECHA } from '../../catalogos/entity/modalidad.entity';

@Injectable()
export class PublicacionesRepository implements IPublicacionesRepository {
  private sqlAdmiteReservaPorFecha(alias: string): string {
    return `COALESCE(${alias}.permite_reservas_por_fecha, ${alias}.nombre ~* '${PATRON_RESERVA_POR_FECHA}', false)`;
  }
  async bloquearPorId(id: number, transaccion: EntityManager): Promise<Publicacion | null> {
    if (!transaccion.queryRunner?.isTransactionActive) {
      throw new Error('La publicación debe bloquearse dentro de una transacción');
    }
    const publicacion = await transaccion.getRepository(Publicacion)
      .createQueryBuilder('publicacion')
      .where('publicacion.id = :id', { id })
      .setLock('pessimistic_write')
      .getOne();
    return publicacion;
  }

  buscarCondicionesDeReserva(id: number, transaccion: EntityManager): Promise<Publicacion | null> {
    // La pausa actualiza la misma fila y el bloqueo se conserva hasta el commit.
    return transaccion.getRepository(Publicacion)
      .createQueryBuilder('publicacion')
      .innerJoinAndSelect('publicacion.anunciante', 'anunciante')
      .leftJoinAndSelect('anunciante.usuario', 'usuario')
      .leftJoinAndSelect('publicacion.tipoMoneda', 'tipoMoneda')
      .where('publicacion.id = :id', { id })
      .setLock('pessimistic_read', undefined, ['anunciante'])
      .getOne();
  }
  async bloquearPorAnunciante(idUsuario: number, transaccion: EntityManager): Promise<boolean> {
    const publicaciones = await transaccion.getRepository(Publicacion)
      .createQueryBuilder('publicacion')
      .select('publicacion.id')
      .where('publicacion.id_anunciante = :idUsuario', { idUsuario })
      .orderBy('publicacion.id', 'ASC')
      .setLock('pessimistic_write')
      .getMany();
    return publicaciones.length > 0;
  }

  async desactivarPorAnunciante(idUsuario: number, transaccion: EntityManager): Promise<void> {
    await transaccion.createQueryBuilder()
      .update(Publicacion)
      .set({ activa: false })
      .where('id_anunciante = :idUsuario', { idUsuario })
      .execute();
  }
  constructor(@InjectRepository(Publicacion) private readonly repo: Repository<Publicacion>) {}

  crear(datos: Partial<Publicacion>): Publicacion {
    return this.repo.create(datos);
  }

  guardar(publicacion: Publicacion): Promise<Publicacion> {
    return this.repo.save(publicacion);
  }

  async actualizarSiNoEliminada(id: number, cambios: Partial<Publicacion>): Promise<boolean> {
    const resultado = await this.repo.update({ id, eliminada: false,
      ...(cambios.activa === true ? { motivo_baja_admin: IsNull() } : {}),
    }, cambios);
    return (resultado.affected ?? 0) > 0;
  }

  async marcarActiva(id: number): Promise<boolean> {
    // UPDATE directo: no toca relaciones (a diferencia de save con la entidad cargada).
    // Filtrar por inactiva hace que solo un pedido concurrente informe la activación.
    const resultado = await this.repo.update({ id, eliminada: false, motivo_baja_admin: IsNull(), activa: false }, { activa: true });
    return (resultado.affected ?? 0) > 0;
  }

  async darDeBaja(id: number, motivo: string): Promise<void> {
    await this.repo.update({ id }, { activa: false, motivo_baja_admin: motivo });
  }

  async reactivar(id: number): Promise<boolean> {
    // El filtro por motivo impide que dos pedidos simultáneos reactiven la misma publicación.
    // La publicación queda inactiva: el anunciante decide cuándo volver a publicarla.
    const resultado = await this.repo.update({ id, eliminada: false, motivo_baja_admin: Not(IsNull()) }, { activa: false, motivo_baja_admin: null });
    return (resultado.affected ?? 0) > 0;
  }

  async incrementarVisualizaciones(id: number): Promise<void> {
    await this.repo.increment({ id }, 'visualizaciones', 1);
  }

  buscarPorId(id: number): Promise<Publicacion | null> {
    // Esta consulta carga todas las relaciones necesarias para detalle, propiedad y galería.
    return this.repo.findOne({
      where: { id },
      relations: {
        anunciante: { usuario: true, tipoAnunciante: true },
        tipoMoneda: true,
        modalidad: true,
        provincia: true,
        ciudad: true,
        tipoPropiedad: true,
        imagenes: true,
      },
      // La primera foto según el orden elegido es la portada; el ID desempata datos históricos.
      order: { imagenes: { orden: 'ASC', id: 'ASC' } },
    });
  }

  buscarAdministracion(consulta: ListarPublicacionesAdministracionDto) {
    const query = this.repo.createQueryBuilder('publicacion')
      .leftJoinAndSelect('publicacion.anunciante', 'anunciante')
      .leftJoinAndSelect('anunciante.usuario', 'usuario')
      .leftJoinAndSelect('publicacion.ciudad', 'ciudad')
      .leftJoinAndSelect('publicacion.provincia', 'provincia')
      .orderBy('publicacion.fecha_publicacion', 'DESC')
      .addOrderBy('publicacion.id', 'DESC');
    this.aplicarEstadoAdministracion(query, consulta.estado);
    if (consulta.q?.trim()) {
      query.andWhere(
        "POSITION(:q IN LOWER(CONCAT_WS(' ', publicacion.id, publicacion.titulo, usuario.nombre, usuario.apellido, usuario.email))) > 0",
        { q: consulta.q.trim().toLowerCase() },
      );
    }
    return paginar(query, consulta);
  }

  private aplicarEstadoAdministracion(query: SelectQueryBuilder<Publicacion>, estado: EstadoPublicacionAdministracion = 'todas'): void {
    switch (estado) {
      case 'activas':
        query.andWhere('publicacion.activa = true AND publicacion.motivo_baja_admin IS NULL');
        break;
      case 'inactivas':
        query.andWhere('publicacion.activa = false AND publicacion.motivo_baja_admin IS NULL');
        break;
      case 'bajas':
        query.andWhere('publicacion.motivo_baja_admin IS NOT NULL');
        break;
      case 'todas':
        break;
    }
  }

  async buscarMiasPaginadas(idAnunciante: number, consulta: ListarMisPublicacionesDto) {
    const query = this.repo.createQueryBuilder('publicacion')
      .leftJoinAndSelect('publicacion.tipoMoneda', 'tipoMoneda')
      .leftJoinAndSelect('publicacion.modalidad', 'modalidad')
      .leftJoinAndSelect('publicacion.tipoPropiedad', 'tipoPropiedad')
      .leftJoinAndSelect('publicacion.provincia', 'provincia')
      .leftJoinAndSelect('publicacion.ciudad', 'ciudad')
      .where('publicacion.id_anunciante = :idAnunciante', { idAnunciante })
      .andWhere('publicacion.eliminada = false')
      .orderBy('publicacion.fecha_publicacion', 'DESC')
      .addOrderBy('publicacion.id', 'DESC');
    if (consulta.q?.trim()) {
      query.andWhere(
        "POSITION(:q IN LOWER(CONCAT_WS(' ', publicacion.id, publicacion.titulo, publicacion.descripcion, publicacion.direccion, ciudad.nombre, provincia.nombre))) > 0",
        { q: consulta.q.trim().toLowerCase() },
      );
    }
    // La cuenta de activas usa los mismos filtros de búsqueda.
    const activas = await query.clone().andWhere('publicacion.activa = true').getCount();
    const pagina = await paginar(query, consulta);
    const ids = pagina.datos.map((publicacion) => publicacion.id);
    if (ids.length) {
      const conImagenes = await this.repo.find({
        where: ids.map((id) => ({ id })),
        relations: { imagenes: true },
        order: { imagenes: { orden: 'ASC', id: 'ASC' } },
      });
      const porId = new Map(conImagenes.map((publicacion) => [publicacion.id, publicacion]));
      for (const publicacion of pagina.datos)
        publicacion.imagenes = porId.get(publicacion.id)?.imagenes ?? [];
    }
    return { ...pagina, activas };
  }

  buscarPapeleraPorAnunciante(idAnunciante: number): Promise<Publicacion[]> {
    return this.repo.find({
      where: { eliminada: true, anunciante: { idUsuario: idAnunciante } },
      relations: {
        tipoPropiedad: true,
        ciudad: true,
        provincia: true,
        modalidad: true,
        tipoMoneda: true,
        imagenes: true,
      },
      order: { fecha_publicacion: 'DESC', id: 'DESC', imagenes: { orden: 'ASC', id: 'ASC' } },
    });
  }

  buscarTodasActivas(): Promise<Publicacion[]> {
    // Se agregan imagenes y anunciante porque el listado público (home) necesita
    // mostrar la imagen principal y el estado "verificado" del anunciante por cada tarjeta.
    return this.repo.find({
      where: { activa: true, eliminada: false, anunciante: { actividades_pausadas: false, usuario: { activa: true, bloqueado: false } } },
      relations: {
        tipoPropiedad: true,
        ciudad: true,
        provincia: true,
        modalidad: true,
        tipoMoneda: true,
        imagenes: true,
        anunciante: { usuario: true, tipoAnunciante: true },
      },
      order: { imagenes: { orden: 'ASC', id: 'ASC' } },
    });
  }

  /**
   * Página del catálogo público. Primero se resuelven solamente IDs y el
   * agregado de reservas en SQL; después se cargan las relaciones de esos IDs.
   * Así una petición nunca materializa el catálogo completo en memoria.
   */
  async buscarPaginadas(consulta: ConsultaPublicaciones): Promise<PaginaPublicaciones> {
    const { pagina, limite, categoria, orden, conversionUsd } = consulta;
    const base = this.consultaCatalogoPublico(consulta);
    // Sin cotización, el precio se ordena por su número aunque las monedas sean distintas.
    const precioOrden = conversionUsd
      ? 'CASE WHEN tipoMoneda.id IN (:...idsMonedaUsd) THEN publicacion.precio * CAST(:ventaUsd AS numeric) ELSE publicacion.precio END'
      : 'publicacion.precio';
    const total = await base.clone().getCount();

    const reservas = this.repo.createQueryBuilder('anuncio')
      .innerJoin('anuncio.reservas', 'reserva')
      .select('anuncio.id', 'idPublicacion')
      .addSelect('COUNT(*)', 'cantidad')
      .where('reserva.cancelada = :cancelada', { cancelada: false })
      .groupBy('anuncio.id');

    const ordenes = {
      recientes: {
        columna: 'publicacion.fecha_publicacion',
        direccion: 'DESC',
      },
      antiguas: { columna: 'publicacion.fecha_publicacion', direccion: 'ASC' },
      'precio-menor': { columna: '"precioOrden"', direccion: 'ASC' },
      'precio-mayor': { columna: '"precioOrden"', direccion: 'DESC' },
      titulo: { columna: 'LOWER(publicacion.titulo)', direccion: 'ASC' },
      resenas: { columna: '"prioridadResenas"', direccion: 'ASC' },
    } as const;
    const ordenSeleccionado = orden
      ? ordenes[orden]
      : categoria === 'reservadas'
        ? {
            columna: 'COALESCE(reservas.cantidad, 0)',
            direccion: 'DESC' as const,
          }
        : ordenes.recientes;
    const consultaFilas = base
      .clone()
      .select('publicacion.id', 'id')
      .addSelect('COALESCE(reservas.cantidad, 0)', 'cantidadReservas')
      .addSelect('publicacion.fecha_publicacion', 'fechaPublicacion')
      .addSelect(precioOrden, 'precioOrden')
      .addSelect('LOWER(publicacion.titulo)', 'tituloOrden')
      .addSelect('CASE WHEN publicacion.cantidad_resenas > 0 AND publicacion.promedio_resenas IS NOT NULL THEN 0 WHEN anunciante.cantidad_resenas > 0 AND anunciante.promedio_resenas IS NOT NULL THEN 1 ELSE 2 END', 'prioridadResenas')
      .addSelect('CASE WHEN publicacion.cantidad_resenas > 0 AND publicacion.promedio_resenas IS NOT NULL THEN publicacion.promedio_resenas WHEN anunciante.cantidad_resenas > 0 THEN anunciante.promedio_resenas ELSE NULL END', 'promedioOrden')
      .leftJoin(
        `(${reservas.getQuery()})`,
        'reservas',
        'reservas."idPublicacion" = publicacion.id_publicacion',
      )
      .setParameters(reservas.getParameters())
      .setParameters(conversionUsd ? { idsMonedaUsd: conversionUsd.idsMoneda, ventaUsd: conversionUsd.venta } : {})
      .orderBy(ordenSeleccionado.columna, ordenSeleccionado.direccion);
    if (orden === 'resenas') consultaFilas.addOrderBy('"promedioOrden"', 'DESC', 'NULLS LAST');
    const filas = await consultaFilas.addOrderBy('publicacion.id', 'DESC')
      .offset((pagina - 1) * limite)
      .limit(limite)
      .getRawMany<{ id: string; cantidadReservas: string }>();

    const ids = filas.map((fila) => Number(fila.id));
    const publicaciones = ids.length
      ? await this.repo.find({
          where: ids.map((id) => ({ id, activa: true, eliminada: false,
            anunciante: { actividades_pausadas: false, usuario: { activa: true, bloqueado: false } } })),
          relations: {
            tipoPropiedad: true,
            ciudad: true,
            provincia: true,
            modalidad: true,
            tipoMoneda: true,
            imagenes: true,
            anunciante: { usuario: true, tipoAnunciante: true },
          },
          order: { imagenes: { orden: 'ASC', id: 'ASC' } },
        })
      : [];
    const porId = new Map(
      publicaciones.map((publicacion) => [publicacion.id, publicacion]),
    );
    const datos = filas.flatMap((fila) => {
      const publicacion = porId.get(Number(fila.id));
      // Object.assign conserva la instancia (y sus métodos); un spread la copiaría como objeto plano.
      return publicacion
        ? [
            Object.assign(publicacion, {
              cantidad_reservas: Number(fila.cantidadReservas),
            }),
          ]
        : [];
    });

    return {
      datos,
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  async buscarPuntos(filtros: FiltrosPublicaciones, area: AreaMapaPublicaciones | undefined, limite: number, antesDe?: number): Promise<PuntoPublicacion[]> {
    const query = this.consultaCatalogoPublico(filtros)
      .andWhere('publicacion.latitud BETWEEN -90 AND 90')
      .andWhere('publicacion.longitud BETWEEN -180 AND 180');
    if (area) {
      query.andWhere('publicacion.latitud BETWEEN :sur AND :norte AND publicacion.longitud BETWEEN :oeste AND :este', { ...area });
    }
    if (antesDe != null) query.andWhere('publicacion.id < :antesDe', { antesDe });

    const filas = await query.select('publicacion.id', 'id')
      .addSelect('publicacion.titulo', 'titulo')
      .addSelect('ciudad.nombre', 'ciudad')
      .addSelect((subconsulta) => subconsulta
        .select('portada.url')
        .from(Imagen, 'portada')
        .where('portada.id_publicacion = publicacion.id_publicacion')
        .orderBy('portada.orden', 'ASC')
        .addOrderBy('portada.id', 'ASC')
        .limit(1), 'portada')
      .addSelect('publicacion.latitud', 'latitud')
      .addSelect('publicacion.longitud', 'longitud')
      .addSelect('publicacion.precio', 'precio')
      .addSelect('tipoMoneda.nombre', 'moneda')
      .addSelect(this.sqlAdmiteReservaPorFecha('modalidad'), 'temporal')
      .orderBy('publicacion.id', 'DESC')
      .limit(limite)
      .getRawMany<PuntoPublicacion>();

    // PostgreSQL devuelve los decimales como cadenas cuando se leen filas crudas.
    return filas.map((fila) => ({
      ...fila,
      latitud: Number(fila.latitud),
      longitud: Number(fila.longitud),
      precio: Number(fila.precio),
    }));
  }

  private consultaCatalogoPublico(filtros: FiltrosPublicaciones): SelectQueryBuilder<Publicacion> {
    const {
      categoria,
      busqueda,
      idsCiudad,
      idProvincia,
      idsTipoPropiedad,
      idsTipoMoneda,
      precioMin,
      precioMax,
      superficieMin,
      ambientes,
    } = filtros;
    const base = this.repo
      .createQueryBuilder('publicacion')
      .innerJoin('publicacion.imagenes', 'imagen')
      .leftJoin('publicacion.modalidad', 'modalidad')
      .leftJoin('publicacion.ciudad', 'ciudad')
      .leftJoin('publicacion.provincia', 'provincia')
      .leftJoin('publicacion.tipoPropiedad', 'tipoPropiedad')
      .leftJoin('publicacion.tipoMoneda', 'tipoMoneda')
      .leftJoin('publicacion.anunciante', 'anunciante')
      .leftJoin('anunciante.usuario', 'usuario')
      .leftJoin('anunciante.tipoAnunciante', 'tipoAnunciante')
      .where('publicacion.activa = :activa', { activa: true })
      .andWhere('publicacion.eliminada = false')
      .andWhere('usuario.activa = true AND usuario.bloqueado = false')
      .andWhere('anunciante.actividades_pausadas = false')
      .distinct(true);

    this.aplicarCategoria(base, categoria);
    this.aplicarBusqueda(base, busqueda);
    if (idProvincia != null)
      base.andWhere('provincia.id = :idProvincia', { idProvincia });
    if (idsCiudad?.length)
      base.andWhere('ciudad.id IN (:...idsCiudad)', { idsCiudad });
    if (idsTipoPropiedad?.length) {
      base.andWhere('tipoPropiedad.id IN (:...idsTipoPropiedad)', {
        idsTipoPropiedad,
      });
    }
    if (idsTipoMoneda?.length) {
      base.andWhere('tipoMoneda.id IN (:...idsTipoMoneda)', { idsTipoMoneda });
    }
    if (precioMin != null)
      base.andWhere('publicacion.precio >= :precioMin', { precioMin });
    if (precioMax != null)
      base.andWhere('publicacion.precio <= :precioMax', { precioMax });
    if (superficieMin != null)
      base.andWhere('publicacion.superficie >= :superficieMin', { superficieMin });
    if (ambientes?.length) {
      const exactos = ambientes
        .filter((ambiente) => ambiente !== '4+')
        .map(Number);
      const condiciones = [
        ...(exactos.length
          ? ['publicacion.cantidad_ambientes IN (:...ambientesExactos)']
          : []),
        ...(ambientes.includes('4+')
          ? ['publicacion.cantidad_ambientes >= 4']
          : []),
      ];
      base.andWhere(`(${condiciones.join(' OR ')})`, {
        ambientesExactos: exactos,
      });
    }
    return base;
  }

  private aplicarCategoria(query: SelectQueryBuilder<Publicacion>, categoria?: CategoriaInicio): void {
    // Misma regla que calendario y reservas: "temporales" son las modalidades por fecha.
    if (categoria === 'temporales')
      query.andWhere(this.sqlAdmiteReservaPorFecha('modalidad'));
    if (categoria === 'largo-plazo')
      query.andWhere(`NOT ${this.sqlAdmiteReservaPorFecha('modalidad')}`);
    if (categoria === 'villa-maria')
      query.andWhere('LOWER(ciudad.nombre) IN (:...ciudades)', {
        ciudades: ['villa maria', 'villa maría'],
      });
    if (categoria === 'reservadas') {
      query.andWhere(
        `EXISTS (SELECT 1 FROM reserva reserva_filtro WHERE reserva_filtro.id_publicacion = publicacion.id_publicacion AND reserva_filtro.cancelada = false)`,
      );
    }
  }

  /**
   * Búsqueda libre sobre los datos públicos que una persona ve en el
   * catálogo o el detalle. Cada palabra puede aparecer en un campo distinto;
   * por ejemplo, "casa villa maria" combina tipo de propiedad y ciudad.
   */
  private aplicarBusqueda(query: SelectQueryBuilder<Publicacion>, busqueda?: string): void {
    const terminos = (busqueda ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[%_]/g, ' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 10);

    if (!terminos.length) return;

    const documento = `TRANSLATE(LOWER(CONCAT_WS(' ',
      publicacion.titulo,
      publicacion.descripcion,
      publicacion.direccion,
      ciudad.nombre,
      provincia.nombre,
      tipoPropiedad.nombre,
      tipoPropiedad.descripcion,
      modalidad.nombre,
      modalidad.descripcion,
      tipoMoneda.nombre,
      tipoMoneda.descripcion,
      usuario.nombre,
      usuario.apellido,
      tipoAnunciante.nombre,
      publicacion.precio,
      publicacion.cantidad_ambientes,
      publicacion.superficie,
      publicacion.fecha_publicacion,
      CONCAT(publicacion.cantidad_ambientes, ' ambientes'),
      CONCAT(publicacion.superficie, ' m2')
    )), 'áéíóúüñ', 'aeiouun')`;

    terminos.forEach((termino, indice) => {
      query.andWhere(`${documento} LIKE :busqueda${indice}`, {
        [`busqueda${indice}`]: `%${termino}%`,
      });
    });
  }

  buscarPorAnunciante(idAnunciante: number, soloActivas: boolean, incluirEliminadas = false): Promise<Publicacion[]> {
    // El spread agrega el filtro activa únicamente cuando el caller lo solicita.
    return this.repo.find({
      where: {
        anunciante: { idUsuario: idAnunciante },
        ...(incluirEliminadas ? {} : { eliminada: false }),
        ...(soloActivas ? { activa: true } : {}),
      },
      relations: {
        tipoPropiedad: true,
        ciudad: true,
        provincia: true,
        modalidad: true,
        tipoMoneda: true,
        imagenes: true,
        anunciante: { usuario: true, tipoAnunciante: true },
      },
      order: { fecha_publicacion: 'DESC', imagenes: { orden: 'ASC', id: 'ASC' } },
    });
  }

  async eliminar(publicacion: Publicacion): Promise<Publicacion> {
    // UPDATE toma el mismo bloqueo de fila que usa la creación de reservas.
    // No borra fotos, fechas, mensajes ni la FK que conserva la reserva.
    await this.repo.update({ id: publicacion.id }, {
      activa: publicacion.activa, eliminada: publicacion.eliminada,
    });
    return publicacion;
  }

  async restaurar(id: number): Promise<boolean> {
    const resultado = await this.repo.update({ id, eliminada: true }, { eliminada: false, activa: false });
    return (resultado.affected ?? 0) > 0;
  }

  async actualizarResumenResenas(id: number, cantidad: number, promedio: number | null, transaccion?: EntityManager): Promise<void> {
    const repo = transaccion?.getRepository(Publicacion) ?? this.repo;
    await repo.update({ id }, {
      cantidad_resenas: cantidad,
      promedio_resenas: promedio,
    });
  }
}
