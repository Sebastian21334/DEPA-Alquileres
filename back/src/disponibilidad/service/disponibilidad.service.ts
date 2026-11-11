import type { EntityManager } from 'typeorm';
import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Fecha } from '../entity/fecha.entity';
import { CrearDisponibilidadDto } from '../dto/crear-disponibilidad.dto';
import { ActualizarDisponibilidadDto } from '../dto/actualizar-disponibilidad.dto';
import type { IFechaRepository } from '../repository/fecha.repository.interface';
import { FECHA_REPOSITORY } from '../repository/fecha.repository.interface';
import { FechaDisponibilidadPublicaDto } from '../dto/fecha-disponibilidad-publica.dto';
import { FechaDisponibilidadAdministracionDto } from '../dto/fecha-disponibilidad-administracion.dto';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { Reserva } from '../../reservas/entity/reserva.entity';

@Injectable()
export class DisponibilidadService {
  constructor(@Inject(FECHA_REPOSITORY) private readonly fechaRepository: IFechaRepository, private readonly publicacionesService: PublicacionesService) {}

  async validarPropiedad(idUsuario: number, recurso: { idPublicacion?: number; idFecha?: number }): Promise<void> {
    let idPublicacion = recurso.idPublicacion;
    if (idPublicacion === undefined) {
      if (!Number.isSafeInteger(recurso.idFecha) || recurso.idFecha! <= 0) {
        throw new BadRequestException('El ID de la fecha no es válido');
      }
      const fecha = await this.fechaRepository.buscarPorId(recurso.idFecha!);
      if (!fecha) throw new NotFoundException('Fecha no encontrada');
      idPublicacion = fecha.publicacion.id;
    }
    if (!Number.isSafeInteger(idPublicacion) || idPublicacion <= 0) {
      throw new BadRequestException('El ID de la publicación no es válido');
    }
    await this.publicacionesService.obtenerPropia(
      idPublicacion,
      idUsuario,
      'No sos el propietario de esta publicación',
    );
  }

  /**
   * Crea un rango de fechas disponibles para una publicación.
   * Se guarda un registro Fecha por cada día (no un "rango" como tal),
   * porque después Reservas necesita poder marcar días puntuales como
   * ocupados sin afectar el resto del rango.
   */
  async crear(dto: CrearDisponibilidadDto): Promise<FechaDisponibilidadAdministracionDto[]> {
    // Se trabaja con fechas completas para poder generar una fila por cada dia.
    const publicacion = await this.publicacionesService.buscarPorId(
      dto.id_publicacion,
    );
    if (!this.publicacionesService.admiteReservaPorFecha(publicacion)) {
      throw new BadRequestException(
        'Solo las publicaciones temporales o de alquiler diario admiten disponibilidad por fecha',
      );
    }

    const inicio = new Date(dto.fecha_inicio);
    const fin = new Date(dto.fecha_fin);

    // Validación de negocio simple, antes de tocar el repositorio
    if (inicio > fin) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser posterior a la de fin',
      );
    }

    return this.fechaRepository.conTransaccion(async (fechaRepository, transaccion) => {
      await this.publicacionesService.bloquearParaModificacion(dto.id_publicacion, transaccion);
      const existentes = await fechaRepository.buscarPorRango(
        dto.id_publicacion,
        inicio,
        fin,
      );
      const fechasExistentes = new Set(
        existentes.map((item) => this.claveFecha(item.fecha)),
      );

      // Armamos una entidad Fecha (todavía sin guardar) por cada día del rango.
      // fechaRepository.crear() es un simple "new" con los valores por defecto,
      // no pega contra la base todavía.
      const fechas: Fecha[] = [];
      // Se usa una copia de la fecha en cada iteración para no reutilizar la misma referencia mutable.
      for (
        let d = new Date(inicio);
        d <= fin;
        d.setUTCDate(d.getUTCDate() + 1)
      ) {
        if (fechasExistentes.has(this.claveFecha(d))) continue;
        fechas.push(
          fechaRepository.crear({
            fecha: this.claveFecha(d), // PostgreSQL date no lleva hora ni zona horaria
            disponible: true,
            publicacion,
          }),
        );
      }

      // Recién acá se hace el insert real, todo en una sola operación (batch)
      if (!fechas.length) return this.aAdministracion(existentes);
      return this.aAdministracion(await fechaRepository.guardarVarias(fechas));
    });
  }

  /**
   * Calendario completo de una publicación (disponible y no disponible),
   * para que el front pinte qué días se pueden reservar.
   * Lectura pública, no requiere estar logueado.
   */
  async listarPorPublicacion(idPublicacion: number): Promise<FechaDisponibilidadPublicaDto[]> {
    const fechas =
      await this.fechaRepository.buscarPorPublicacion(idPublicacion);
    return fechas.map(({ fecha, disponible }) => ({ fecha, disponible }));
  }

  async listarPorPublicacionParaAdministracion(idPublicacion: number): Promise<FechaDisponibilidadAdministracionDto[]> {
    const fechas =
      await this.fechaRepository.buscarPorPublicacionParaAdministracion(
        idPublicacion,
      );
    return this.aAdministracion(fechas);
  }

  /** Actualiza si un dia puede reservarse, sin modificar el resto del calendario.
   * Cambia el estado de un día puntual (ej: el anunciante bloquea
   * una fecha sin que medie una Reserva).
   */
  async actualizar(id: number, dto: ActualizarDisponibilidadDto): Promise<FechaDisponibilidadAdministracionDto> {
    return this.fechaRepository.conTransaccion(async (fechaRepository, transaccion) => {
      const fecha = await this.buscarFechaBloqueada(id, fechaRepository, transaccion);

      if (dto.disponible && fecha.reserva) {
        throw new BadRequestException(
          'No se puede liberar un día asociado a una reserva',
        );
      }

      fecha.disponible = dto.disponible;
      return this.aAdministracion([await fechaRepository.guardar(fecha)])[0];
    });
  }

  private aAdministracion(fechas: Fecha[]): FechaDisponibilidadAdministracionDto[] {
    return fechas.map(({ id, fecha, disponible, reserva }) => ({
      id,
      fecha,
      disponible,
      reserva: reserva ? { id: reserva.id } : null,
    }));
  }

  private claveFecha(fecha: Date | string): string {
    return new Date(fecha).toISOString().slice(0, 10);
  }

  /** Elimina un dia y convierte el resultado del repositorio en un 404 claro. */
  async eliminar(id: number): Promise<void> {
    return this.fechaRepository.conTransaccion(async (fechaRepository, transaccion) => {
      const fecha = await this.buscarFechaBloqueada(id, fechaRepository, transaccion);
      if (fecha.reserva) {
        throw new BadRequestException(
          'No se puede eliminar un día asociado a una reserva',
        );
      }
      // El repositorio devuelve la cantidad de filas afectadas en vez de
      // lanzar error si no existe, así que el chequeo queda del lado del service
      const afectadas = await fechaRepository.eliminar(id);
      if (afectadas === 0) {
        throw new NotFoundException(`No se encontró la fecha ${id}`);
      }
    });
  }

  private async buscarFechaBloqueada(id: number, repositorio: IFechaRepository, transaccion: EntityManager): Promise<Fecha> {
    const idPublicacion = await repositorio.buscarPublicacionPorFecha(id);
    if (idPublicacion === null) throw new NotFoundException(`No se encontró la fecha ${id}`);
    await this.publicacionesService.bloquearParaModificacion(idPublicacion, transaccion);
    const fecha = await repositorio.buscarPorId(id);
    if (!fecha) throw new NotFoundException(`No se encontró la fecha ${id}`);
    return fecha;
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
  async verificarDisponibilidad(idPublicacion: number, fechaInicio: Date, fechaFin: Date, transaccion?: EntityManager): Promise<boolean> {
    const fechaRepository = transaccion
      ? this.fechaRepository.enTransaccion(transaccion)
      : this.fechaRepository;
    const fechas = await fechaRepository.buscarPorRango(
      idPublicacion,
      fechaInicio,
      fechaFin,
    );

    // Si falta aunque sea una fila, el anunciante nunca habilito todo el rango
    // solicitado y la reserva debe rechazarse aunque las filas existentes esten libres.
    const diasEsperados =
      Math.floor(
        (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;

    // Tener menos filas que días pedidos significa que el rango nunca fue habilitado completo.
    if (fechas.length !== diasEsperados) return false;

    // Un solo dia ocupado vuelve invalido el rango completo de la reserva.
    return fechas.every((fecha) => fecha.disponible && !fecha.reserva);
  }

  /**
   * Marca como ocupados todos los días de un rango y los asocia a la
   * Reserva que los ocupó. Se llama DESPUÉS de que Reservas confirmó
   * que verificarDisponibilidad() dio true.
   */
  async marcarComoReservadas(idPublicacion: number, fechaInicio: Date, fechaFin: Date, idReserva: number, transaccion: EntityManager): Promise<void> {
    const fechaRepository = this.fechaRepository.enTransaccion(transaccion);
    await this.publicacionesService.bloquearParaModificacion(idPublicacion, transaccion);
    if (
      !(await this.verificarDisponibilidad(
        idPublicacion,
        fechaInicio,
        fechaFin,
        transaccion,
      ))
    ) {
      throw new ConflictException(
        'El rango de fechas seleccionado no está disponible',
      );
    }
    // La reserva ya fue guardada y su ID permite dejar trazabilidad en cada dia
    // ocupado, relacion que tambien evita reutilizar esas fechas.
    const fechas = await fechaRepository.buscarPorRango(
      idPublicacion,
      fechaInicio,
      fechaFin,
    );

    // Se actualizan las mismas filas que se validaron; la reserva ya tiene ID para enlazarlas.
    this.ocuparFechas(fechas, idReserva);
    await fechaRepository.guardarVarias(fechas);
  }

  /** Libera únicamente las fechas enlazadas a una reserva cancelada. */
  async liberarReserva(idReserva: number, transaccion: EntityManager): Promise<void> {
    const fechaRepository = this.fechaRepository.enTransaccion(transaccion);
    const fechas = await this.buscarFechasReservadas(idReserva, fechaRepository, transaccion);
    this.liberarFechas(fechas);
    if (fechas.length) await fechaRepository.guardarVarias(fechas);
  }

  /** Reasigna los días de una reserva al validar que el nuevo rango esté libre. */
  async reprogramarReserva(idPublicacion: number, fechaInicio: Date, fechaFin: Date, idReserva: number, transaccion: EntityManager): Promise<boolean> {
    const fechaRepository = this.fechaRepository.enTransaccion(transaccion);
    await this.publicacionesService.bloquearParaModificacion(idPublicacion, transaccion);
    const nuevasFechas = await fechaRepository.buscarPorRangoConReserva(
      idPublicacion,
      fechaInicio,
      fechaFin,
    );
    const diasEsperados =
      Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / 86_400_000) + 1;
    if (nuevasFechas.length !== diasEsperados) return false;
    if (!nuevasFechas.every(({ reserva, disponible }) =>
      reserva ? reserva.id === idReserva : disponible,
    ))
      return false;

    const fechasAnteriores = await this.buscarFechasReservadas(idReserva, fechaRepository, transaccion);
    this.liberarFechas(fechasAnteriores);
    await fechaRepository.guardarVarias(fechasAnteriores);

    this.ocuparFechas(nuevasFechas, idReserva);
    await fechaRepository.guardarVarias(nuevasFechas);
    return true;
  }

  private async buscarFechasReservadas(idReserva: number, repositorio: IFechaRepository, transaccion: EntityManager): Promise<Fecha[]> {
    const idPublicacion = await repositorio.buscarPublicacionPorReserva(idReserva);
    if (idPublicacion !== null) {
      await this.publicacionesService.bloquearParaModificacion(idPublicacion, transaccion);
    }
    return repositorio.buscarPorReserva(idReserva);
  }

  private ocuparFechas(fechas: Fecha[], idReserva: number): void {
    const reserva = Object.assign(new Reserva(), { id: idReserva });
    for (const fecha of fechas) {
      fecha.disponible = false;
      fecha.reserva = reserva;
    }
  }

  private liberarFechas(fechas: Fecha[]): void {
    for (const fecha of fechas) {
      fecha.disponible = true;
      fecha.reserva = null;
    }
  }
}
