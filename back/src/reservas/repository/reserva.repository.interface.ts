import {
  EstadoLiquidacionReserva,
  Reserva,
} from '../entity/reserva.entity';
import { ReprogramacionReserva } from '../entity/reprogramacion-reserva.entity';
import { SolicitudCancelacion } from '../entity/solicitud-cancelacion.entity';
import type { Publicacion } from '../../publicaciones/entity/publicacion.entity';

export const RESERVA_REPOSITORY = 'RESERVA_REPOSITORY';

export type FiltrosLiquidacionesAdministracion = {
  estados: EstadoLiquidacionReserva[];
  incluirCanceladasPorBloqueo: boolean;
  actorCancelacion: 'ADMINISTRADOR';
  motivoBloqueo: string;
};

export interface IReservaRepository {
  buscarCondicionesPublicacion(id: number): Promise<Publicacion | null>;
  guardarReprogramacion(
    datos: Partial<ReprogramacionReserva>,
  ): Promise<ReprogramacionReserva>;
  buscarReprogramacion(
    id: number,
    idReserva: number,
  ): Promise<ReprogramacionReserva | null>;
  marcarReprogramacionNotificada(id: number): Promise<void>;
  registrarNotificaciones(
    id: number,
    datos: Partial<
      Pick<
        Reserva,
        | 'email_confirmacion_inquilino_enviado'
        | 'email_nueva_reserva_anunciante_enviado'
      >
    >,
  ): Promise<void>;
  crear(datos: Partial<Reserva>): Reserva;
  guardar(reserva: Reserva): Promise<Reserva>;
  guardarVarias(reservas: Reserva[]): Promise<Reserva[]>;
  buscarPorId(id: number): Promise<Reserva | null>;
  buscarPorIdConCodigo(id: number): Promise<Reserva | null>;
  buscarPorUsuario(idUsuario: number): Promise<Reserva[]>;
  buscarPorPublicacion(idPublicacion: number): Promise<Reserva[]>;
  buscarPorAnunciante(idUsuarioAnunciante: number): Promise<Reserva[]>;
  buscarRecibidasPorAnunciante(idUsuarioAnunciante: number): Promise<Reserva[]>;
  buscarPendientesVencidas(fecha: Date): Promise<Reserva[]>;
  marcarFinalizadas(fechaCorte: string): Promise<void>;
  existeAprobada(
    idPublicacion: number,
    idUsuarioInquilino: number,
  ): Promise<boolean>;
  buscarLiquidacionesAdministracion(
    filtros: FiltrosLiquidacionesAdministracion,
  ): Promise<Reserva[]>;
  crearSolicitudCancelacion(
    datos: Partial<SolicitudCancelacion>,
  ): SolicitudCancelacion;
  guardarSolicitudCancelacion(
    solicitud: SolicitudCancelacion,
  ): Promise<SolicitudCancelacion>;
  buscarSolicitudCancelacion(
    id: number,
    idReserva: number,
  ): Promise<SolicitudCancelacion | null>;
  buscarSolicitudCancelacionConBloqueo(
    id: number,
    idReserva: number,
  ): Promise<SolicitudCancelacion | null>;
  buscarSolicitudCancelacionActiva(
    idReserva: number,
  ): Promise<SolicitudCancelacion | null>;
  listarSolicitudesCancelacionAdministracion(): Promise<SolicitudCancelacion[]>;
}
