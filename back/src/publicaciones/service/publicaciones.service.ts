import { ReservasLecturaService } from '../../reservas/service/reservas-lectura.service';
import { ListarPublicacionesAdministracionDto } from '../dto/listar-publicaciones-administracion.dto';
import { ListarMisPublicacionesDto } from '../dto/listar-mis-publicaciones.dto';
import type { ListarPublicacionesMapaDto } from '../dto/listar-publicaciones-mapa.dto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PUBLICACIONES_REPOSITORY } from '../repository/publicaciones.repository.interface';
import type {
  CategoriaInicio,
  AreaMapaPublicaciones,
  ConsultaPublicaciones,
  ConversionUsd,
  FiltrosPublicaciones,
  IPublicacionesRepository,
  OrdenPublicaciones,
} from '../repository/publicaciones.repository.interface';
import { CotizacionesLecturaService } from '../../cotizaciones/service/cotizaciones-lectura.service';
import { CrearPublicacionDto } from '../dto/crear-publicacion.dto';
import { ActualizarPublicacionDto } from '../dto/actualizar-publicacion.dto';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import { AnunciantesService } from '../../anunciantes/service/anunciantes.service';
import { UbicacionService } from '../../ubicacion/service/ubicacion.service';
import { Publicacion } from '../entity/publicacion.entity';
import { MAIL_SERVICE } from '../../mail/mail.interface';
import type { IMailPublicaciones } from '../../mail/mail.interface';
import type { EntityManager } from 'typeorm';
import { decimalEntero, importeTexto, monedaPublicacion } from '../../common/utils/importes';
import { fechaArgentina } from '../../common/utils/fechas';

type EtapaReserva = 'cotizacion' | 'reserva';

@Injectable()
export class PublicacionesService {
  private readonly logger = new Logger(PublicacionesService.name);
  constructor(@Inject(PUBLICACIONES_REPOSITORY) private readonly publicacionesRepo: IPublicacionesRepository, private readonly catalogosService: CatalogosService, private readonly ubicacionService: UbicacionService, @Inject(MAIL_SERVICE) private readonly mailService: IMailPublicaciones, private readonly anunciantesService: AnunciantesService, private readonly reservasLectura: ReservasLecturaService, private readonly cotizacionesLectura: CotizacionesLecturaService) {}

  /** Crea una publicacion y resuelve todas sus relaciones antes de guardarla. */
  async crear(anunciante: Anunciante, dto: CrearPublicacionDto) {
    if (!await this.anunciantesService.buscarCbuValidado(anunciante.idUsuario)) {
      throw new ForbiddenException('Necesitás un CBU validado para crear publicaciones. Cargalo desde Mi perfil.');
    }
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

    return this.prepararRespuesta(await this.publicacionesRepo.guardar(nueva));
  }

  /** Busca una publicacion o devuelve 404 para los consumidores de la API. */
  async buscarPorId(id: number) {
    const publicacion = await this.publicacionesRepo.buscarPorId(id);
    if (!publicacion) throw new NotFoundException('Publicación no encontrada');
    return this.prepararRespuesta(publicacion);
  }

  /** El acceso interno conserva el historial; el enlace público respeta el bloqueo. */
  async buscarPublicaPorId(id: number, idUsuario?: number) {
    const publicacion = await this.buscarPorId(id);
    if (publicacion.eliminada) {
      if (!idUsuario || !await this.tieneReservaVigente(id, idUsuario))
        throw new NotFoundException('Publicación no disponible');
      return publicacion;
    }
    if (!this.cuentaAnuncianteHabilitada(publicacion))
      throw new NotFoundException('Publicación no disponible');
    return publicacion;
  }

  async consultarDetallePublico(id: number, idUsuario?: number) {
    return this.prepararRespuestaPublica(await this.buscarPublicaPorId(id, idUsuario));
  }

  private tieneReservaVigente(idPublicacion: number, idUsuario: number): Promise<boolean> {
    const ahora = new Date();
    return this.reservasLectura.existeReserva({
      idPublicacion, idUsuario, fechaFinDesde: fechaArgentina(ahora),
      cancelada: false, finalizada: false,
      pagos: [
        { estado: this.catalogosService.codigoEstado('PAGO_RESERVA', 'APROBADO') },
        { estado: this.catalogosService.codigoEstado('PAGO_RESERVA', 'PENDIENTE'), venceDespues: ahora },
      ],
    });
  }

  esVisible(publicacion: Publicacion): boolean {
    return !publicacion.eliminada && publicacion.activa && this.cuentaAnuncianteHabilitada(publicacion) &&
      !publicacion.motivo_baja_admin && (publicacion.imagenes?.length ?? 0) > 0;
  }

  validarAnuncianteDisponible(publicacion?: Publicacion | null): void {
    if (publicacion?.anunciante?.actividades_pausadas) {
      throw new ConflictException('El anunciante pausó sus actividades. Por el momento, no acepta nuevas reservas.');
    }
  }

  validarNuevaReserva(publicacion: Publicacion, idInquilino: number, etapa: EtapaReserva): void {
    this.validarAnuncianteDisponible(publicacion);
    if (publicacion.eliminada || !publicacion.activa || !this.cuentaAnuncianteHabilitada(publicacion)) {
      throw new BadRequestException(etapa === 'cotizacion'
        ? 'Esta publicación no admite reservas'
        : 'No se puede reservar: la publicación no está disponible');
    }
    const admiteReserva = this.admiteReservaPorFecha(publicacion);
    if (etapa === 'cotizacion' && !admiteReserva) {
      throw new BadRequestException('Esta publicación no admite reservas');
    }
    if (this.perteneceA(publicacion, idInquilino)) {
      throw new BadRequestException('No podés reservar tu propia publicación');
    }
    if (!admiteReserva) {
      throw new BadRequestException('Solo las publicaciones temporales o de alquiler diario admiten reservas por fecha');
    }
  }

  monedaParaReserva(publicacion?: Publicacion | null): 'ARS' | 'USD' {
    return monedaPublicacion(publicacion?.tipoMoneda?.nombre);
  }

  calcularTarifaReserva(publicacion: Publicacion, dias: number, etapa: EtapaReserva) {
    try {
      const moneda = this.monedaParaReserva(publicacion);
      const unitario = decimalEntero(publicacion.precio, 2);
      if (unitario <= 0n) {
        throw new Error(etapa === 'cotizacion' ? 'La tarifa debe ser mayor a cero' : 'El precio debe ser mayor a cero');
      }
      const centavos = unitario * BigInt(dias);
      return { moneda, unitario, centavos, total: importeTexto(centavos) };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Precio inválido');
    }
  }

  perteneceA(publicacion: Publicacion | null | undefined, idUsuario: number): boolean {
    return publicacion?.anunciante?.idUsuario === idUsuario;
  }

  direccionCompleta(publicacion?: Publicacion | null): string {
    return [publicacion?.direccion, publicacion?.ciudad?.nombre, publicacion?.provincia?.nombre]
      .filter(Boolean)
      .join(', ');
  }

  admiteReservaPorFecha(publicacion: Publicacion): boolean {
    return this.catalogosService.admiteReservaPorFecha(publicacion.modalidad);
  }

  cuentaAnuncianteHabilitada(publicacion: Publicacion): boolean {
    const usuario = publicacion.anunciante?.usuario;
    return usuario?.activa === true && usuario.bloqueado === false;
  }

  /** ResenasResumenService es el único escritor de estas cachés derivadas. */
  actualizarResumenResenas(id: number, cantidad: number, promedio: number | null): Promise<void> {
    return this.publicacionesRepo.actualizarResumenResenas(id, cantidad, promedio);
  }

  prepararRespuesta<T extends Publicacion>(publicacion: T): T {
    if (publicacion.modalidad) {
      publicacion.modalidad = this.catalogosService.prepararModalidad(publicacion.modalidad);
    }
    return publicacion;
  }

  prepararRespuestaPublica<T extends Publicacion>(publicacion: T) {
    const { anunciante, ...datos } = this.prepararRespuesta(publicacion);
    const usuario = anunciante?.usuario;
    return {
      ...datos,
      anunciante: anunciante ? {
        idUsuario: anunciante.idUsuario,
        verificado: anunciante.verificado,
        actividades_pausadas: anunciante.actividades_pausadas,
        tipoAnunciante: anunciante.tipoAnunciante,
        numero_contacto: anunciante.numero_contacto,
        cantidad_resenas: anunciante.cantidad_resenas,
        promedio_resenas: anunciante.promedio_resenas,
        usuario: usuario ? {
          id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, foto_url: usuario.foto_url,
        } : null,
      } : anunciante,
    };
  }

  bloquearPublicacionesParaCambioDeCuenta(idUsuario: number, transaccion: EntityManager): Promise<boolean> {
    return this.publicacionesRepo.bloquearPorAnunciante(idUsuario, transaccion);
  }

  async bloquearParaModificacion(id: number, transaccion: EntityManager, permitirEliminada = true): Promise<void> {
    const actual = await this.publicacionesRepo.bloquearPorId(id, transaccion);
    if (!actual || (!permitirEliminada && actual.eliminada)) {
      throw new NotFoundException('Publicación no encontrada');
    }
  }

  buscarCondicionesDeReserva(id: number, transaccion: EntityManager): Promise<Publicacion | null> {
    return this.publicacionesRepo.buscarCondicionesDeReserva(id, transaccion);
  }

  desactivarPorBajaDeCuenta(idUsuario: number, transaccion: EntityManager): Promise<void> {
    return this.publicacionesRepo.desactivarPorAnunciante(idUsuario, transaccion);
  }

  /**
   * Único punto que autoriza operar sobre una publicación ajena: 404 si no
   * existe y 403 si pertenece a otro anunciante. Cada caso de uso informa su mensaje.
   */
  async obtenerPropia(id: number, idUsuario: number, mensaje = 'No tenés permiso para administrar esta publicación'): Promise<Publicacion> {
    const publicacion = await this.buscarPorId(id);
    if (!this.perteneceA(publicacion, idUsuario))
      throw new ForbiddenException(mensaje);
    if (publicacion.eliminada)
      throw new NotFoundException('La publicación ha sido eliminada');
    return publicacion;
  }

  /** Registra una apertura real del detalle; el cliente evita repetirla durante la misma sesión. */
  async registrarVisualizacion(id: number) {
    const publicacion = await this.publicacionesRepo.buscarPorId(id);
    if (!publicacion || !this.esVisible(publicacion))
      throw new NotFoundException('Publicación no encontrada');
    await this.publicacionesRepo.incrementarVisualizaciones(id);
    return { visualizaciones: Number(publicacion.visualizaciones ?? 0) + 1 };
  }

  /** Activa con la primera foto y se lo avisa al anunciante; recibe la galería leída antes de la subida. */
  async activar(publicacion: Publicacion) {
    if (publicacion.eliminada || publicacion.activa || publicacion.motivo_baja_admin || publicacion.imagenes?.length)
      return;
    // Se actualiza solo la columna: guardar la entidad completa haría que TypeORM
    // sincronice publicacion.imagenes (leída antes de subir la foto, vacía) y
    // desvincule la imagen recién creada (id_publicacion = NULL).
    const activada = await this.publicacionesRepo.marcarActiva(publicacion.id);
    publicacion.activa = true;
    // Dos primeras fotos simultáneas activan una sola vez: el aviso no se duplica.
    if (activada) await this.avisarAlAnunciante(publicacion, 'la publicación', email => this.mailService.enviarPublicacionActiva(email, publicacion.titulo, publicacion.id));
  }

  /** Lista pública paginada; el límite se acota para proteger la base de datos. */
  async listarActivas(pagina = 1, limite = 12, categoria?: CategoriaInicio, filtros: Omit<Partial<ConsultaPublicaciones>, 'pagina' | 'limite' | 'categoria'> = {}) {
    const ordenesValidos: OrdenPublicaciones[] = [
      'recientes',
      'antiguas',
      'precio-menor',
      'precio-mayor',
      'titulo',
      'resenas',
    ];
    const orden = filtros.orden && ordenesValidos.includes(filtros.orden) && (filtros.orden !== 'resenas' || categoria === 'temporales') ? filtros.orden : undefined;
    const consulta: ConsultaPublicaciones = {
      pagina: Number.isFinite(pagina) ? Math.max(1, Math.trunc(pagina)) : 1,
      limite: Number.isFinite(limite)
        ? Math.min(Math.max(1, Math.trunc(limite)), 50)
        : 12,
      categoria,
      ...this.normalizarFiltrosPublicos(filtros),
      orden,
      conversionUsd: orden === 'precio-menor' || orden === 'precio-mayor' ? await this.conversionUsd() : undefined,
    };
    const resultado = await this.publicacionesRepo.buscarPaginadas(consulta);
    return { ...resultado, datos: resultado.datos.map((publicacion) => this.prepararRespuestaPublica(publicacion)) };
  }

  async listarMapa(consulta: ListarPublicacionesMapaDto) {
    const { sur, norte, oeste, este, q, antesDe, ...filtros } = consulta;
    let area: AreaMapaPublicaciones | undefined;
    if ([sur, norte, oeste, este].some((valor) => valor != null)) {
      if (sur == null || norte == null || oeste == null || este == null || sur >= norte || oeste >= este) {
        throw new BadRequestException('El área debe tener cuatro límites en orden válido.');
      }
      area = { sur, norte, oeste, este };
    }
    const limite = 500;
    const puntos = await this.publicacionesRepo.buscarPuntos(
      this.normalizarFiltrosPublicos({ ...filtros, busqueda: q }), area, limite + 1, antesDe,
    );
    const recortado = puntos.length > limite;
    return {
      puntos: puntos.slice(0, limite),
      recortado,
      siguienteId: recortado ? puntos[limite - 1].id : null,
    };
  }

  /** Al ordenar por precio, los importes en USD se comparan en pesos con el dólar blue registrado. */
  private async conversionUsd(): Promise<ConversionUsd | undefined> {
    const [venta, monedas] = await Promise.all([this.cotizacionesLectura.ventaRegistrada(), this.catalogosService.getTiposMoneda()]);
    const idsMoneda = monedas.filter(({ nombre }) => this.esDolar(nombre)).map(({ id }) => id);
    return venta && idsMoneda.length ? { idsMoneda, venta } : undefined;
  }

  private esDolar(nombre: string): boolean {
    try {
      return monedaPublicacion(nombre) === 'USD';
    } catch {
      return false;
    }
  }

  private normalizarFiltrosPublicos(filtros: FiltrosPublicaciones): FiltrosPublicaciones {
    if (filtros.precioMin != null && filtros.precioMax != null && filtros.precioMin > filtros.precioMax) {
      throw new BadRequestException('El precio mínimo no puede superar al máximo');
    }
    return { ...filtros, busqueda: filtros.busqueda?.trim().slice(0, 200) || undefined };
  }

  /** Lista publicaciones de un anunciante, opcionalmente solo las activas. */
  async listarPorAnunciante(idAnunciante: number, soloActivas = false) {
    const publicaciones = await this.publicacionesRepo.buscarPorAnunciante(
      idAnunciante,
      soloActivas,
    );
    // El dueño ve todas (para poder completarlas); la vista pública solo las que cumplen la regla.
    return publicaciones.filter((p) => !p.eliminada && this.cuentaAnuncianteHabilitada(p) &&
      (!soloActivas || (!p.anunciante?.actividades_pausadas && this.esVisible(p))))
      .map((publicacion) => this.prepararRespuestaPublica(publicacion));
  }

  /** La papelera solo se entrega al dueño autenticado, nunca al listado público. */
  async listarPropias(anunciante: Anunciante) {
    const publicaciones = await this.publicacionesRepo.buscarPorAnunciante(anunciante.idUsuario, false, true);
    return publicaciones.map((publicacion) => this.prepararRespuesta(publicacion));
  }

  /** Listado paginado de las publicaciones no eliminadas del dueño. */
  async listarMiasPaginadas(anunciante: Anunciante, consulta: ListarMisPublicacionesDto) {
    const pagina = await this.publicacionesRepo.buscarMiasPaginadas(anunciante.idUsuario, consulta);
    return { ...pagina, datos: pagina.datos.map((publicacion) => this.prepararRespuesta(publicacion)) };
  }

  /** Papelera simple del dueño: sin paginación ni búsqueda. */
  async listarPapelera(anunciante: Anunciante) {
    const publicaciones = await this.publicacionesRepo.buscarPapeleraPorAnunciante(anunciante.idUsuario);
    return publicaciones.map((publicacion) => this.prepararRespuesta(publicacion));
  }

  /** Modifica una publicación conservando la fecha original y validando propiedad. */
  async actualizar(id: number, anuncianteQueOpera: Anunciante, dto: ActualizarPublicacionDto) {
    const publicacion = await this.obtenerPropia(
      id,
      anuncianteQueOpera.idUsuario,
      'No podés modificar una publicación que no es tuya',
    );
    if (dto.activa === true && publicacion.motivo_baja_admin) {
      throw new ForbiddenException('La publicación fue desactivada por un administrador y no puede reactivarse');
    }
    if (dto.activa === true && !publicacion.imagenes?.length) {
      throw new BadRequestException('La publicación necesita al menos una imagen para activarse');
    }

    // Los catálogos y la ubicación se validan contra la base antes de asignarlos.
    const cambios = {
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
    };
    const informados = Object.entries(cambios).filter(([, valor]) => valor !== undefined);
    const datos = Object.fromEntries(informados);
    // Un UPDATE parcial no puede restaurar eliminada=false desde una lectura anterior.
    if (informados.length && !await this.publicacionesRepo.actualizarSiNoEliminada(id, datos)) {
      // Volver a leer permite distinguir una baja administrativa concurrente.
      const actual = await this.obtenerPropia(id, anuncianteQueOpera.idUsuario);
      if (dto.activa === true && actual.motivo_baja_admin) {
        throw new ForbiddenException('La publicación fue desactivada por un administrador y no puede reactivarse');
      }
      throw new ConflictException('La publicación cambió. Recargá e intentá nuevamente');
    }
    return this.prepararRespuesta(Object.assign(publicacion, datos));
  }

  /** Incluye publicaciones activas e inactivas de todos los anunciantes. */
  async listarAdministracion(consulta: ListarPublicacionesAdministracionDto) {
    const pagina = await this.publicacionesRepo.buscarAdministracion(consulta);
    return { ...pagina, datos: pagina.datos.map((publicacion) => this.prepararRespuesta(publicacion)) };
  }

  /** El controller restringe esta operación al rol Administrador. */
  async darDeBajaAdministracion(id: number, motivo: string) {
    const razon = motivo?.trim();
    if (!razon || razon.length > 500) {
      throw new BadRequestException('Ingresá un motivo de entre 1 y 500 caracteres');
    }
    const publicacion = await this.buscarPorId(id);
    await this.publicacionesRepo.darDeBaja(id, razon);
    publicacion.activa = false;
    publicacion.motivo_baja_admin = razon;
    const correoEnviado = await this.avisarAlAnunciante(publicacion, 'la baja', email => this.mailService.enviarBajaPublicacion(email, publicacion.titulo, razon));
    return { publicacion, correoEnviado };
  }

  /** Levanta una baja administrativa; el controller restringe esta operación al rol Administrador. */
  async reactivarAdministracion(id: number) {
    const publicacion = await this.buscarPorId(id);
    if (publicacion.eliminada) throw new ConflictException('La publicación fue eliminada por su anunciante y no se puede reactivar');
    if (!publicacion.motivo_baja_admin) throw new ConflictException('La publicación no está dada de baja');
    // La reactivación levanta la sanción, no republica: el anunciante decide cuándo activarla.
    if (!await this.publicacionesRepo.reactivar(id)) throw new ConflictException('La publicación cambió. Recargá e intentá nuevamente');
    publicacion.motivo_baja_admin = null;
    publicacion.activa = false;
    await this.avisarAlAnunciante(publicacion, 'la reactivación', email => this.mailService.enviarReactivacionPublicacion(email, publicacion.titulo));
    return this.prepararRespuesta(publicacion);
  }

  /** La operación ya quedó confirmada: un fallo del correo se registra y no la revierte. */
  private async avisarAlAnunciante(publicacion: Publicacion, aviso: string, enviar: (email: string) => Promise<void>): Promise<boolean> {
    try {
      const { email } = this.anunciantesService.datosContacto(publicacion.anunciante);
      if (!email) throw new Error('El anunciante no tiene un correo registrado');
      await enviar(email);
      return true;
    } catch (error) {
      this.logger.error(`No se pudo notificar ${aviso} de la publicación ${publicacion.id}`, error as Error);
      return false;
    }
  }

  /** Elimina solo publicaciones pertenecientes al anunciante autenticado. */
  async eliminar(id: number, anuncianteQueOpera: Anunciante) {
    // El anunciante autenticado debe ser el dueño, aunque conozca el ID de otra publicación.
    const publicacion = await this.obtenerPropia(
      id,
      anuncianteQueOpera.idUsuario,
      'No podés eliminar una publicación que no es tuya',
    );
    publicacion.activa = false;
    publicacion.eliminada = true;
    return this.prepararRespuesta(await this.publicacionesRepo.eliminar(publicacion));
  }

  /** Recupera el anuncio sin publicarlo ni levantar una baja administrativa. */
  async restaurar(id: number, anuncianteQueOpera: Anunciante) {
    const publicacion = await this.buscarPorId(id);
    if (!this.perteneceA(publicacion, anuncianteQueOpera.idUsuario)) {
      throw new ForbiddenException('No podés restaurar una publicación que no es tuya');
    }
    if (!publicacion.eliminada || !await this.publicacionesRepo.restaurar(id)) {
      throw new ConflictException('La publicación ya no está en la papelera');
    }
    publicacion.eliminada = false;
    publicacion.activa = false;
    return this.prepararRespuesta(publicacion);
  }
}
