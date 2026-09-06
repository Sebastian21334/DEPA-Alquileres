import { Inject, Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Reserva } from '../entity/reserva.entity';
import { CrearReservaDto } from '../dto/crear-reserva.dto';
import { DisponibilidadService } from '../../disponibilidad/service/disponibilidad.service';
import type { IReservaRepository } from '../repository/reserva.repository.interface';
import { RESERVA_REPOSITORY } from '../repository/reserva.repository.interface';

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
  ) {}

  /**
   * Crea una reserva. Nota clave: Reserva NO guarda fecha_inicio/fecha_fin
   * propias -> el rango reservado se deduce de las filas de Fecha que
   * terminan apuntando a esta reserva. Por eso el flujo es:
   *   1) validar el rango recibido en el DTO
   *   2) preguntarle a Disponibilidad si ese rango está libre
   *   3) recién ahí crear la Reserva
   *   4) y por último, marcar esas Fechas como ocupadas
   */
  async crear(dto: CrearReservaDto, idUsuario: number): Promise<Reserva> {
    // El DTO trae el rango, pero la entidad Reserva solo guarda la publicacion;
    // las fechas concretas quedan representadas por las filas de disponibilidad.
    const inicio = new Date(dto.fecha_inicio);
    const fin = new Date(dto.fecha_fin);

    if (inicio > fin) {
      throw new BadRequestException('La fecha de inicio no puede ser posterior a la de fin');
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

    const reserva = this.reservaRepository.crear({
      finalizada: false,
      monto_pago: dto.monto_pago,
      fecha_pago: new Date(), // fecha en que se efectúa el pago, no del alojamiento
      usuario: { id: idUsuario } as any,
      publicacion: { id: dto.id_publicacion } as any,
      metodoPago: { id: dto.id_metodo_pago } as any,
    });

    // Persistimos la reserva primero para obtener su ID antes de asociarlo a las fechas.
    const reservaGuardada = await this.reservaRepository.guardar(reserva);

    // Asi no quedan fechas enlazadas a una reserva que nunca llego a crearse.
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