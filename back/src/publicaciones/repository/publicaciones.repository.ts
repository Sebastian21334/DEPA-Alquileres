import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { ListarAdministracionDto } from '../../common/dto/listar-administracion.dto';
import { paginar } from '../../common/persistence/paginacion';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, SelectQueryBuilder } from 'typeorm';
import { Publicacion } from '../entity/publicacion.entity';
import {
  CategoriaInicio,
  ConsultaPublicaciones,
  IPublicacionesRepository,
  PaginaPublicaciones,
} from './publicaciones.repository.interface';
import { Reserva } from '../../reservas/entity/reserva.entity';
import { PATRON_RESERVA_POR_FECHA } from '../../catalogos/entity/modalidad.entity';

@Injectable()
export class PublicacionesRepository implements IPublicacionesRepository {
  private sqlAdmiteReservaPorFecha(alias: string): string {
    return `COALESCE(${alias}.permite_reservas_por_fecha, ${alias}.nombre ~* '${PATRON_RESERVA_POR_FECHA}', false)`;
  }
  async bloquearPorId(id: number, transaccion: EntityManager): Promise<boolean> {
    if (!transaccion.queryRunner?.isTransactionActive) {
      throw new Error('La publicación debe bloquearse dentro de una transacción');
    }
    const publicacion = await transaccion.getRepository(Publicacion)
      .createQueryBuilder('publicacion')
      .where('publicacion.id = :id', { id })
      .setLock('pessimistic_write')
      .getOne();
    return publicacion !== null;
  }

  buscarCondicionesDeReserva(id: number, transaccion: EntityManager): Promise<Publicacion | null> {
    return transaccion.getRepository(Publicacion).findOne({
      where: { id },
      relations: { tipoMoneda: true, anunciante: { usuario: true } },
    });
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
  constructor(@InjectRepository(Publicacion) private readonly repo: Repository<Publicacion>, @InjectRepository(Reserva) private readonly reservasRepo: Repository<Reserva>) {}

  crear(datos: Partial<Publicacion>): Publicacion {
    return this.repo.create(datos);
  }

  guardar(publicacion: Publicacion): Promise<Publicacion> {
    return this.repo.save(publicacion);
  }

  async marcarActiva(id: number): Promise<void> {
    // UPDATE directo: no toca relaciones (a diferencia de save con la entidad cargada).
    await this.repo.update({ id, motivo_baja_admin: IsNull() }, { activa: true });
  }

  async darDeBaja(id: number, motivo: string): Promise<void> {
    await this.repo.update({ id }, { activa: false, motivo_baja_admin: motivo });
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

  buscarTodas(): Promise<Publicacion[]> {
    return this.repo.find({
      relations: { anunciante: { usuario: true }, ciudad: true, provincia: true },
      order: { fecha_publicacion: 'DESC', id: 'DESC' },
    });
  }

  buscarAdministracion(consulta: ListarAdministracionDto) {
    const query = this.repo.createQueryBuilder('publicacion')
      .leftJoinAndSelect('publicacion.anunciante', 'anunciante')
      .leftJoinAndSelect('anunciante.usuario', 'usuario')
      .leftJoinAndSelect('publicacion.ciudad', 'ciudad')
      .leftJoinAndSelect('publicacion.provincia', 'provincia')
      .orderBy('publicacion.fecha_publicacion', 'DESC')
      .addOrderBy('publicacion.id', 'DESC');
    if (consulta.q?.trim()) {
      query.andWhere(
        "POSITION(:q IN LOWER(CONCAT_WS(' ', publicacion.id, publicacion.titulo, usuario.nombre, usuario.apellido, usuario.email))) > 0",
        { q: consulta.q.trim().toLowerCase() },
      );
    }
    return paginar(query, consulta);
  }

  buscarTodasActivas(): Promise<Publicacion[]> {
    // Se agregan imagenes y anunciante porque el listado público (home) necesita
    // mostrar la imagen principal y el estado "verificado" del anunciante por cada tarjeta.
    return this.repo.find({
      where: { activa: true, anunciante: { usuario: { activa: true, bloqueado: false } } },
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
    const {
      pagina,
      limite,
      categoria,
      orden,
      busqueda,
      idsCiudad,
      idProvincia,
      idsTipoPropiedad,
      idsTipoMoneda,
      precioMin,
      precioMax,
      superficieMin,
      ambientes,
    } = consulta;
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
      .andWhere('usuario.activa = true AND usuario.bloqueado = false')
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
    const total = await base.clone().getCount();

    const reservas = this.reservasRepo
      .createQueryBuilder('reserva')
      .select('reserva.id_publicacion', 'idPublicacion')
      .addSelect('COUNT(*)', 'cantidad')
      .where('reserva.cancelada = :cancelada', { cancelada: false })
      .groupBy('reserva.id_publicacion');

    const ordenes = {
      recientes: {
        columna: 'publicacion.fecha_publicacion',
        direccion: 'DESC',
      },
      antiguas: { columna: 'publicacion.fecha_publicacion', direccion: 'ASC' },
      'precio-menor': { columna: 'publicacion.precio', direccion: 'ASC' },
      'precio-mayor': { columna: 'publicacion.precio', direccion: 'DESC' },
      titulo: { columna: 'LOWER(publicacion.titulo)', direccion: 'ASC' },
    } as const;
    const ordenSeleccionado = orden
      ? ordenes[orden]
      : categoria === 'reservadas'
        ? {
            columna: 'COALESCE(reservas.cantidad, 0)',
            direccion: 'DESC' as const,
          }
        : ordenes.recientes;
    const filas = await base
      .clone()
      .select('publicacion.id', 'id')
      .addSelect('COALESCE(reservas.cantidad, 0)', 'cantidadReservas')
      .addSelect('publicacion.fecha_publicacion', 'fechaPublicacion')
      .addSelect('publicacion.precio', 'precioOrden')
      .addSelect('LOWER(publicacion.titulo)', 'tituloOrden')
      .leftJoin(
        `(${reservas.getQuery()})`,
        'reservas',
        'reservas."idPublicacion" = publicacion.id_publicacion',
      )
      .setParameters(reservas.getParameters())
      .orderBy(ordenSeleccionado.columna, ordenSeleccionado.direccion)
      .addOrderBy('publicacion.id', 'DESC')
      .offset((pagina - 1) * limite)
      .limit(limite)
      .getRawMany<{ id: string; cantidadReservas: string }>();

    const ids = filas.map((fila) => Number(fila.id));
    const publicaciones = ids.length
      ? await this.repo.find({
          where: ids.map((id) => ({ id, activa: true,
            anunciante: { usuario: { activa: true, bloqueado: false } } })),
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

  buscarPorAnunciante(idAnunciante: number, soloActivas: boolean): Promise<Publicacion[]> {
    // El spread agrega el filtro activa únicamente cuando el caller lo solicita.
    return this.repo.find({
      where: {
        anunciante: { idUsuario: idAnunciante },
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

  eliminar(publicacion: Publicacion): Promise<Publicacion> {
    return this.repo.remove(publicacion);
  }
}
