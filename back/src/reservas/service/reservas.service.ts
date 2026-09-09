import { Inject, Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Reserva } from '../entity/reserva.entity';
import { CrearReservaDto } from '../dto/crear-reserva.dto';
import { DisponibilidadService } from '../../disponibilidad/service/disponibilidad.service';
import type { IReservaRepository } from '../repository/reserva.repository.interface';
import { RESERVA_REPOSITORY } from '../repository/reserva.repository.interface';
import { UsuariosService } from '../../usuarios/service/usuarios.service';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';

@Injectable()
export class ReservasService {
  constructor(
    // Repositorio por interfaz, igual criterio que en Disponibilidad
    @Inject(RESERVA_REPOSITORY)
    private readonly reservaRepository: IReservaRepository,
    // Este SÍ se inyecta directo por clase: DisponibilidadService no tiene
    // interfaz propia, es un service normal que exporta lógica de negocio
    // (no una capa de acceso a datos), así que no necesita el mismo patrón.
    private readonly disponibilidadService: DisponibilidadService,
    private readonly usuariosService: UsuariosService,
    private readonly publicacionesService: PublicacionesService,
  ) {}

  /**
  * Crea una reserva y conserva una copia del periodo y de los datos del
  * inquilino para mantener el historial aunque la cuenta sea eliminada.
  * El flujo es:
   *   1) validar el rango recibido en el DTO
   *   2) preguntarle a Disponibilidad si ese rango está libre
   *   3) recién ahí crear la Reserva
   *   4) y por último, marcar esas Fechas como ocupadas
   */
  async crear(dto: CrearReservaDto, idUsuario: number): Promise<Reserva> {
    // El DTO trae el rango; Reserva conserva el periodo y Fecha mantiene
    // cada dia para bloquearlo en el calendario.
    const inicio = new Date(dto.fecha_inicio);
    const fin = new Date(dto.fecha_fin);

    if (inicio > fin) {
      throw new BadRequestException('La fecha de inicio no puede ser posterior a la de fin');
    }

    const publicacion = await this.publicacionesService.buscarPorId(dto.id_publicacion);
    const cantidadDias = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const precioDiario = Number(publicacion.precio);
    const montoCalculado = Number((precioDiario * cantidadDias).toFixed(2));

    if (!Number.isFinite(montoCalculado) || montoCalculado < 0) {
      throw new BadRequestException('No se pudo calcular el monto de la reserva');
    }

    // Delegamos la pregunta "¿está libre este rango?" al módulo que es
    // dueño de esa lógica (Disponibilidad), en vez de duplicarla acá
    const disponible = await this.disponibilidadService.verificarDisponibilidad(
      dto.id_publicacion,
      inicio,
      fin,
    );

    if (!disponible) {
      throw new ConflictException('El rango de fechas seleccionado no está disponible');
    }

    const usuario = await this.usuariosService.buscarPorId(idUsuario);
    if (!usuario) {
      throw new NotFoundException('No se encontró el usuario que realiza la reserva');
    }

    // Las relaciones se crean con solo el ID: TypeORM puede resolver las FK sin cargar entidades completas.
    const reserva = this.reservaRepository.crear({
      finalizada: false,
      monto_pago: montoCalculado,
      fecha_pago: new Date(), // fecha en que se efectúa el pago, no del alojamiento
      fecha_inicio: inicio,
      fecha_fin: fin,
      usuario_nombre: usuario.nombre,
      usuario_apellido: usuario.apellido,
      usuario_email: usuario.email,
      usuario_telefono: usuario.telefono,
      usuario,
      publicacion,
      metodoPago: { id: dto.id_metodo_pago } as any,
    });

    // Persistimos la reserva primero para obtener su ID antes de asociarlo a las fechas.
    const reservaGuardada = await this.reservaRepository.guardar(reserva);

    // Primero se guarda la reserva para no enlazar fechas a una reserva sin ID.
    await this.disponibilidadService.marcarComoReservadas(
      dto.id_publicacion,
      inicio,
      fin,
      reservaGuardada.id,
    );

    return reservaGuardada;
  }

  /**
   * Historial de reservas del inquilino logueado.
   */
  async listarPorUsuario(idUsuario: number): Promise<Reserva[]> {
    return this.reservaRepository.buscarPorUsuario(idUsuario);
  }

  /**
   * Reservas recibidas sobre una publicación puntual, para que el
   * anunciante vea quién reservó su propiedad.
   */
  async listarPorPublicacion(idPublicacion: number): Promise<Reserva[]> {
    return this.reservaRepository.buscarPorPublicacion(idPublicacion);
  }

  /** Busca una reserva individual y normaliza la ausencia como 404. */
  async buscarPorId(id: number): Promise<Reserva> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva) throw new NotFoundException(`No se encontró la reserva ${id}`);
    return reserva;
  }

  /**
   * Marca la reserva como finalizada (ej: terminó la estadía).
   * No libera las fechas: quedan como historial de que ese período
   * ya fue efectivamente ocupado.
   */
  async finalizar(id: number): Promise<Reserva> {
    const reserva = await this.buscarPorId(id); // reutiliza la validación de existencia
    reserva.finalizada = true;
    return this.reservaRepository.guardar(reserva);
  }
}