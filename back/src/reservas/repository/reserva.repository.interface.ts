import { Reserva } from '../entity/reserva.entity';
import { ReprogramacionReserva } from '../entity/reprogramacion-reserva.entity';
import type { EntityManager } from 'typeorm';

export const RESERVA_REPOSITORY = 'RESERVA_REPOSITORY';

export interface IReservaRepository {
  finalizarEstadiasVencidas(hoy: string, aprobado: string): Promise<void>;
  conTransaccion<T>(operacion: (reservas: IReservaRepository, transaccion: EntityManager) => Promise<T>): Promise<T>;
  enTransaccion(transaccion: EntityManager): IReservaRepository;
  guardarReprogramacion(datos: Partial<ReprogramacionReserva>): Promise<ReprogramacionReserva>;
  buscarReprogramacion(id: number, idReserva: number): Promise<ReprogramacionReserva | null>;
  marcarReprogramacionNotificada(id: number): Promise<void>;
  registrarNotificaciones(id: number, datos: Partial<Pick<Reserva, | 'email_confirmacion_inquilino_enviado' | 'email_nueva_reserva_anunciante_enviado'>>): Promise<void>;
  crear(datos: Partial<Reserva>): Reserva;
  guardar(reserva: Reserva): Promise<Reserva>;
  guardarVarias(reservas: Reserva[]): Promise<Reserva[]>;
  buscarPorId(id: number, modoBloqueo?: 'pessimistic_write' | 'for_no_key_update'): Promise<Reserva | null>;
  buscarParaReclamo(id: number): Promise<Reserva | null>;
  buscarPorIdConCodigo(id: number): Promise<Reserva | null>;
  buscarPorUsuario(idUsuario: number): Promise<Reserva[]>;
  buscarPorPublicacion(idPublicacion: number): Promise<Reserva[]>;
  buscarPorAnunciante(idUsuarioAnunciante: number): Promise<Reserva[]>;
  buscarRecibidasPorAnunciante(idUsuarioAnunciante: number, aprobado: string): Promise<Reserva[]>;
  buscarPendientesVencidas(fecha: Date, pendiente: string): Promise<Reserva[]>;
  existeAprobada(idPublicacion: number, idUsuarioInquilino: number, aprobado: string): Promise<boolean>;
}
