import { Reserva } from '../entity/reserva.entity';
import { ReprogramacionReserva } from '../entity/reprogramacion-reserva.entity';
import { SolicitudCancelacion } from '../entity/solicitud-cancelacion.entity';
import type { EntityManager } from 'typeorm';

export const RESERVA_REPOSITORY = 'RESERVA_REPOSITORY';

export interface IReservaRepository {
  finalizarEstadiasVencidas(hoy: string, aprobado: string): Promise<void>;
  conTransaccion<T>(operacion: (reservas: IReservaRepository, transaccion: EntityManager) => Promise<T>): Promise<T>;
  guardarReprogramacion(datos: Partial<ReprogramacionReserva>): Promise<ReprogramacionReserva>;
  buscarReprogramacion(id: number, idReserva: number): Promise<ReprogramacionReserva | null>;
  marcarReprogramacionNotificada(id: number): Promise<void>;
  registrarNotificaciones(id: number, datos: Partial<Pick<Reserva, | 'email_confirmacion_inquilino_enviado' | 'email_nueva_reserva_anunciante_enviado'>>): Promise<void>;
  crear(datos: Partial<Reserva>): Reserva;
  guardar(reserva: Reserva): Promise<Reserva>;
  guardarVarias(reservas: Reserva[]): Promise<Reserva[]>;
  buscarPorId(id: number): Promise<Reserva | null>;
  buscarParaReclamo(id: number): Promise<Reserva | null>;
  buscarPorIdConCodigo(id: number): Promise<Reserva | null>;
  buscarPorUsuario(idUsuario: number): Promise<Reserva[]>;
  buscarPorPublicacion(idPublicacion: number): Promise<Reserva[]>;
  buscarPorAnunciante(idUsuarioAnunciante: number): Promise<Reserva[]>;
  buscarRecibidasPorAnunciante(idUsuarioAnunciante: number, aprobado: string): Promise<Reserva[]>;
  buscarPendientesVencidas(fecha: Date, pendiente: string): Promise<Reserva[]>;
  existeAprobada(idPublicacion: number, idUsuarioInquilino: number, aprobado: string): Promise<boolean>;
  buscarLiquidacionesAdministracion(estados: string[]): Promise<Reserva[]>;
  crearSolicitudCancelacion(datos: Partial<SolicitudCancelacion>): SolicitudCancelacion;
  guardarSolicitudCancelacion(solicitud: SolicitudCancelacion): Promise<SolicitudCancelacion>;
  buscarSolicitudCancelacion(id: number, idReserva: number): Promise<SolicitudCancelacion | null>;
  buscarSolicitudCancelacionActiva(idReserva: number, estado: string): Promise<SolicitudCancelacion | null>;
  listarSolicitudesCancelacionAdministracion(estado: string): Promise<SolicitudCancelacion[]>;
}
