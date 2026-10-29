import {
  type IReservaRepository,
  RESERVA_REPOSITORY,
} from '../repository/reserva.repository.interface';
import {
  type ITransaccionCalendario,
  TRANSACCION_CALENDARIO,
} from '../../disponibilidad/repository/transaccion-calendario.interface';
import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EstadoLiquidacionReserva, Reserva } from '../entity/reserva.entity';
import { DisponibilidadService } from '../../disponibilidad/service/disponibilidad.service';
import { ResolverLiquidacionDto } from '../dto/resolver-liquidacion.dto';
import { generarCodigoAlojamiento } from './reservas.utils';

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
        if (!reserva.esDelInquilino(idUsuario)) {
          throw new ForbiddenException(
            'Solo el inquilino puede consultar el código de alojamiento',
          );
        }
        if (!reserva.estaConfirmada()) {
          throw new ConflictException(
            'El código estará disponible cuando el pago se encuentre aprobado',
          );
        }
        if (
          !['CONFIRMADA', 'PENDIENTE_INGRESO', 'EN_CURSO'].includes(
            reserva.estado_estadia,
          )
        ) {
          throw new ConflictException(
            'El código no está disponible para una estadía cerrada o sin fechas verificables',
          );
        }
        // Compatibilidad con reservas aprobadas antes de incorporar RF21.
        if (reserva.asegurarCodigoAlojamiento(generarCodigoAlojamiento()))
          await reservaRepository.guardar(reserva);
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
        if (!reserva.esDelAnunciante(idUsuarioAnunciante)) {
          throw new ForbiddenException(
            'Solo el anunciante de la publicación puede validar el código',
          );
        }
        if (!reserva.estaConfirmada()) {
          throw new ConflictException('La reserva no se encuentra confirmada');
        }
        if (reserva.codigoValidado()) {
          throw new ConflictException(
            'El código de esta reserva ya fue utilizado',
          );
        }
        if (reserva.estado_estadia !== 'PENDIENTE_INGRESO') {
          throw new ConflictException(
            'El código solo puede validarse durante las fechas de la estadía',
          );
        }
        if (reserva.liquidacionEnRevision()) {
          throw new ConflictException(
            'La reserva tiene un reclamo abierto y debe revisarla un administrador',
          );
        }
        if (reserva.codigoBloqueado()) {
          throw new ConflictException(
            'Se alcanzó el límite de intentos. Contactá a un administrador',
          );
        }

        const coincide = reserva.registrarIntentoCodigo(codigo);
        await reservaRepository.guardar(reserva);
        if (!coincide) {
          return new BadRequestException(
            `Código incorrecto. Quedan ${reserva.intentosCodigoRestantes()} intentos`,
          );
        }
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
        if (!reserva.esDelInquilino(idUsuario)) {
          throw new ForbiddenException(
            'Solo el inquilino de la reserva puede reportar un problema',
          );
        }
        if (!reserva.estaConfirmada()) {
          throw new ConflictException(
            'Solo se pueden reportar problemas sobre reservas confirmadas',
          );
        }
        if (reserva.liquidacionResuelta()) {
          throw new ConflictException(
            'La liquidación de esta reserva ya fue resuelta',
          );
        }
        reserva.reportarProblema(motivo);
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
        if (!reserva.pagoAprobado()) {
          throw new ConflictException(
            'La reserva no posee un pago aprobado para liquidar',
          );
        }
        if (
          dto.estado === EstadoLiquidacionReserva.PAGADO_PROPIETARIO &&
          !reserva.codigoValidado()
        ) {
          throw new ConflictException(
            'No se puede registrar el pago al propietario sin validar el código',
          );
        }
        reserva.resolverLiquidacion(
          dto.estado,
          dto.referencia,
          dto.observacion,
        );
        // Devolver el dinero cancela la reserva y libera sus días.
        if (dto.estado === EstadoLiquidacionReserva.DEVUELTO_INQUILINO) {
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
