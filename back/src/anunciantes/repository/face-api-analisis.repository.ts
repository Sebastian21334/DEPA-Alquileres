import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as tf from '@tensorflow/tfjs';
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm';
import type { TNetInput } from '@vladmandic/face-api';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

import {
  AnalisisRostro,
  IAnalisisFacialRepository,
} from './analisis-facial.repository.interface';
type FaceApiModule =
  typeof import('@vladmandic/face-api/dist/face-api.node-wasm.js');

@Injectable()
export class FaceApiAnalisisRepository
  implements IAnalisisFacialRepository, OnModuleInit
{
  private readonly logger = new Logger(FaceApiAnalisisRepository.name);
  private faceApi!: FaceApiModule;
  async onModuleInit(): Promise<void> {
    this.configurarWasm();
    if (!(await tf.setBackend('wasm'))) {
      throw new Error('No se pudo inicializar TensorFlow WASM');
    }
    await tf.ready();

    const imported =
      (await import('@vladmandic/face-api/dist/face-api.node-wasm.js')) as unknown as FaceApiModule & {
        default?: FaceApiModule;
      };
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
    if (process.env.FACE_DEBUG === '1') {
      this.logger.warn(
        `FACE_DEBUG activo: los frames analizados se guardan en ${join(tmpdir(), 'opencode', 'face-debug')}`,
      );
    }
  }

  distancia(referencia: Float32Array, candidata: Float32Array): number {
    return this.faceApi.euclideanDistance(referencia, candidata);
  }
  async analizarRostro(
    buffer: Buffer,
    nombre: string,
  ): Promise<AnalisisRostro> {
    this.volcarDebug(buffer, nombre);
    let tensor: tf.Tensor3D;
    try {
      tensor = this.decodificarImagen(buffer);
    } catch {
      throw new BadRequestException(
        `No se pudo leer ${nombre} como una imagen JPG o PNG`,
      );
    }

    try {
      const detecciones = await this.faceApi
        .detectAllFaces(tensor as unknown as TNetInput)
        .withFaceLandmarks()
        .withFaceDescriptors();
      if (detecciones.length !== 1) {
        this.logger.warn(
          `Detecciones en ${nombre}: ${detecciones.length} (${tensor.shape[1]}x${tensor.shape[0]})`,
        );
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

  private decodificarImagen(buffer: Buffer): tf.Tensor3D {
    const png =
      buffer.length >= 8 &&
      buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const jpg =
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff;
    if (!png && !jpg) throw new Error('Formato no soportado');
    const decoded = png
      ? PNG.sync.read(buffer)
      : jpeg.decode(buffer, { useTArray: true, formatAsRGBA: false });
    const pixels = decoded.width * decoded.height;
    const channels = decoded.data.length / pixels;
    const rgb =
      channels === 3
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

  private volcarDebug(buffer: Buffer, nombre: string): void {
    if (process.env.FACE_DEBUG !== '1') return;
    try {
      const directorio = join(tmpdir(), 'opencode', 'face-debug');
      mkdirSync(directorio, { recursive: true });
      const seguro = nombre
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_.-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      writeFileSync(
        join(directorio, `${Date.now()}-${seguro || 'frame'}.jpg`),
        buffer,
      );
    } catch (error) {
      this.logger.warn(
        `No se pudo guardar el frame de depuración: ${(error as Error).message}`,
      );
    }
  }

  private configurarWasm(): void {
    const require = createRequire(__filename);
    const packagePath =
      require.resolve('@tensorflow/tfjs-backend-wasm/package.json');
    const dist = join(dirname(packagePath), 'dist');
    setWasmPaths({
      'tfjs-backend-wasm.wasm': join(dist, 'tfjs-backend-wasm.wasm'),
      'tfjs-backend-wasm-simd.wasm': join(dist, 'tfjs-backend-wasm-simd.wasm'),
      'tfjs-backend-wasm-threaded-simd.wasm': join(
        dist,
        'tfjs-backend-wasm-threaded-simd.wasm',
      ),
    });
  }
}
