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
    const { pagina, limite, categoria } = consulta;
    const base = this.repo
      .createQueryBuilder('publicacion')
      .innerJoin('publicacion.imagenes', 'imagen')
      .leftJoin('publicacion.modalidad', 'modalidad')
      .leftJoin('publicacion.ciudad', 'ciudad')
      .where('publicacion.activa = :activa', { activa: true })
      .distinct(true);

    this.aplicarCategoria(base, categoria);
    const total = await base.clone().getCount();

    const reservas = this.reservasRepo
      .createQueryBuilder('reserva')
      .select('reserva.id_publicacion', 'idPublicacion')
      .addSelect('COUNT(*)', 'cantidad')
      .where('reserva.cancelada = :cancelada', { cancelada: false })
      .groupBy('reserva.id_publicacion');

    const orden = categoria === 'reservadas' ? 'COALESCE(reservas.cantidad, 0)' : 'publicacion.fecha_publicacion';
    const direccion = categoria === 'reservadas' ? 'DESC' : 'DESC';
    const filas = await base
      .clone()
      .select('publicacion.id', 'id')
      .addSelect('COALESCE(reservas.cantidad, 0)', 'cantidadReservas')
      .leftJoin(`(${reservas.getQuery()})`, 'reservas', 'reservas.idPublicacion = publicacion.id_publicacion')
      .setParameters(reservas.getParameters())
      .orderBy(orden, direccion)
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
