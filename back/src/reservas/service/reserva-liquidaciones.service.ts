import { TRANSACCION_CALENDARIO } from '../../disponibilidad/repository/transaccion-calendario.interface';
import type { ITransaccionCalendario } from '../../disponibilidad/repository/transaccion-calendario.interface';
import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import {
  EstadoPagoReserva,
  EstadoLiquidacionReserva,
  Reserva,
} from '../entity/reserva.entity';
import { RESERVA_REPOSITORY } from '../repository/reserva.repository.interface';
import type { IReservaRepository } from '../repository/reserva.repository.interface';
import { DisponibilidadService } from '../../disponibilidad/service/disponibilidad.service';
import { ResolverLiquidacionDto } from '../dto/resolver-liquidacion.dto';
import { generarCodigoAlojamiento } from './reservas.utils';
import { calcularEstadoEstadia } from '../domain/estado-estadia';

@Injectable()
export class ReservaLiquidacionesService {
  constructor(
    @Inject(TRANSACCION_CALENDARIO)
    private readonly transaccion: ITransaccionCalendario,
    @Inject(RESERVA_REPOSITORY)
    private readonly reservaRepository: IReservaRepository,
    private readonly disponibilidadService: DisponibilidadService,
  ) {}

  /** Devuelve el código únicamente al inquilino que realizó la reserva. */
  async consultarCodigoAlojamiento(id: number, idUsuario: number) {
    return this.transaccion.ejecutar(
      async ({ reservas: reservaRepository }) => {
        const reserva = await reservaRepository.buscarPorIdConCodigo(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        if (reserva.usuario?.id !== idUsuario) {
          throw new ForbiddenException(
            'Solo el inquilino puede consultar el código de alojamiento',
          );
        }
        if (
          reserva.estado_pago !== EstadoPagoReserva.APROBADO ||
          reserva.cancelada
        ) {
          throw new ConflictException(
            'El código estará disponible cuando el pago se encuentre aprobado',
          );
        }
        if (
          !['CONFIRMADA', 'PENDIENTE_INGRESO', 'EN_CURSO'].includes(
            calcularEstadoEstadia(reserva),
          )
        ) {
          throw new ConflictException(
            'El código no está disponible para una estadía cerrada o sin fechas verificables',
          );
        }
        if (!reserva.codigo_alojamiento) {
          // Compatibilidad con reservas aprobadas antes de incorporar RF21.
          reserva.codigo_alojamiento = generarCodigoAlojamiento();
          reserva.codigo_generado_en = new Date();
          reserva.estado_liquidacion = EstadoLiquidacionReserva.RETENIDO;
          await reservaRepository.guardar(reserva);
        }
        return {
          reserva_id: reserva.id,
          codigo: reserva.codigo_alojamiento,
          generado_en: reserva.codigo_generado_en,
          validado_en: reserva.codigo_validado_en,
          estado_liquidacion: reserva.estado_liquidacion,
        };
      },
    );
  }

  /** El anunciante presenta el código entregado físicamente por el huésped. */
  async validarCodigoAlojamiento(
    id: number,
    codigo: string,
    idUsuarioAnunciante: number,
  ): Promise<Reserva> {
    const resultado = await this.transaccion.ejecutar(
      async ({ reservas: reservaRepository }) => {
        const reserva = await reservaRepository.buscarPorIdConCodigo(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        if (
          reserva.publicacion?.anunciante?.idUsuario !== idUsuarioAnunciante
        ) {
          throw new ForbiddenException(
            'Solo el anunciante de la publicación puede validar el código',
          );
        }
        if (
          reserva.estado_pago !== EstadoPagoReserva.APROBADO ||
          reserva.cancelada
        ) {
          throw new ConflictException('La reserva no se encuentra confirmada');
        }
        if (reserva.codigo_validado_en) {
          throw new ConflictException(
            'El código de esta reserva ya fue utilizado',
          );
        }
        if (calcularEstadoEstadia(reserva) !== 'PENDIENTE_INGRESO') {
          throw new ConflictException(
            'El código solo puede validarse durante las fechas de la estadía',
          );
        }
        if (
          reserva.estado_liquidacion === EstadoLiquidacionReserva.EN_REVISION
        ) {
          throw new ConflictException(
            'La reserva tiene un reclamo abierto y debe revisarla un administrador',
          );
        }
        if (reserva.intentos_codigo >= 5) {
          throw new ConflictException(
            'Se alcanzó el límite de intentos. Contactá a un administrador',
          );
        }

        const recibido = codigo.trim().toUpperCase();
        const esperado = reserva.codigo_alojamiento ?? '';
        const coincide =
          recibido.length === esperado.length &&
          timingSafeEqual(Buffer.from(recibido), Buffer.from(esperado));
        if (!coincide) {
          reserva.intentos_codigo += 1;
          if (reserva.intentos_codigo >= 5) {
            reserva.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
            reserva.observacion_liquidacion =
              'Código bloqueado después de cinco intentos incorrectos';
          }
          await reservaRepository.guardar(reserva);
          return new BadRequestException(
            `Código incorrecto. Quedan ${5 - reserva.intentos_codigo} intentos`,
          );
        }

        reserva.codigo_validado_en = new Date();
        reserva.estado_liquidacion =
          EstadoLiquidacionReserva.PENDIENTE_PAGO_PROPIETARIO;
        reserva.observacion_liquidacion =
          'Código de alojamiento validado por el anunciante';
        await reservaRepository.guardar(reserva);
        const actualizada = await reservaRepository.buscarPorId(id);
        if (!actualizada)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        return actualizada;
      },
    );
    // El intento incorrecto debe persistir aunque la respuesta sea un error.
    if (resultado instanceof BadRequestException) throw resultado;
    return resultado;
  }

  /** El reclamo del inquilino congela cualquier liquidación manual pendiente. */
  async reportarProblema(
    id: number,
    motivo: string,
    idUsuario: number,
  ): Promise<Reserva> {
    return this.transaccion.ejecutar(
      async ({ reservas: reservaRepository }) => {
        const reserva = await reservaRepository.buscarPorId(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        if (reserva.usuario?.id !== idUsuario) {
          throw new ForbiddenException(
            'Solo el inquilino de la reserva puede reportar un problema',
          );
        }
        if (
          reserva.estado_pago !== EstadoPagoReserva.APROBADO ||
          reserva.cancelada
        ) {
          throw new ConflictException(
            'Solo se pueden reportar problemas sobre reservas confirmadas',
          );
        }
        if (
          reserva.estado_liquidacion ===
            EstadoLiquidacionReserva.PAGADO_PROPIETARIO ||
          reserva.estado_liquidacion ===
            EstadoLiquidacionReserva.DEVUELTO_INQUILINO
        ) {
          throw new ConflictException(
            'La liquidación de esta reserva ya fue resuelta',
          );
        }
        reserva.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
        reserva.observacion_liquidacion = `Reclamo del inquilino: ${motivo.trim()}`;
        reserva.fecha_resolucion_liquidacion = null;
        return reservaRepository.guardar(reserva);
      },
    );
  }

  listarLiquidacionesAdministracion(): Promise<Reserva[]> {
    return this.reservaRepository.buscarLiquidacionesAdministracion();
  }

  /** Registra una decisión administrativa; no ejecuta movimientos de dinero reales. */
  async resolverLiquidacion(
    id: number,
    dto: ResolverLiquidacionDto,
  ): Promise<Reserva> {
    return this.transaccion.ejecutar(
      async ({ reservas: reservaRepository, fechas: fechaRepository }) => {
        const permitidos = [
          EstadoLiquidacionReserva.PAGADO_PROPIETARIO,
          EstadoLiquidacionReserva.DEVUELTO_INQUILINO,
          EstadoLiquidacionReserva.EN_REVISION,
          EstadoLiquidacionReserva.PENDIENTE_PAGO_PROPIETARIO,
          EstadoLiquidacionReserva.RETENIDO,
        ];
        if (!permitidos.includes(dto.estado)) {
          throw new BadRequestException(
            'El estado solicitado no es una resolución administrativa válida',
          );
        }
        const reserva = await reservaRepository.buscarPorId(id);
        if (!reserva)
          throw new NotFoundException(`No se encontró la reserva ${id}`);
        if (reserva.estado_pago !== EstadoPagoReserva.APROBADO) {
          throw new ConflictException(
            'La reserva no posee un pago aprobado para liquidar',
          );
        }
        if (
          dto.estado === EstadoLiquidacionReserva.PAGADO_PROPIETARIO &&
          !reserva.codigo_validado_en
        ) {
          throw new ConflictException(
            'No se puede registrar el pago al propietario sin validar el código',
          );
        }
        reserva.estado_liquidacion = dto.estado;
        reserva.referencia_liquidacion = dto.referencia?.trim() || null;
        reserva.observacion_liquidacion =
          dto.observacion?.trim() || reserva.observacion_liquidacion;
        reserva.fecha_resolucion_liquidacion = [
          EstadoLiquidacionReserva.PAGADO_PROPIETARIO,
          EstadoLiquidacionReserva.DEVUELTO_INQUILINO,
        ].includes(dto.estado)
          ? new Date()
          : null;
        if (dto.estado === EstadoLiquidacionReserva.RETENIDO) {
          reserva.intentos_codigo = 0;
        }
        if (dto.estado === EstadoLiquidacionReserva.DEVUELTO_INQUILINO) {
          reserva.estado_pago = EstadoPagoReserva.REEMBOLSADO;
          reserva.cancelada = true;
          reserva.fecha_cancelacion = new Date();
          await this.disponibilidadService.liberarReserva(
            reserva.id,
            fechaRepository,
          );
        }
        return reservaRepository.guardar(reserva);
      },
    );
  }
}
