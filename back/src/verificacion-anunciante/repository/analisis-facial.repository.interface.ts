export const ANALISIS_FACIAL_REPOSITORY = 'ANALISIS_FACIAL_REPOSITORY';

export interface AnalisisRostro {
  descriptor: Float32Array;
  yaw: number;
  roll: number;
  aperturaBoca: number;
}

export interface IAnalisisFacialRepository {
  analizarRostro(buffer: Buffer, nombre: string): Promise<AnalisisRostro>;
  distancia(referencia: Float32Array, candidata: Float32Array): number;
}
