import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as tf from '@tensorflow/tfjs';
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm';
import type { TNetInput } from '@vladmandic/face-api';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';
import type { ArchivoSubido } from '../../common/interfaces/archivo-subido.interface';

export type AccionVitalidad = 'TURN_LEFT' | 'TURN_RIGHT' | 'TILT_HEAD' | 'OPEN_MOUTH';

type FaceApiModule = typeof import('@vladmandic/face-api/dist/face-api.node-wasm.js');

interface AnalisisRostro {
  descriptor: Float32Array;
  yaw: number;
  roll: number;
  aperturaBoca: number;
}

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
export class VerificacionFacialService implements OnModuleInit {
  private readonly logger = new Logger(VerificacionFacialService.name);
  private readonly umbralCoincidencia = 0.6;
  private faceApi!: FaceApiModule;

  constructor(private readonly jwtService: JwtService) {}

  async onModuleInit(): Promise<void> {
    this.configurarWasm();
    if (!(await tf.setBackend('wasm'))) {
      throw new Error('No se pudo inicializar TensorFlow WASM');
    }
    await tf.ready();

    const imported = (await import(
      '@vladmandic/face-api/dist/face-api.node-wasm.js'
    )) as unknown as FaceApiModule & { default?: FaceApiModule };
    this.faceApi = imported.default ?? imported;

    const modelsPath = join(process.cwd(), 'dist', 'models');
    const fallbackPath = join(process.cwd(), 'src', 'models');
    const resolvedPath = existsSync(modelsPath) ? modelsPath : fallbackPath;
    await Promise.all([
      this.faceApi.nets.ssdMobilenetv1.loadFromDisk(resolvedPath),
      this.faceApi.nets.faceLandmark68Net.loadFromDisk(resolvedPath),
      this.faceApi.nets.faceRecognitionNet.loadFromDisk(resolvedPath),
    ]);
    this.logger.log(`Modelos faciales cargados desde ${resolvedPath}`);
  }

  async crearDesafio(idUsuario: number, accionesAnteriores: AccionVitalidad[] = []) {
    let instructions: Array<{ type: AccionVitalidad; label: string }> = [];
    // Si el usuario pidió otros gestos, se entrega una secuencia distinta. El
    // backend sigue eligiéndola y firmándola: el cliente no puede inventarla.
    do {
      const acciones = ACCIONES.map((accion) => ({ ...accion }));
      for (let index = acciones.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [acciones[index], acciones[randomIndex]] = [acciones[randomIndex], acciones[index]];
      }
      instructions = acciones.slice(0, 3);
    } while (
      accionesAnteriores.length === instructions.length &&
      instructions.every(({ type }, index) => type === accionesAnteriores[index])
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
    archivos: Record<string, ArchivoSubido[] | undefined>,
  ) {
    const payload = await this.verificarToken<DesafioPayload>(
      challengeToken,
      'face-liveness-challenge',
      idUsuario,
    );
    if (!Array.isArray(payload.actions) || payload.actions.length !== 3) {
      throw new BadRequestException('El desafío facial no contiene una secuencia válida');
    }

    const neutralPhoto = archivos.neutralPhoto?.[0];
    const livePhoto = archivos.livePhoto?.[0];
    const actionPhotos = payload.actions.map((_, index) => archivos[`action${index}`]?.[0]);
    if (!neutralPhoto || !livePhoto || actionPhotos.some((foto) => !foto)) {
      throw new BadRequestException('Faltan capturas de la prueba de vida');
    }

    const neutral = await this.analizarRostro(neutralPhoto.buffer, 'la captura neutral');
    for (let index = 0; index < payload.actions.length; index++) {
      const evidencia = actionPhotos[index]!;
      const analisis = await this.analizarRostro(
        evidencia.buffer,
        `la evidencia del movimiento ${index + 1}`,
      );
      this.validarMismaPersona(neutral, analisis);
      this.validarAccion(payload.actions[index], neutral, analisis);
    }

    const live = await this.analizarRostro(livePhoto.buffer, 'la captura facial final');
    this.validarMismaPersona(neutral, live);
    if (Math.abs(live.yaw - neutral.yaw) > 0.08 || Math.abs(live.roll - neutral.roll) > 0.16) {
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
    const documento = await this.analizarRostro(documentPhoto, 'el frente del DNI');
    const captura = await this.analizarRostro(livePhoto, 'la captura facial en vivo');
    const distance = this.faceApi.euclideanDistance(documento.descriptor, captura.descriptor);
    return { match: distance <= this.umbralCoincidencia, distance };
  }

  private validarMismaPersona(referencia: AnalisisRostro, candidata: AnalisisRostro): void {
    const distance = this.faceApi.euclideanDistance(referencia.descriptor, candidata.descriptor);
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

  private async analizarRostro(buffer: Buffer, nombre: string): Promise<AnalisisRostro> {
    let tensor: tf.Tensor3D;
    try {
      tensor = this.decodificarImagen(buffer);
    } catch {
      throw new BadRequestException(`No se pudo leer ${nombre} como una imagen JPG o PNG`);
    }

    try {
      const detecciones = await this.faceApi
        .detectAllFaces(tensor as unknown as TNetInput)
        .withFaceLandmarks()
        .withFaceDescriptors();
      if (detecciones.length !== 1) {
        throw new UnprocessableEntityException(
          detecciones.length === 0
            ? `No se detectó una cara en ${nombre}. Posible causa: poca luz, desenfoque o rostro fuera del recuadro.`
            : `Se detectó más de una cara en ${nombre}. Debe aparecer una sola persona.`,
        );
      }

      const deteccion = detecciones[0];
      const jaw = deteccion.landmarks.getJawOutline();
      const nose = deteccion.landmarks.getNose();
      const leftEye = deteccion.landmarks.getLeftEye();
      const rightEye = deteccion.landmarks.getRightEye();
      const mouth = deteccion.landmarks.getMouth();
      const faceWidth = Math.max(1, Math.abs(jaw[16].x - jaw[0].x));
      const faceCenterX = (jaw[0].x + jaw[16].x) / 2;
      const eyeCenter = (eye: Array<{ x: number; y: number }>) => ({
        x: eye.reduce((sum, point) => sum + point.x, 0) / eye.length,
        y: eye.reduce((sum, point) => sum + point.y, 0) / eye.length,
      });
      const left = eyeCenter(leftEye);
      const right = eyeCenter(rightEye);
      const mouthWidth = Math.max(1, Math.abs(mouth[6].x - mouth[0].x));

      return {
        descriptor: deteccion.descriptor,
        yaw: (nose[3].x - faceCenterX) / faceWidth,
        roll: Math.atan2(right.y - left.y, right.x - left.x),
        aperturaBoca: Math.abs(mouth[18].y - mouth[14].y) / mouthWidth,
      };
    } finally {
      tensor.dispose();
    }
  }

  private async verificarToken<T extends { sub: number; scope: string }>(
    token: string,
    scope: string,
    idUsuario: number,
  ): Promise<T> {
    if (!token) throw new BadRequestException('Falta la autorización de la prueba de vida');
    try {
      const payload = await this.jwtService.verifyAsync<T>(token);
      if (Number(payload.sub) !== idUsuario || payload.scope !== scope) throw new Error('invalid');
      return payload;
    } catch {
      throw new BadRequestException(
        'La prueba de vida es inválida o venció. Posible causa: pasaron más de cinco minutos; realizala nuevamente.',
      );
    }
  }

  private decodificarImagen(buffer: Buffer): tf.Tensor3D {
    const png = buffer.length >= 8 && buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
    const jpg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    if (!png && !jpg) throw new Error('Formato no soportado');
    const decoded = png
      ? PNG.sync.read(buffer)
      : jpeg.decode(buffer, { useTArray: true, formatAsRGBA: false });
    const pixels = decoded.width * decoded.height;
    const channels = decoded.data.length / pixels;
    const rgb = channels === 3
      ? decoded.data
      : Uint8Array.from(
          Array.from({ length: pixels }, (_, index) => [
            decoded.data[index * 4],
            decoded.data[index * 4 + 1],
            decoded.data[index * 4 + 2],
          ]).flat(),
        );
    return tf.tensor3d(rgb, [decoded.height, decoded.width, 3], 'int32');
  }

  private configurarWasm(): void {
    const require = createRequire(__filename);
    const packagePath = require.resolve('@tensorflow/tfjs-backend-wasm/package.json');
    const dist = join(dirname(packagePath), 'dist');
    setWasmPaths({
      'tfjs-backend-wasm.wasm': join(dist, 'tfjs-backend-wasm.wasm'),
      'tfjs-backend-wasm-simd.wasm': join(dist, 'tfjs-backend-wasm-simd.wasm'),
      'tfjs-backend-wasm-threaded-simd.wasm': join(dist, 'tfjs-backend-wasm-threaded-simd.wasm'),
    });
  }

  private hash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }
}
