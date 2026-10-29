import {
  type IVerificacionRepository,
  VERIFICACION_REPOSITORY,
} from '../repository/verificacion.repository.interface';
import {
  type AnalisisRostro,
  type IAnalisisFacialRepository,
  ANALISIS_FACIAL_REPOSITORY,
} from '../repository/analisis-facial.repository.interface';
import {
  Inject,
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'node:crypto';

import type { SolicitudVerificacion } from '../entity/solicitud-verificacion.entity';

export type AccionVitalidad =
  'TURN_LEFT' | 'TURN_RIGHT' | 'TILT_HEAD' | 'OPEN_MOUTH';

interface DesafioPayload {
  sub: number;
  scope: 'face-liveness-challenge';
  actions: AccionVitalidad[];
  jti: string;
  solicitudId: number;
  revision: number;
}

interface VerificacionPayload {
  sub: number;
  scope: 'face-liveness-verified';
  livePhotoHash: string;
  jti: string;
  solicitudId: number;
  revision: number;
}

const ACCIONES: ReadonlyArray<{ type: AccionVitalidad; label: string }> = [
  { type: 'TURN_LEFT', label: 'Girá la cabeza hacia la izquierda' },
  { type: 'TURN_RIGHT', label: 'Girá la cabeza hacia la derecha' },
  { type: 'TILT_HEAD', label: 'Incliná la cabeza hacia un costado' },
  { type: 'OPEN_MOUTH', label: 'Abrí la boca' },
];

// El desafío dura diez minutos: alcanza para calibrar, repetir un gesto y
// volver a capturar sin obligar a reiniciar todo el trámite.
const DURACION_DESAFIO_SEGUNDOS = 10 * 60;

@Injectable()
export class PruebaVidaService {
  private readonly logger = new Logger(PruebaVidaService.name);
  private readonly umbralCoincidencia = 0.6;

  constructor(
    private readonly jwtService: JwtService,
    @Inject(ANALISIS_FACIAL_REPOSITORY)
    private readonly analisis: IAnalisisFacialRepository,
    @Inject(VERIFICACION_REPOSITORY)
    private readonly verificaciones: IVerificacionRepository,
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
    const challengeToken = await this.verificaciones.conSolicitudBloqueada(
      idUsuario,
      async (solicitud, persistencia) => {
        if (
          !solicitud ||
          !solicitud.puedeRecibirDocumentos(solicitud.estaRechazada())
        ) {
          throw new ConflictException(
            'La solicitud no admite una nueva prueba de vida',
          );
        }
        const jti = randomUUID();
        const token = await this.jwtService.signAsync(
          {
            sub: idUsuario,
            scope: 'face-liveness-challenge',
            actions: instructions.map(({ type }) => type),
            jti,
            solicitudId: solicitud.id,
            revision: solicitud.revisionParaPresentacion(),
          } satisfies DesafioPayload,
          { expiresIn: '10m' },
        );
        solicitud.iniciarPruebaVida(jti);
        await persistencia.guardarSolicitud(solicitud);
        return token;
      },
    );
    return {
      challengeToken,
      instructions,
      expiresInSeconds: DURACION_DESAFIO_SEGUNDOS,
    };
  }

  async cambiarDesafio(idUsuario: number, challengeToken: string) {
    const anterior = await this.leerDesafioParaCambio(
      challengeToken,
      idUsuario,
    );
    // Si el desafío anterior venció, se emite uno nuevo. El usuario ya está
    // autenticado por JWT, así que no hace falta obligarlo a reiniciar el flujo.
    return this.crearDesafio(idUsuario, anterior?.actions ?? []);
  }

  /**
   * Recupera el desafío anterior solo si sigue siendo válido y pertenece al
   * usuario. Un token vencido no es un error para "cambiar gestos": se emite
   * uno nuevo. Un token válido de otro usuario sí se rechaza.
   */
  private async leerDesafioParaCambio(
    challengeToken: string,
    idUsuario: number,
  ): Promise<DesafioPayload | null> {
    if (!challengeToken) return null;
    try {
      const payload =
        await this.jwtService.verifyAsync<DesafioPayload>(challengeToken);
      if (
        Number(payload.sub) !== idUsuario ||
        payload.scope !== 'face-liveness-challenge' ||
        !Array.isArray(payload.actions) ||
        payload.actions.length !== 3
      ) {
        throw new BadRequestException(
          'La prueba de vida es inválida o venció. Posible causa: pasó demasiado tiempo o la sesión cambió; realizala nuevamente.',
        );
      }
      return payload;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      if ((error as { name?: string }).name === 'TokenExpiredError') {
        this.logger.warn(
          `El desafío facial del usuario ${idUsuario} venció; se emite uno nuevo.`,
        );
        return null;
      }
      throw new BadRequestException(
        'La prueba de vida es inválida o venció. Posible causa: pasó demasiado tiempo o la sesión cambió; realizala nuevamente.',
      );
    }
  }

  async validarVitalidad(
    idUsuario: number,
    challengeToken: string,
    archivos: Record<string, Express.Multer.File[] | undefined> = {},
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
    await this.verificaciones.conSolicitudBloqueada(
      idUsuario,
      async (solicitud) => {
        this.verificarDesafioActual(solicitud, payload);
      },
    );

    const neutralPhoto = archivos.neutralPhoto?.[0];
    const livePhoto = archivos.livePhoto?.[0];
    // Cada acción puede llegar con hasta dos capturas tomadas con pocos
    // milisegundos de diferencia. Se acepta la primera que valide, así un
    // frame tomado justo cuando el gesto empezaba a bajar no invalida toda la prueba.
    const actionPhotos = payload.actions.map(
      (_, index) => archivos[`action${index}`] ?? [],
    );
    if (
      !neutralPhoto ||
      !livePhoto ||
      actionPhotos.some((fotos) => fotos.length === 0)
    ) {
      throw new BadRequestException('Faltan capturas de la prueba de vida');
    }

    const neutral = await this.analisis.analizarRostro(
      neutralPhoto.buffer,
      'la captura neutral',
    );
    for (let index = 0; index < payload.actions.length; index++) {
      const accion = payload.actions[index];
      const evidencias = actionPhotos[index];
      let validada = false;
      let ultimoError: Error | null = null;

      for (const [frameIndex, evidencia] of evidencias.entries()) {
        try {
          const analisis = await this.analisis.analizarRostro(
            evidencia.buffer,
            `la evidencia del movimiento ${index + 1} (${accion}), captura ${frameIndex + 1}`,
          );
          this.validarMismaPersona(neutral, analisis);
          this.validarAccion(accion, neutral, analisis);
          validada = true;
          break;
        } catch (error) {
          ultimoError = error as Error;
          this.logger.debug(
            `Movimiento ${index + 1} (${accion}), captura ${frameIndex + 1} rechazada: ${(error as Error).message}`,
          );
        }
      }

      if (!validada) {
        this.logger.warn(
          `No se pudo validar el movimiento ${index + 1} (${accion}) con ${evidencias.length} captura(s): ${ultimoError?.message ?? 'sin detalle'}`,
        );
        throw (
          ultimoError ??
          new UnprocessableEntityException(
            `No se pudo validar la acción “${ACCIONES.find(({ type }) => type === accion)?.label}”.`,
          )
        );
      }
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

    // El análisis no prolonga la vigencia del desafío original.
    await this.verificarToken<DesafioPayload>(
      challengeToken,
      'face-liveness-challenge',
      idUsuario,
    );
    const livePhotoHash = this.hash(livePhoto.buffer);
    const verificationToken = await this.jwtService.signAsync(
      {
        sub: idUsuario,
        scope: 'face-liveness-verified',
        livePhotoHash,
        jti: payload.jti,
        solicitudId: payload.solicitudId,
        revision: payload.revision,
      } satisfies VerificacionPayload,
      { expiresIn: '5m' },
    );
    await this.verificaciones.conSolicitudBloqueada(
      idUsuario,
      async (solicitud, persistencia) => {
        // Otra validación o un cambio de gestos no puede reutilizar el desafío.
        this.verificarDesafioActual(solicitud, payload);
        solicitud.validarPruebaVida(livePhotoHash);
        await persistencia.guardarSolicitud(solicitud);
      },
    );
    return { valid: true, verificationToken };
  }

  async verificarCapturaAutorizada(
    idUsuario: number,
    verificationToken: string,
    livePhoto: Buffer,
  ): Promise<VerificacionPayload> {
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
    return payload;
  }

  private verificarDesafioActual(
    solicitud: SolicitudVerificacion | null,
    payload: DesafioPayload,
  ): asserts solicitud is SolicitudVerificacion {
    if (
      !solicitud ||
      solicitud.id !== payload.solicitudId ||
      !solicitud.desafioPruebaVidaVigente(payload.jti, payload.revision)
    ) {
      throw new BadRequestException(
        'El desafío de prueba de vida ya fue utilizado o reemplazado',
      );
    }
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
    // Los umbrales son algo más tolerantes que los del front (0.07 / 0.18 /
    // 0.45) porque face-api mide con otros landmarks y el frame capturado
    // puede tener menos recorrido que el que vio MediaPipe.
    const yaw = evidencia.yaw - neutral.yaw;
    const roll = evidencia.roll - neutral.roll;
    const valida =
      accion === 'TURN_LEFT'
        ? yaw >= 0.05
        : accion === 'TURN_RIGHT'
          ? yaw <= -0.05
          : accion === 'TILT_HEAD'
            ? Math.abs(roll) >= 0.1
            : evidencia.aperturaBoca >= 0.12 &&
              evidencia.aperturaBoca >= neutral.aperturaBoca + 0.03;
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

  private async verificarToken<
    T extends {
      sub: number;
      scope: string;
      jti: string;
      solicitudId: number;
      revision: number;
    },
  >(token: string, scope: string, idUsuario: number): Promise<T> {
    if (!token)
      throw new BadRequestException(
        'Falta la autorización de la prueba de vida',
      );
    try {
      const payload = await this.jwtService.verifyAsync<T>(token);
      if (
        Number(payload.sub) !== idUsuario ||
        payload.scope !== scope ||
        typeof payload.jti !== 'string' ||
        !payload.jti ||
        !Number.isSafeInteger(payload.solicitudId) ||
        payload.solicitudId < 1 ||
        !Number.isSafeInteger(payload.revision) ||
        payload.revision < 1
      )
        throw new Error('invalid');
      return payload;
    } catch {
      throw new BadRequestException(
        'La prueba de vida es inválida o venció. Posible causa: pasó demasiado tiempo o la sesión cambió; realizala nuevamente.',
      );
    }
  }

  private hash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }
}
