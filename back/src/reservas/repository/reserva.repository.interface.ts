import type { ParticipacionEnReserva } from '../../common/persistence/participacion-en-reserva';
import { Reserva } from '../entity/reserva.entity';
import { ReprogramacionReserva } from '../entity/reprogramacion-reserva.entity';
import type { EntityManager } from 'typeorm';
import type { EstadosOperacionesReserva, OperacionesReservaPendientes } from '../dto/operaciones-pendientes-cuenta.dto';

export interface ConsultaReservasAcceso {
  idPublicacion: number;
  idUsuario: number;
  fechaFinDesde: string;
  cancelada: boolean;
  finalizada: boolean;
  pagos: { estado: Reserva['estado_pago']; venceDespues?: Date }[];
}

export const RESERVA_REPOSITORY = 'RESERVA_REPOSITORY';

export interface IReservaRepository {
  contarPendientesDeCuenta(idUsuario: number, participacion: ParticipacionEnReserva, hoy: string, transaccion: EntityManager, estados: EstadosOperacionesReserva): Promise<OperacionesReservaPendientes>;
  existeReserva(consulta: ConsultaReservasAcceso): Promise<boolean>;
  finalizarEstadiasVencidas(hoy: string, aprobado: string): Promise<number[]>;
  conTransaccion<T>(operacion: (reservas: IReservaRepository, transaccion: EntityManager) => Promise<T>): Promise<T>;
  enTransaccion(transaccion: EntityManager): IReservaRepository;
  guardarReprogramacion(datos: Partial<ReprogramacionReserva>): Promise<ReprogramacionReserva>;
  buscarReprogramacion(id: number, idReserva: number): Promise<ReprogramacionReserva | null>;
  marcarReprogramacionNotificada(id: number): Promise<void>;
  buscarParaNotificarConfirmacion(id: number): Promise<Reserva | null>;
  registrarNotificaciones(id: number, datos: Partial<Pick<Reserva, | 'email_confirmacion_inquilino_enviado' | 'email_nueva_reserva_anunciante_enviado'>>): Promise<void>;
  crear(datos: Partial<Reserva>): Reserva;
  guardar(reserva: Reserva): Promise<Reserva>;
  buscarPorId(id: number, modoBloqueo?: 'pessimistic_write' | 'for_no_key_update'): Promise<Reserva | null>;
  buscarParaReclamo(id: number): Promise<Reserva | null>;
  buscarPorIdConCodigo(id: number): Promise<Reserva | null>;
  buscarPorUsuario(idUsuario: number): Promise<Reserva[]>;
  buscarPorPublicacion(idPublicacion: number): Promise<Reserva[]>;
  buscarPorAnunciante(idUsuarioAnunciante: number): Promise<Reserva[]>;
  buscarRecibidasPorAnunciante(idUsuarioAnunciante: number, estados: string[]): Promise<Reserva[]>;
  buscarPendientesVencidas(fecha: Date, pendiente: string): Promise<Reserva[]>;
  existeAprobada(idPublicacion: number, idUsuarioInquilino: number, aprobado: string): Promise<boolean>;
  existeEstadiaFinalizada(idPublicacion: number, idUsuario: number, hoy: string, aprobado: string): Promise<boolean>;
  existeEstadiaFinalizadaConAnunciante(idAnunciante: number, idUsuario: number, hoy: string, aprobado: string, modalidadesTemporales: number[]): Promise<boolean>;
  buscarCanceladasPorInquilino(idPublicacion: number, idUsuarioInquilino: number, inicio: string, fin: string): Promise<Reserva[]>;
}
