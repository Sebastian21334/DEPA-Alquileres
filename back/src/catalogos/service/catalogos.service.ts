import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ConflictException,
  type OnModuleInit,
} from '@nestjs/common';
import { CATALOGOS_REPOSITORY } from '../repository/catalogos.repository.interface';
import type { ICatalogosRepository, ItemCatalogo } from '../repository/catalogos.repository.interface';
import type { ClaveCatalogo } from '../codigos-catalogo';
import type { GuardarCatalogoDto } from '../dto/guardar-catalogo.dto';
import type { TipoAnunciante } from '../entity/tipo-anunciante.entity';
import { PATRON_RESERVA_POR_FECHA, type Modalidad } from '../entity/modalidad.entity';
import type { ModalidadRespuestaDto } from '../dto/modalidad-respuesta.dto';
import type { Estado } from '../entity/estado.entity';
import catalogosIniciales from '../catalogos-iniciales.json';
import estadosIniciales from '../estados-iniciales.json';
import { QueryFailedError, type EntityManager } from 'typeorm';
import { monedaPublicacion } from '../../common/utils/importes';

type CodigoAmbito = keyof typeof estadosIniciales;
type CodigoEstado<A extends CodigoAmbito> = Extract<keyof typeof estadosIniciales[A]['estados'], string>;

@Injectable()
export class CatalogosService implements OnModuleInit {
  private estados = new Map<string, Estado>();
  constructor(@Inject(CATALOGOS_REPOSITORY) private readonly catalogosRepo: ICatalogosRepository) {}

  async guardarCatalogo(clave: ClaveCatalogo, datos: GuardarCatalogoDto, id?: number): Promise<ItemCatalogo> {
    return this.catalogosRepo.conCatalogoBloqueado(clave, async (transaccion) => {
      const actual = id === undefined ? null : await this.catalogosRepo.buscarItem(clave, id, transaccion);
      if (id !== undefined && !actual) throw new NotFoundException('El elemento del catálogo no existe');
      const nombre = datos.nombre.trim().replace(/\s+/g, ' ');
      const duplicado = await this.catalogosRepo.buscarNombre(clave, nombre, transaccion);
      if (duplicado && duplicado.id !== id) throw new ConflictException('Ya existe un elemento con ese nombre en este catálogo');
      if (clave === 'tipos-moneda') {
        let codigo: 'ARS' | 'USD';
        try {
          codigo = monedaPublicacion(nombre);
        } catch {
          throw new BadRequestException('La moneda debe ser peso (ARS) o dólar (USD), las monedas admitidas por la plataforma');
        }
        if (actual && monedaPublicacion(actual.nombre) !== codigo) {
          throw new ConflictException('No podés cambiar una moneda por otra. Agregá un nuevo elemento para conservar los precios existentes.');
        }
      }
      if (clave === 'tipos-anunciante' && actual && this.esInmobiliaria(actual as TipoAnunciante) !== this.esInmobiliaria({ nombre } as TipoAnunciante)) {
        throw new ConflictException('El nombre debe conservar la categoría de particular o inmobiliaria para mantener los requisitos de verificación.');
      }
      if (clave !== 'modalidades' && datos.permite_reservas_por_fecha !== undefined) {
        throw new BadRequestException('La opción de reservas solo corresponde a modalidades');
      }
      if (clave === 'modalidades' && !actual && datos.permite_reservas_por_fecha === undefined) {
        throw new BadRequestException('Indicá si la modalidad permite reservas por fecha');
      }
      const item: Partial<ItemCatalogo> = { ...actual, nombre };
      if (datos.descripcion !== undefined) item.descripcion = datos.descripcion;
      if (clave === 'modalidades') {
        // Al renombrar una modalidad anterior, preserva su comportamiento efectivo.
        item.permite_reservas_por_fecha = datos.permite_reservas_por_fecha ?? this.admiteReservaPorFecha(actual as Modalidad | null);
      }
      const guardado = await this.catalogosRepo.guardarItem(clave, item, transaccion);
      return clave === 'modalidades' ? this.prepararModalidad(guardado as Modalidad) : guardado;
    });
  }

  async eliminarCatalogo(clave: ClaveCatalogo, id: number): Promise<void> {
    try {
      await this.catalogosRepo.conCatalogoBloqueado(clave, async (transaccion) => {
        if (!await this.catalogosRepo.buscarItem(clave, id, transaccion)) throw new NotFoundException('El elemento del catálogo no existe');
        await this.catalogosRepo.eliminarItem(clave, id, transaccion);
      });
    } catch (error: unknown) {
      if (error instanceof QueryFailedError && (error.driverError as { code?: string }).code === '23503') {
        throw new ConflictException('No se puede eliminar: el elemento está en uso. Podés editarlo.');
      }
      throw error;
    }
  }

  obtenerComision(transaccion?: EntityManager): Promise<number> {
    return this.catalogosRepo.obtenerComision(transaccion);
  }

  actualizarComision(porcentaje: number): Promise<number> {
    return this.catalogosRepo.actualizarComision(porcentaje);
  }

  async onModuleInit(): Promise<void> {
    const [roles, estados] = await Promise.all([
      this.catalogosRepo.buscarTodosRoles(),
      this.catalogosRepo.listarEstados(),
    ]);
    const rolesCargados = new Set(roles.map(({ nombre }) => nombre));
    const estadosCargados = new Map(estados.map((estado) => [`${estado.codigoAmbito}/${estado.codigo}`, estado]));
    const faltantes = [
      ...catalogosIniciales.rol
        .filter(({ nombre }) => !rolesCargados.has(nombre))
        .map(({ nombre }) => `rol ${nombre}`),
      ...Object.entries(estadosIniciales).flatMap(([codigoAmbito, { estados }]) =>
        Object.keys(estados)
          .map((codigo) => `${codigoAmbito}/${codigo}`)
          .filter((clave) => !estadosCargados.has(clave)),
      ),
    ];
    if (faltantes.length) {
      throw new InternalServerErrorException(
        `Faltan datos base (${faltantes.join(', ')}). Ejecutá npm run db:seed desde back.`,
      );
    }
    this.estados = estadosCargados;
  }

  esInmobiliaria(tipo?: TipoAnunciante | null): boolean {
    return /inmobiliaria|institucional/i.test(tipo?.nombre ?? '');
  }

  admiteReservaPorFecha(modalidad?: Modalidad | null): boolean {
    if (modalidad?.permite_reservas_por_fecha != null) {
      return modalidad.permite_reservas_por_fecha;
    }
    return new RegExp(PATRON_RESERVA_POR_FECHA, 'i').test(modalidad?.nombre ?? '');
  }

  prepararModalidad(modalidad: Modalidad): ModalidadRespuestaDto {
    return Object.assign(modalidad, {
      admite_reservas_por_fecha: this.admiteReservaPorFecha(modalidad),
    });
  }

  obtenerEstado<A extends CodigoAmbito>(codigoAmbito: A, codigo: CodigoEstado<A>): Estado {
    const estado = this.estados.get(`${codigoAmbito}/${codigo}`);
    if (!estado) {
      throw new InternalServerErrorException(`Falta el estado ${codigo} del ámbito ${codigoAmbito}`);
    }
    return estado;
  }

  codigoEstado<A extends CodigoAmbito, C extends CodigoEstado<A>>(ambito: A, codigo: C): C {
    return this.obtenerEstado(ambito, codigo).codigo as C;
  }

  // --- ROLES ---
  /** Lista los roles disponibles para administracion y registro de usuarios. */
  getRoles() {
    return this.catalogosRepo.buscarTodosRoles();
  }

  /** Busca un rol por nombre; se usa al asignar roles automaticamente. */
  getRolPorNombre(nombre: string) {
    return this.catalogosRepo.buscarRolPorNombre(nombre);
  }

  // --- TIPOS ANUNCIANTE ---
  /** Lista las categorias de anunciante. */
  getTiposAnunciante() {
    return this.catalogosRepo.buscarTodosTiposAnunciante();
  }

  /** Busca una categoria de anunciante o informa que la relacion no existe. */
  async getTipoAnunciantePorId(id: number) {
    const item = await this.catalogosRepo.buscarTipoAnunciantePorId(id);
    if (!item)
      throw new NotFoundException(
        `El tipo de anunciante con ID ${id} no existe`,
      );
    return item;
  }

  // --- TIPOS PROPIEDAD ---
  /** Lista los tipos de propiedad usados en las publicaciones. */
  getTiposPropiedad() {
    return this.catalogosRepo.buscarTodosTiposPropiedad();
  }

  /** Resuelve el tipo de propiedad requerido al crear una publicacion. */
  async getTipoPropiedadPorId(id: number) {
    const item = await this.catalogosRepo.buscarTipoPropiedadPorId(id);
    if (!item)
      throw new NotFoundException(
        `El tipo de propiedad con ID ${id} no existe`,
      );
    return item;
  }

  // --- MODALIDADES ---
  /** Lista las modalidades de alquiler disponibles. */
  async getModalidades() {
    const modalidades = await this.catalogosRepo.buscarTodasModalidades();
    return modalidades.map((modalidad) => this.prepararModalidad(modalidad));
  }

  /** Resuelve una modalidad para asociarla a una publicacion. */
  async getModalidadPorId(id: number) {
    const item = await this.catalogosRepo.buscarModalidadPorId(id);
    if (!item)
      throw new NotFoundException(`La modalidad con ID ${id} no existe`);
    return this.prepararModalidad(item);
  }

  // --- TIPOS MONEDA ---
  /** Lista las monedas disponibles para publicar precios. */
  getTiposMoneda() {
    return this.catalogosRepo.buscarTodosTiposMoneda();
  }

  /** Resuelve la moneda asociada al precio de una publicacion. */
  async getTipoMonedaPorId(id: number) {
    const item = await this.catalogosRepo.buscarTipoMonedaPorId(id);
    if (!item)
      throw new NotFoundException(`El tipo de moneda con ID ${id} no existe`);
    return item;
  }
}
