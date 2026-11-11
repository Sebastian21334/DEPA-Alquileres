export const ANALISIS_FACIAL = 'ANALISIS_FACIAL';

export interface AnalisisRostro {
  descriptor: Float32Array;
  yaw: number;
  roll: number;
  aperturaBoca: number;
}

export interface IAnalisisFacial {
  analizarRostro(buffer: Buffer, nombre: string): Promise<AnalisisRostro>;
  distancia(referencia: Float32Array, candidata: Float32Array): number;
}
