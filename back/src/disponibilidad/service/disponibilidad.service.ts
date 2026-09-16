import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Fecha } from '../entity/fecha.entity';
import { CrearDisponibilidadDto } from '../dto/crear-disponibilidad.dto';
import { ActualizarDisponibilidadDto } from '../dto/actualizar-disponibilidad.dto';
import type { IFechaRepository } from '../repository/fecha.repository.interface';
import { FECHA_REPOSITORY } from '../repository/fecha.repository.interface';
import { FechaDisponibilidadPublicaDto } from '../dto/fecha-disponibilidad-publica.dto';
import { FechaDisponibilidadAdministracionDto } from '../dto/fecha-disponibilidad-administracion.dto';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { Modalidad } from '../../catalogos/entity/modalidad.entity';

@Injectable()
export class DisponibilidadService {
  constructor(
    // Se inyecta la INTERFAZ (vía token FECHA_REPOSITORY), no la clase concreta de TypeORM.
    // Esto es lo que permite, en teoría, cambiar de ORM o mockear el repositorio
    // en tests sin tocar el service.
    @Inject(FECHA_REPOSITORY)
    private readonly fechaRepository: IFechaRepository,
    private readonly publicacionesService: PublicacionesService,
  ) {}

  /**
   * Crea un rango de fechas disponibles para una publicación.
   * Se guarda un registro Fecha por cada día (no un "rango" como tal),
   * porque después Reservas necesita poder marcar días puntuales como
   * ocupados sin afectar el resto del rango.
   */
  async crear(dto: CrearDisponibilidadDto): Promise<FechaDisponibilidadAdministracionDto[]> {
    // Se trabaja con fechas completas para poder generar una fila por cada dia.
    const publicacion = await this.publicacionesService.buscarPorId(dto.id_publicacion);
    if (!this.admiteReservaPorFecha(publicacion.modalidad)) {
      throw new BadRequestException('Solo las publicaciones temporales o de alquiler diario admiten disponibilidad por fecha');
    }

    const inicio = new Date(dto.fecha_inicio);
    const fin = new Date(dto.fecha_fin);

    // Validación de negocio simple, antes de tocar el repositorio
    if (inicio > fin) {
      throw new BadRequestException('La fecha de inicio no puede ser posterior a la de fin');
    }

    const existentes = await this.fechaRepository.buscarPorRango(dto.id_publicacion, inicio, fin);
    const fechasExistentes = new Set(existentes.map((item) => this.claveFecha(item.fecha)));

    // Armamos una entidad Fecha (todavía sin guardar) por cada día del rango.
    // fechaRepository.crear() es un simple "new" con los valores por defecto,
    // no pega contra la base todavía.
    const fechas: Fecha[] = [];
    // Se usa una copia de la fecha en cada iteración para no reutilizar la misma referencia mutable.
    for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
      if (fechasExistentes.has(this.claveFecha(d))) continue;
      fechas.push(
        this.fechaRepository.crear({
          fecha: new Date(d), // copia del Date del loop, evita que todas apunten a la misma referencia
          disponible: true,
          publicacion: { id: dto.id_publicacion } as any, // solo seteamos el FK
        }),
      );
    }

    // Recién acá se hace el insert real, todo en una sola operación (batch)
    if (!fechas.length) return this.aAdministracion(existentes);
    return this.aAdministracion(await this.fechaRepository.guardarVarias(fechas));
  }

  /**
   * Calendario completo de una publicación (disponible y no disponible),
   * para que el front pinte qué días se pueden reservar.
   * Lectura pública, no requiere estar logueado.
   */
  async listarPorPublicacion(idPublicacion: number): Promise<FechaDisponibilidadPublicaDto[]> {
    const fechas = await this.fechaRepository.buscarPorPublicacion(idPublicacion);
    return fechas.map(({ fecha, disponible }) => ({ fecha, disponible }));
  }

  async listarPorPublicacionParaAdministracion(
    idPublicacion: number,
  ): Promise<FechaDisponibilidadAdministracionDto[]> {
    const fechas = await this.fechaRepository.buscarPorPublicacionParaAdministracion(idPublicacion);
    return this.aAdministracion(fechas);
  }

  /** Actualiza si un dia puede reservarse, sin modificar el resto del calendario.
   * Cambia el estado de un día puntual (ej: el anunciante bloquea
   * una fecha sin que medie una Reserva).
   */
  async actualizar(id: number, dto: ActualizarDisponibilidadDto): Promise<FechaDisponibilidadAdministracionDto> {
    const fecha = await this.fechaRepository.buscarPorId(id);
    if (!fecha) throw new NotFoundException(`No se encontró la fecha ${id}`);

    if (dto.disponible && fecha.reserva) {
      throw new BadRequestException('No se puede liberar un día asociado a una reserva');
    }

    fecha.disponible = dto.disponible;
    return this.aAdministracion([await this.fechaRepository.guardar(fecha)])[0];
  }

  private aAdministracion(fechas: Fecha[]): FechaDisponibilidadAdministracionDto[] {
    return fechas.map(({ id, fecha, disponible, reserva }) => ({
      id,
      fecha,
      disponible,
      reserva: reserva ? { id: reserva.id } : null,
    }));
  }

  private claveFecha(fecha: Date): string {
    return new Date(fecha).toISOString().slice(0, 10);
  }

  /** Elimina un dia y convierte el resultado del repositorio en un 404 claro. */
  async eliminar(id: number): Promise<void> {
    const fecha = await this.fechaRepository.buscarPorId(id);
    if (!fecha) throw new NotFoundException(`No se encontró la fecha ${id}`);
    if (fecha.reserva) {
      throw new BadRequestException('No se puede eliminar un día asociado a una reserva');
    }
    // El repositorio devuelve la cantidad de filas afectadas en vez de
    // lanzar error si no existe, así que el chequeo queda del lado del service
    const afectadas = await this.fechaRepository.eliminar(id);
    if (afectadas === 0) {
      throw new NotFoundException(`No se encontró la fecha ${id}`);
    }
  }

  // ============================================================
  // Métodos internos — no se exponen por controller.
  // Los usa el módulo Reservas (inyectando DisponibilidadService)
  // para chequear y confirmar disponibilidad al crear una reserva.
  // ============================================================

  /**
   * Verifica si TODO el rango pedido está disponible antes de confirmar
   * una reserva. Devuelve false si falta cargar algún día del rango,
   * o si alguno ya está marcado como no disponible.
   */
  async verificarDisponibilidad(idPublicacion: number, fechaInicio: Date, fechaFin: Date): Promise<boolean> {
    const fechas = await this.fechaRepository.buscarPorRango(idPublicacion, fechaInicio, fechaFin);

    // Si falta aunque sea una fila, el anunciante nunca habilito todo el rango
    // solicitado y la reserva debe rechazarse aunque las filas existentes esten libres.
    const diasEsperados =
      Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Tener menos filas que días pedidos significa que el rango nunca fue habilitado completo.
    if (fechas.length < diasEsperados) return false;

    // Un solo dia ocupado vuelve invalido el rango completo de la reserva.
    return fechas.every((f) => f.disponible);
  }

  /**
   * Marca como ocupados todos los días de un rango y los asocia a la
   * Reserva que los ocupó. Se llama DESPUÉS de que Reservas confirmó
   * que verificarDisponibilidad() dio true.
   */
  async marcarComoReservadas(
    idPublicacion: number,
    fechaInicio: Date,
    fechaFin: Date,
    idReserva: number,
  ): Promise<void> {
    // La reserva ya fue guardada y su ID permite dejar trazabilidad en cada dia
    // ocupado, relacion que tambien evita reutilizar esas fechas.
    const fechas = await this.fechaRepository.buscarPorRango(idPublicacion, fechaInicio, fechaFin);

    // Se actualizan las mismas filas que se validaron; la reserva ya tiene ID para enlazarlas.
    for (const fecha of fechas) {
      fecha.disponible = false;
      fecha.reserva = { id: idReserva } as any;
    }

    await this.fechaRepository.guardarVarias(fechas);
  }

  /** Libera únicamente las fechas enlazadas a una reserva cancelada. */
  async liberarReserva(idReserva: number): Promise<void> {
    const fechas = await this.fechaRepository.buscarPorReserva(idReserva);
    for (const fecha of fechas) {
      fecha.disponible = true;
      fecha.reserva = null as any;
    }
    if (fechas.length) await this.fechaRepository.guardarVarias(fechas);
  }

  /** Reasigna los días de una reserva al validar que el nuevo rango esté libre. */
  async reprogramarReserva(
    idPublicacion: number,
    fechaInicio: Date,
    fechaFin: Date,
    idReserva: number,
  ): Promise<boolean> {
    const nuevasFechas = await this.fechaRepository.buscarPorRangoConReserva(idPublicacion, fechaInicio, fechaFin);
    const diasEsperados = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / 86_400_000) + 1;
    if (nuevasFechas.length !== diasEsperados) return false;
    if (nuevasFechas.some((fecha) => !fecha.disponible && fecha.reserva?.id !== idReserva)) return false;

    const fechasAnteriores = await this.fechaRepository.buscarPorReserva(idReserva);
    for (const fecha of fechasAnteriores) {
      fecha.disponible = true;
      fecha.reserva = null as any;
    }
    await this.fechaRepository.guardarVarias(fechasAnteriores);

    for (const fecha of nuevasFechas) {
      fecha.disponible = false;
      fecha.reserva = { id: idReserva } as any;
    }
    await this.fechaRepository.guardarVarias(nuevasFechas);
    return true;
  }

  private admiteReservaPorFecha(modalidad?: Modalidad): boolean {
    if (modalidad?.permite_reservas_por_fecha !== null && modalidad?.permite_reservas_por_fecha !== undefined) {
      return modalidad.permite_reservas_por_fecha;
    }
    // Compatibilidad temporal para filas existentes: al desplegar, cada
    // modalidad debe configurarse explícitamente con la nueva propiedad.
    return /tempor|diari/i.test(modalidad?.nombre ?? '');
  }
}
