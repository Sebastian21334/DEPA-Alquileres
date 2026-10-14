import { ANALISIS_FACIAL_REPOSITORY } from '../repository/analisis-facial.repository.interface';
import type {
  AnalisisRostro,
  IAnalisisFacialRepository,
} from '../repository/analisis-facial.repository.interface';
import {
  BadRequestException,
  Injectable,
  Inject,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'node:crypto';
import type { ArchivoSubido } from '../../common/interfaces/archivo-subido.interface';

export type AccionVitalidad =
  'TURN_LEFT' | 'TURN_RIGHT' | 'TILT_HEAD' | 'OPEN_MOUTH';

interface DesafioPayload {
  sub: number;
  scope: 'face-liveness-challenge';
  actions: AccionVitalidad[];
  jti: string;
}

interface VerificacionPayload {
  sub: number;
  scope: 'face-liveness-verified';
  livePhotoHash: string;
  jti: string;
}

const ACCIONES: ReadonlyArray<{ type: AccionVitalidad; label: string }> = [
  { type: 'TURN_LEFT', label: 'Girá la cabeza hacia la izquierda' },
  { type: 'TURN_RIGHT', label: 'Girá la cabeza hacia la derecha' },
  { type: 'TILT_HEAD', label: 'Incliná la cabeza hacia un costado' },
  { type: 'OPEN_MOUTH', label: 'Abrí la boca' },
];

@Injectable()
export class VerificacionFacialService {
  private readonly umbralCoincidencia = 0.6;

  constructor(
    private readonly jwtService: JwtService,
    @Inject(ANALISIS_FACIAL_REPOSITORY)
    private readonly analisis: IAnalisisFacialRepository,
  ) {}

  async crearDesafio(
    idUsuario: number,
    accionesAnteriores: AccionVitalidad[] = [],
  ) {
    let instructions: Array<{ type: AccionVitalidad; label: string }> = [];
    // Si el usuario pidió otros gestos, se entrega una secuencia distinta. El
    // backend sigue eligiéndola y firmándola: el cliente no puede inventarla.
    do {
      const acciones = ACCIONES.map((accion) => ({ ...accion }));
      for (let index = acciones.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [acciones[index], acciones[randomIndex]] = [
          acciones[randomIndex],
          acciones[index],
        ];
      }
      instructions = acciones.slice(0, 3);
    } while (
      accionesAnteriores.length === instructions.length &&
      instructions.every(
        ({ type }, index) => type === accionesAnteriores[index],
      )
    );
    const challengeToken = await this.jwtService.signAsync(
      {
        sub: idUsuario,
        scope: 'face-liveness-challenge',
        actions: instructions.map(({ type }) => type),
        jti: randomUUID(),
      } satisfies DesafioPayload,
      { expiresIn: '5m' },
    );
    return { challengeToken, instructions, expiresInSeconds: 300 };
  }

  async cambiarDesafio(idUsuario: number, challengeToken: string) {
    const anterior = await this.verificarToken<DesafioPayload>(
      challengeToken,
      'face-liveness-challenge',
      idUsuario,
    );
    return this.crearDesafio(idUsuario, anterior.actions);
  }

  async validarVitalidad(
    idUsuario: number,
    challengeToken: string,
    archivos: Record<string, ArchivoSubido[] | undefined> = {},
  ) {
    const payload = await this.verificarToken<DesafioPayload>(
      challengeToken,
      'face-liveness-challenge',
      idUsuario,
    );
    if (!Array.isArray(payload.actions) || payload.actions.length !== 3) {
      throw new BadRequestException(
        'El desafío facial no contiene una secuencia válida',
      );
    }

    const neutralPhoto = archivos.neutralPhoto?.[0];
    const livePhoto = archivos.livePhoto?.[0];
    const actionPhotos = payload.actions.map(
      (_, index) => archivos[`action${index}`]?.[0],
    );
    if (!neutralPhoto || !livePhoto || actionPhotos.some((foto) => !foto)) {
      throw new BadRequestException('Faltan capturas de la prueba de vida');
    }

    const neutral = await this.analisis.analizarRostro(
      neutralPhoto.buffer,
      'la captura neutral',
    );
    for (let index = 0; index < payload.actions.length; index++) {
      const evidencia = actionPhotos[index]!;
      const analisis = await this.analisis.analizarRostro(
        evidencia.buffer,
        `la evidencia del movimiento ${index + 1}`,
      );
      this.validarMismaPersona(neutral, analisis);
      this.validarAccion(payload.actions[index], neutral, analisis);
    }

    const live = await this.analisis.analizarRostro(
      livePhoto.buffer,
      'la captura facial final',
    );
    this.validarMismaPersona(neutral, live);
    if (
      Math.abs(live.yaw - neutral.yaw) > 0.08 ||
      Math.abs(live.roll - neutral.roll) > 0.16
    ) {
      throw new UnprocessableEntityException(
        'La captura final no está centrada. Posible causa: la cabeza quedó girada o inclinada; mirá de frente e intentá nuevamente.',
      );
    }

    const verificationToken = await this.jwtService.signAsync(
      {
        sub: idUsuario,
        scope: 'face-liveness-verified',
        livePhotoHash: this.hash(livePhoto.buffer),
        jti: randomUUID(),
      } satisfies VerificacionPayload,
      { expiresIn: '5m' },
    );
    return { valid: true, verificationToken };
  }

  async verificarCapturaAutorizada(
    idUsuario: number,
    verificationToken: string,
    livePhoto: Buffer,
  ): Promise<void> {
    const payload = await this.verificarToken<VerificacionPayload>(
      verificationToken,
      'face-liveness-verified',
      idUsuario,
    );
    if (payload.livePhotoHash !== this.hash(livePhoto)) {
      throw new BadRequestException(
        'La foto facial enviada no es la captura validada durante la prueba de vida.',
      );
    }
  }

  async compararConDocumento(documentPhoto: Buffer, livePhoto: Buffer) {
    const documento = await this.analisis.analizarRostro(
      documentPhoto,
      'el frente del DNI',
    );
    const captura = await this.analisis.analizarRostro(
      livePhoto,
      'la captura facial en vivo',
    );
    const distance = this.analisis.distancia(
      documento.descriptor,
      captura.descriptor,
    );
    return { match: distance <= this.umbralCoincidencia, distance };
  }

  private validarMismaPersona(
    referencia: AnalisisRostro,
    candidata: AnalisisRostro,
  ): void {
    const distance = this.analisis.distancia(
      referencia.descriptor,
      candidata.descriptor,
    );
    if (distance > this.umbralCoincidencia) {
      throw new UnprocessableEntityException(
        'La persona cambió durante la prueba. Posible causa: otra cara entró en cámara o la iluminación impide reconocerla.',
      );
    }
  }

  private validarAccion(
    accion: AccionVitalidad,
    neutral: AnalisisRostro,
    evidencia: AnalisisRostro,
  ): void {
    const yaw = evidencia.yaw - neutral.yaw;
    const roll = evidencia.roll - neutral.roll;
    const valida =
      accion === 'TURN_LEFT'
        ? yaw >= 0.06
        : accion === 'TURN_RIGHT'
          ? yaw <= -0.06
          : accion === 'TILT_HEAD'
            ? Math.abs(roll) >= 0.15
            : evidencia.aperturaBoca >= 0.16 &&
              evidencia.aperturaBoca >= neutral.aperturaBoca + 0.05;
    if (!valida) {
      const causa =
        accion === 'OPEN_MOUTH'
          ? 'la boca no se abrió lo suficiente'
          : 'el movimiento fue muy leve o se realizó hacia el lado contrario';
      throw new UnprocessableEntityException(
        `No se pudo confirmar la acción “${ACCIONES.find(({ type }) => type === accion)?.label}”. Posible causa: ${causa}.`,
      );
    }
  }

  private async verificarToken<T extends { sub: number; scope: string }>(
    token: string,
    scope: string,
    idUsuario: number,
  ): Promise<T> {
    if (!token)
      throw new BadRequestException(
        'Falta la autorización de la prueba de vida',
      );
    try {
      const payload = await this.jwtService.verifyAsync<T>(token);
      if (Number(payload.sub) !== idUsuario || payload.scope !== scope)
        throw new Error('invalid');
      return payload;
    } catch {
      throw new BadRequestException(
        'La prueba de vida es inválida o venció. Posible causa: pasaron más de cinco minutos; realizala nuevamente.',
      );
    }
  }

  private hash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }
}
