export interface PuntoFacial { x: number; y: number }
export interface PoseFacial { yaw: number; roll: number }
export type GestoVitalidad = 'TURN_LEFT' | 'TURN_RIGHT' | 'TILT_HEAD' | 'OPEN_MOUTH';

export function evaluarEncuadre(caras: readonly (readonly PuntoFacial[])[]): string | null {
  if (!caras.length) return 'No vemos tu cara. Mirá a la cámara y ubicate dentro del óvalo.';
  if (caras.length !== 1) return 'Hay más de una cara. La prueba debe hacerse de a una persona.';
  const cara = caras[0];
  const puntos = [cara[1], cara[234], cara[454], cara[10], cara[152]];
  if (puntos.some(p => !p || !Number.isFinite(p.x) || !Number.isFinite(p.y))) {
    return 'No vemos bien tu cara. Buscá luz de frente y evitá taparte el rostro.';
  }
  const ancho = Math.abs(cara[454].x - cara[234].x);
  if (ancho < .18) return 'Acercate un poco a la cámara.';
  if (ancho > .62 || puntos.some(p => p.x < .02 || p.x > .98 || p.y < .02 || p.y > .98)) {
    return 'Alejate un poco para que se vea toda tu cara.';
  }
  const centroX = (cara[234].x + cara[454].x) / 2;
  const centroY = (cara[10].y + cara[152].y) / 2;
  if (Math.abs(centroX - .5) > .18 || Math.abs(centroY - .53) > .22) {
    return 'Mové tu cara hacia el centro del óvalo.';
  }
  return null;
}

export function detectarGesto(accion: GestoVitalidad | null, pose: PoseFacial,
  neutral: PoseFacial | null, boca: number): boolean {
  if (!accion || !neutral) return false;
  const yaw = pose.yaw - neutral.yaw;
  const roll = pose.roll - neutral.roll;
  if (accion === 'TURN_LEFT') return yaw >= .07;
  if (accion === 'TURN_RIGHT') return yaw <= -.07;
  if (accion === 'TILT_HEAD') return Math.abs(roll) >= .18;
  return boca >= .45 && Math.abs(yaw) <= .06 && Math.abs(roll) <= .12;
}

// Exige una posición continua por tiempo, independientemente de los FPS.
// Una pausa larga del navegador nunca cuenta como tiempo de evidencia.
export class PosicionEstable {
  private inicio: number | null = null;
  private anterior: number | null = null;

  reiniciar(): void { this.inicio = null; this.anterior = null; }

  progreso(cumple: boolean, ahora: number, duracion: number): number {
    if (!cumple) { this.reiniciar(); return 0; }
    if (this.anterior === null || ahora - this.anterior > 350 || ahora < this.anterior) this.inicio = ahora;
    this.anterior = ahora;
    return Math.min(100, Math.round((ahora - this.inicio!) / duracion * 100));
  }
}
