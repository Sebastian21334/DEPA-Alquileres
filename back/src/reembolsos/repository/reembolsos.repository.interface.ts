import { EstadoReembolso, Reembolso } from '../entity/reembolso.entity';

export const REEMBOLSOS_REPOSITORY = 'REEMBOLSOS_REPOSITORY';

export interface IReembolsosRepository {
  crear(datos: Partial<Reembolso>): Reembolso;
  guardar(reembolso: Reembolso): Promise<Reembolso>;
  buscarPorId(id: number): Promise<Reembolso | null>;
  buscarPorIdConBloqueo(id: number): Promise<Reembolso | null>;
  buscarPagoId(id: number): Promise<number | null>;
  buscarPorIdempotencyKey(clave: string): Promise<Reembolso | null>;
  buscarPorIdExterno(idExterno: string): Promise<Reembolso | null>;
  buscarPorReferenciaExterna(referencia: string): Promise<Reembolso | null>;
  buscarPorPago(idPago: number): Promise<Reembolso[]>;
  buscarPorReserva(idReserva: number): Promise<Reembolso[]>;
  buscarPorReservasConEstados(
    idsReserva: number[],
    estados: EstadoReembolso[],
  ): Promise<Reembolso[]>;
  sumarImportesReservados(
    idPago: number,
    excluirId?: number,
  ): Promise<number>;
  actualizarEnTransaccion(
    id: number,
    operacion: (reembolso: Reembolso) => void,
  ): Promise<Reembolso | null>;
  buscarPendientesConciliacion(): Promise<Reembolso[]>;
  buscarAprobados(): Promise<Reembolso[]>;
  listarAdministracion(): Promise<Reembolso[]>;
}
