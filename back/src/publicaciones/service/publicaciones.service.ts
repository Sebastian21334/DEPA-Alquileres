import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PUBLICACIONES_REPOSITORY } from '../repository/publicaciones.repository.interface';
import type { IPublicacionesRepository } from '../repository/publicaciones.repository.interface';
import { CrearPublicacionDto } from '../dto/crear-publicacion.dto';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import { UbicacionService } from '../../ubicacion/service/ubicacion.service';
import { Publicacion } from '../entity/publicacion.entity';

@Injectable()
export class PublicacionesService {
  constructor(
    @Inject(PUBLICACIONES_REPOSITORY)
    private readonly publicacionesRepo: IPublicacionesRepository,
    private readonly catalogosService: CatalogosService,
    private readonly ubicacionService: UbicacionService,
  ) {}

  /** Crea una publicacion y resuelve todas sus relaciones antes de guardarla. */
  async crear(anunciante: Anunciante, dto: CrearPublicacionDto) {
    // Estos servicios validan que cada catalogo y ubicacion exista; asi la
    // publicacion no queda apuntando a claves foraneas inexistentes.
    const tipoMoneda = await this.catalogosService.getTipoMonedaPorId(dto.idTipoMoneda);
    const modalidad = await this.catalogosService.getModalidadPorId(dto.idModalidad);
    const tipoPropiedad = await this.catalogosService.getTipoPropiedadPorId(dto.idTipoPropiedad);
    const provincia = await this.ubicacionService.getProvinciaPorId(dto.idProvincia);
    const ciudad = await this.ubicacionService.getCiudadPorId(dto.idCiudad);

    // La entidad recibe objetos completos para mantener sus relaciones TypeORM consistentes.
    const nueva = this.publicacionesRepo.crear({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      precio: dto.precio,
      direccion: dto.direccion,
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

  /** Deja visible una publicación (se llama cuando ya tiene al menos una imagen). */
  async activar(publicacion: Publicacion) {
    if (publicacion.activa) return publicacion;
    publicacion.activa = true;
    return this.publicacionesRepo.guardar(publicacion);
  }

  /** Devuelve unicamente las publicaciones visibles para visitantes. */
  async listarActivas() {
    const activas = await this.publicacionesRepo.buscarTodasActivas();
    return activas.filter((p) => this.tieneImagenes(p));
  }

  /** Lista publicaciones de un anunciante, opcionalmente solo las activas. */
  async listarPorAnunciante(idAnunciante: number, soloActivas = false) {
    const publicaciones = await this.publicacionesRepo.buscarPorAnunciante(idAnunciante, soloActivas);
    // El dueño ve todas (para poder completarlas); la vista pública solo las que cumplen la regla.
    return soloActivas ? publicaciones.filter((p) => this.tieneImagenes(p)) : publicaciones;
  }

  /** Regla de negocio: una publicación sin imágenes nunca se muestra públicamente. */
  private tieneImagenes(publicacion: Publicacion): boolean {
    return (publicacion.imagenes?.length ?? 0) > 0;
  }

  /** Elimina solo publicaciones pertenecientes al anunciante autenticado. */
  async eliminar(id: number, anuncianteQueOpera: Anunciante) {
    const publicacion = await this.publicacionesRepo.buscarPorId(id);
    if (!publicacion) throw new NotFoundException('Publicación no encontrada');

    if (publicacion.anunciante.idUsuario !== anuncianteQueOpera.idUsuario) {
      // El anunciante autenticado debe ser el dueño, aunque conozca el ID de otra publicación.
      throw new ForbiddenException('No podés eliminar una publicación que no es tuya');
    }

    return this.publicacionesRepo.eliminar(publicacion);
  }
}