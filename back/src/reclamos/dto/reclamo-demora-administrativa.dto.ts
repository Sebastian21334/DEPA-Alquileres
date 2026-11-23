export interface DemoraAdministrativaDto {
  solicitudId: number;
  reservaId: number;
  titulo: string;
  fechaInicio: string | null;
  fechaSolicitud: Date;
  reclamoAbierto: boolean;
}
