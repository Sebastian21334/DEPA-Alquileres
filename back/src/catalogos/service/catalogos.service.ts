import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  type OnModuleInit,
} from '@nestjs/common';
import { CATALOGOS_REPOSITORY } from '../repository/catalogos.repository.interface';
import type { ICatalogosRepository } from '../repository/catalogos.repository.interface';
import type { TipoAnunciante } from '../entity/tipo-anunciante.entity';
import { PATRON_RESERVA_POR_FECHA, type Modalidad } from '../entity/modalidad.entity';
import type { ModalidadRespuestaDto } from '../dto/modalidad-respuesta.dto';
import type { Estado } from '../entity/estado.entity';
import catalogosIniciales from '../catalogos-iniciales.json';
import estadosIniciales from '../estados-iniciales.json';

type CodigoAmbito = keyof typeof estadosIniciales;
type CodigoEstado<A extends CodigoAmbito> = Extract<keyof typeof estadosIniciales[A]['estados'], string>;

@Injectable()
export class CatalogosService implements OnModuleInit {
  private estados = new Map<string, Estado>();
  constructor(@Inject(CATALOGOS_REPOSITORY) private readonly catalogosRepo: ICatalogosRepository) {}

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
