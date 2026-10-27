import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PUBLICACIONES_REPOSITORY } from '../repository/publicaciones.repository.interface';
import type {
  CategoriaInicio,
  ConsultaPublicaciones,
  IPublicacionesRepository,
  OrdenPublicaciones,
} from '../repository/publicaciones.repository.interface';
import { CrearPublicacionDto } from '../dto/crear-publicacion.dto';
import { ActualizarPublicacionDto } from '../dto/actualizar-publicacion.dto';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import { UbicacionService } from '../../ubicacion/service/ubicacion.service';
import { Publicacion } from '../entity/publicacion.entity';
import { MAIL_SERVICE } from '../../mail/mail.interface';
import type { IMailService } from '../../mail/mail.interface';

@Injectable()
export class PublicacionesService {
  private readonly logger = new Logger(PublicacionesService.name);
  constructor(
    @Inject(PUBLICACIONES_REPOSITORY)
    private readonly publicacionesRepo: IPublicacionesRepository,
    private readonly catalogosService: CatalogosService,
    private readonly ubicacionService: UbicacionService,
    @Inject(MAIL_SERVICE) private readonly mailService: IMailService,
  ) {}

  /** Crea una publicacion y resuelve todas sus relaciones antes de guardarla. */
  async crear(anunciante: Anunciante, dto: CrearPublicacionDto) {
    // Estos servicios validan que cada catalogo y ubicacion exista; asi la
    // publicacion no queda apuntando a claves foraneas inexistentes.
    const tipoMoneda = await this.catalogosService.getTipoMonedaPorId(
      dto.idTipoMoneda,
    );
    const modalidad = await this.catalogosService.getModalidadPorId(
      dto.idModalidad,
    );
    const tipoPropiedad = await this.catalogosService.getTipoPropiedadPorId(
      dto.idTipoPropiedad,
    );
    const provincia = await this.ubicacionService.getProvinciaPorId(
      dto.idProvincia,
    );
    const ciudad = await this.ubicacionService.getCiudadPorId(dto.idCiudad);

    // La entidad recibe objetos completos para mantener sus relaciones TypeORM consistentes.
    const nueva = this.publicacionesRepo.crear({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      precio: dto.precio,
      direccion: dto.direccion,
      latitud: dto.latitud,
      longitud: dto.longitud,
      cantidad_ambientes: dto.cantidad_ambientes,
      superficie: dto.superficie,
      fecha_publicacion: new Date(),
      // Regla de negocio: una publicación no puede estar publicada sin al menos una
      // imagen. Nace inactiva y ImagenesService la activa al guardar la primera foto.
      activa: false,
      anunciante,
      tipoMoneda,
      modalidad,
      tipoPropiedad,
      provincia,
      ciudad,
    });

    return this.publicacionesRepo.guardar(nueva);
  }

  /** Busca una publicacion o devuelve 404 para los consumidores de la API. */
  async buscarPorId(id: number) {
    const publicacion = await this.publicacionesRepo.buscarPorId(id);
    if (!publicacion) throw new NotFoundException('Publicación no encontrada');
    return publicacion;
  }

  /**
   * Único punto que autoriza operar sobre una publicación ajena: 404 si no
   * existe y 403 si pertenece a otro anunciante. Cada caso de uso informa su mensaje.
   */
  async obtenerPropia(
    id: number,
    idUsuario: number,
    mensaje = 'No tenés permiso para administrar esta publicación',
  ): Promise<Publicacion> {
    const publicacion = await this.buscarPorId(id);
    if (!publicacion.perteneceA(idUsuario))
      throw new ForbiddenException(mensaje);
    return publicacion;
  }

  /** Registra una apertura real del detalle; el cliente evita repetirla durante la misma sesión. */
  async registrarVisualizacion(id: number) {
    const publicacion = await this.publicacionesRepo.buscarPorId(id);
    if (!publicacion || !publicacion.activa)
      throw new NotFoundException('Publicación no encontrada');
    await this.publicacionesRepo.incrementarVisualizaciones(id);
    return { visualizaciones: Number(publicacion.visualizaciones ?? 0) + 1 };
  }

  /** Deja visible una publicación (se llama cuando ya tiene al menos una imagen). */
  async activar(publicacion: Publicacion) {
    if (publicacion.activa || publicacion.estaDadaDeBajaPorAdministrador())
      return;
    // Se actualiza solo la columna: guardar la entidad completa haría que TypeORM
    // sincronice publicacion.imagenes (leída antes de subir la foto, vacía) y
    // desvincule la imagen recién creada (id_publicacion = NULL).
    await this.publicacionesRepo.marcarActiva(publicacion.id);
    publicacion.activar();
  }

  /** Lista pública paginada; el límite se acota para proteger la base de datos. */
  async listarActivas(
    pagina = 1,
    limite = 12,
    categoria?: CategoriaInicio,
    filtros: Omit<
      Partial<ConsultaPublicaciones>,
      'pagina' | 'limite' | 'categoria'
    > = {},
  ) {
    if (
      filtros.precioMin != null &&
      filtros.precioMax != null &&
      filtros.precioMin > filtros.precioMax
    ) {
      throw new BadRequestException(
        'El precio mínimo no puede superar al máximo',
      );
    }
    const ordenesValidos: OrdenPublicaciones[] = [
      'recientes',
      'antiguas',
      'precio-menor',
      'precio-mayor',
      'titulo',
    ];
    const consulta: ConsultaPublicaciones = {
      pagina: Number.isFinite(pagina) ? Math.max(1, Math.trunc(pagina)) : 1,
      limite: Number.isFinite(limite)
        ? Math.min(Math.max(1, Math.trunc(limite)), 50)
        : 12,
      categoria,
      ...filtros,
      orden:
        filtros.orden && ordenesValidos.includes(filtros.orden)
          ? filtros.orden
          : undefined,
      busqueda: filtros.busqueda?.trim().slice(0, 200) || undefined,
    };
    return this.publicacionesRepo.buscarPaginadas(consulta);
  }

  /** Lista publicaciones de un anunciante, opcionalmente solo las activas. */
  async listarPorAnunciante(idAnunciante: number, soloActivas = false) {
    const publicaciones = await this.publicacionesRepo.buscarPorAnunciante(
      idAnunciante,
      soloActivas,
    );
    // El dueño ve todas (para poder completarlas); la vista pública solo las que cumplen la regla.
    return soloActivas
      ? publicaciones.filter((p) => this.tieneImagenes(p))
      : publicaciones;
  }

  /** Regla de negocio: una publicación sin imágenes nunca se muestra públicamente. */
  private tieneImagenes(publicacion: Publicacion): boolean {
    return (publicacion.imagenes?.length ?? 0) > 0;
  }

  /** Modifica una publicación conservando la fecha original y validando propiedad. */
  async actualizar(
    id: number,
    anuncianteQueOpera: Anunciante,
    dto: ActualizarPublicacionDto,
  ) {
    const publicacion = await this.obtenerPropia(
      id,
      anuncianteQueOpera.idUsuario,
      'No podés modificar una publicación que no es tuya',
    );
    if (dto.activa === true && publicacion.estaDadaDeBajaPorAdministrador()) {
      throw new ForbiddenException('La publicación fue desactivada por un administrador y no puede reactivarse');
    }

    // Los catálogos y la ubicación se validan contra la base antes de asignarlos.
    publicacion.modificar({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      precio: dto.precio,
      direccion: dto.direccion,
      latitud: dto.latitud,
      longitud: dto.longitud,
      cantidad_ambientes: dto.cantidad_ambientes,
      superficie: dto.superficie,
      activa: dto.activa,
      tipoMoneda:
        dto.idTipoMoneda === undefined
          ? undefined
          : await this.catalogosService.getTipoMonedaPorId(dto.idTipoMoneda),
      modalidad:
        dto.idModalidad === undefined
          ? undefined
          : await this.catalogosService.getModalidadPorId(dto.idModalidad),
      tipoPropiedad:
        dto.idTipoPropiedad === undefined
          ? undefined
          : await this.catalogosService.getTipoPropiedadPorId(
              dto.idTipoPropiedad,
            ),
      provincia:
        dto.idProvincia === undefined
          ? undefined
          : await this.ubicacionService.getProvinciaPorId(dto.idProvincia),
      ciudad:
        dto.idCiudad === undefined
          ? undefined
          : await this.ubicacionService.getCiudadPorId(dto.idCiudad),
    });

    return this.publicacionesRepo.guardar(publicacion);
  }

  /** Incluye publicaciones activas e inactivas de todos los anunciantes. */
  listarAdministracion() {
    return this.publicacionesRepo.buscarTodas();
  }

  /** El controller restringe esta operación al rol Administrador. */
  async darDeBajaAdministracion(id: number, motivo: string) {
    const razon = motivo?.trim();
    if (!razon || razon.length > 500) {
      throw new BadRequestException('Ingresá un motivo de entre 1 y 500 caracteres');
    }
    const publicacion = await this.buscarPorId(id);
    await this.publicacionesRepo.darDeBaja(id, razon);
    publicacion.darDeBaja(razon);
    let correoEnviado = false;
    try {
      const email = publicacion.emailDelAnunciante();
      if (!email) throw new Error('El anunciante no tiene un correo registrado');
      await this.mailService.enviarBajaPublicacion(
        email, publicacion.titulo, razon,
      );
      correoEnviado = true;
    } catch (error) {
      this.logger.error(`No se pudo notificar la baja de la publicación ${id}`, error as Error);
    }
    return { publicacion, correoEnviado };
  }

  /** Elimina solo publicaciones pertenecientes al anunciante autenticado. */
  async eliminar(id: number, anuncianteQueOpera: Anunciante) {
    // El anunciante autenticado debe ser el dueño, aunque conozca el ID de otra publicación.
    const publicacion = await this.obtenerPropia(
      id,
      anuncianteQueOpera.idUsuario,
      'No podés eliminar una publicación que no es tuya',
    );
    return this.publicacionesRepo.eliminar(publicacion);
  }
}
