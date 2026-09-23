import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publicacion } from '../entity/publicacion.entity';
import { CategoriaInicio, ConsultaPublicaciones, IPublicacionesRepository, PaginaPublicaciones } from './publicaciones.repository.interface';
import { Reserva } from '../../reservas/entity/reserva.entity';

@Injectable()
export class PublicacionesRepository implements IPublicacionesRepository {
  constructor(
    @InjectRepository(Publicacion)
    private readonly repo: Repository<Publicacion>,
    @InjectRepository(Reserva)
    private readonly reservasRepo: Repository<Reserva>,
  ) {}

  crear(datos: Partial<Publicacion>): Publicacion {
    return this.repo.create(datos);
  }

  guardar(publicacion: Publicacion): Promise<Publicacion> {
    return this.repo.save(publicacion);
  }

  async marcarActiva(id: number): Promise<void> {
    // UPDATE directo: no toca relaciones (a diferencia de save con la entidad cargada).
    await this.repo.update({ id }, { activa: true });
  }

  buscarPorId(id: number): Promise<Publicacion | null> {
    // Esta consulta carga todas las relaciones necesarias para detalle, propiedad y galería.
    return this.repo.findOne({
      where: { id },
      relations: {
        anunciante: { usuario: true },
        tipoMoneda: true,
        modalidad: true,
        provincia: true,
        ciudad: true,
        tipoPropiedad: true,
        imagenes: true, // <- agregado
      },
    });
  }

  buscarTodasActivas(): Promise<Publicacion[]> {
    // Se agregan imagenes y anunciante porque el listado público (home) necesita
    // mostrar la imagen principal y el estado "verificado" del anunciante por cada tarjeta.
    return this.repo.find({
      where: { activa: true },
      relations: {
        tipoPropiedad: true,
        ciudad: true,
        provincia: true,
        modalidad: true,
        tipoMoneda: true,
        imagenes: true,
        anunciante: { usuario: true },
      },
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
      idsTipoPropiedad,
      idsTipoMoneda,
      precioMin,
      precioMax,
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
      .distinct(true);

    this.aplicarCategoria(base, categoria);
    this.aplicarBusqueda(base, busqueda);
    if (idsCiudad?.length) base.andWhere('ciudad.id IN (:...idsCiudad)', { idsCiudad });
    if (idsTipoPropiedad?.length) {
      base.andWhere('tipoPropiedad.id IN (:...idsTipoPropiedad)', { idsTipoPropiedad });
    }
    if (idsTipoMoneda?.length) {
      base.andWhere('tipoMoneda.id IN (:...idsTipoMoneda)', { idsTipoMoneda });
    }
    if (precioMin != null) base.andWhere('publicacion.precio >= :precioMin', { precioMin });
    if (precioMax != null) base.andWhere('publicacion.precio <= :precioMax', { precioMax });
    if (ambientes?.length) {
      const exactos = ambientes.filter((ambiente) => ambiente !== '4+').map(Number);
      const condiciones = [
        ...(exactos.length ? ['publicacion.cantidad_ambientes IN (:...ambientesExactos)'] : []),
        ...(ambientes.includes('4+') ? ['publicacion.cantidad_ambientes >= 4'] : []),
      ];
      base.andWhere(`(${condiciones.join(' OR ')})`, { ambientesExactos: exactos });
    }
    const total = await base.clone().getCount();

    const reservas = this.reservasRepo
      .createQueryBuilder('reserva')
      .select('reserva.id_publicacion', 'idPublicacion')
      .addSelect('COUNT(*)', 'cantidad')
      .where('reserva.cancelada = :cancelada', { cancelada: false })
      .groupBy('reserva.id_publicacion');

    const ordenes = {
      recientes: { columna: 'publicacion.fecha_publicacion', direccion: 'DESC' },
      antiguas: { columna: 'publicacion.fecha_publicacion', direccion: 'ASC' },
      'precio-menor': { columna: 'publicacion.precio', direccion: 'ASC' },
      'precio-mayor': { columna: 'publicacion.precio', direccion: 'DESC' },
      titulo: { columna: 'LOWER(publicacion.titulo)', direccion: 'ASC' },
    } as const;
    const ordenSeleccionado = orden
      ? ordenes[orden]
      : categoria === 'reservadas'
        ? { columna: 'COALESCE(reservas.cantidad, 0)', direccion: 'DESC' as const }
        : ordenes.recientes;
    const filas = await base
      .clone()
      .select('publicacion.id', 'id')
      .addSelect('COALESCE(reservas.cantidad, 0)', 'cantidadReservas')
      .addSelect('publicacion.fecha_publicacion', 'fechaPublicacion')
      .addSelect('publicacion.precio', 'precioOrden')
      .addSelect('LOWER(publicacion.titulo)', 'tituloOrden')
      .leftJoin(`(${reservas.getQuery()})`, 'reservas', 'reservas."idPublicacion" = publicacion.id_publicacion')
      .setParameters(reservas.getParameters())
      .orderBy(ordenSeleccionado.columna, ordenSeleccionado.direccion)
      .addOrderBy('publicacion.id', 'DESC')
      .offset((pagina - 1) * limite)
      .limit(limite)
      .getRawMany<{ id: string; cantidadReservas: string }>();

    const ids = filas.map((fila) => Number(fila.id));
    const publicaciones = ids.length
      ? await this.repo.find({
          where: ids.map((id) => ({ id, activa: true })),
          relations: { tipoPropiedad: true, ciudad: true, provincia: true, modalidad: true, tipoMoneda: true, imagenes: true, anunciante: { usuario: true } },
        })
      : [];
    const porId = new Map(publicaciones.map((publicacion) => [publicacion.id, publicacion]));
    const datos = filas
      .map((fila) => porId.get(Number(fila.id)))
      .filter((publicacion): publicacion is Publicacion => Boolean(publicacion))
      .map((publicacion, indice) => ({ ...publicacion, cantidad_reservas: Number(filas[indice].cantidadReservas) }));

    return { datos, pagina, limite, total, totalPaginas: Math.ceil(total / limite) };
  }

  private aplicarCategoria(query: any, categoria?: CategoriaInicio): void {
    if (categoria === 'temporales') query.andWhere('LOWER(modalidad.nombre) LIKE :temporal', { temporal: '%tempor%' });
    if (categoria === 'largo-plazo') query.andWhere('LOWER(modalidad.nombre) NOT LIKE :temporal', { temporal: '%tempor%' });
    if (categoria === 'villa-maria') query.andWhere('LOWER(ciudad.nombre) IN (:...ciudades)', { ciudades: ['villa maria', 'villa maría'] });
    if (categoria === 'reservadas') {
      query.andWhere(`EXISTS (SELECT 1 FROM reserva reserva_filtro WHERE reserva_filtro.id_publicacion = publicacion.id_publicacion AND reserva_filtro.cancelada = false)`);
    }
  }

  /**
   * Búsqueda libre sobre los datos públicos que una persona ve en el
   * catálogo o el detalle. Cada palabra puede aparecer en un campo distinto;
   * por ejemplo, "casa villa maria" combina tipo de propiedad y ciudad.
   */
  private aplicarBusqueda(query: any, busqueda?: string): void {
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
      order: { fecha_publicacion: 'DESC' },
    });
  }

  eliminar(publicacion: Publicacion): Promise<Publicacion> {
    return this.repo.remove(publicacion);
  }
}
