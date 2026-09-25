import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FaceLandmarker,
  FaceLandmarkerResult,
  FilesetResolver,
  NormalizedLandmark,
} from '@mediapipe/tasks-vision';
import { firstValueFrom } from 'rxjs';
import {
  AccionVitalidad,
  DesafioVitalidad,
  VerificacionFacialService,
} from '../../../shared/services/verificacion-facial.service';

export interface IdentidadCapturada {
  dni_frente: File;
  dni_dorso: File;
  rostro: File;
  verificationToken: string;
}

type PasoCaptura = 'dni_frente' | 'dni_dorso' | 'liveness' | 'complete';
type FaseVitalidad = 'idle' | 'calibrating' | 'actions' | 'centering' | 'validating' | 'complete';

interface HeadPose {
  yaw: number;
  roll: number;
}

const REQUIRED_FRAMES = 8;
const CALIBRATION_FRAMES = 12;

@Component({
  selector: 'app-captura-identidad',
  standalone: true,
  imports: [],
  templateUrl: './captura-identidad.component.html',
  styleUrl: './captura-identidad.component.scss',
})
export class CapturaIdentidadComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video', { static: true }) private readonly videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlay', { static: true }) private readonly overlayRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('capture', { static: true }) private readonly captureRef!: ElementRef<HTMLCanvasElement>;

  @Output() readonly identidadValidada = new EventEmitter<IdentidadCapturada>();
  @Output() readonly fallo = new EventEmitter<string>();

  private readonly facialService = inject(VerificacionFacialService);

  protected readonly paso = signal<PasoCaptura>('dni_frente');
  protected readonly fase = signal<FaseVitalidad>('idle');
  protected readonly cameraReady = signal(false);
  protected readonly procesando = signal(false);
  protected readonly mensaje = signal('Colocá el frente del DNI dentro del recuadro.');
  protected readonly error = signal('');
  protected readonly frentePreview = signal('');
  protected readonly dorsoPreview = signal('');
  protected readonly instrucciones = signal<DesafioVitalidad['instructions']>([]);
  protected readonly indiceInstruccion = signal(0);
  protected readonly instruccionActual = computed(
    () => this.instrucciones()[this.indiceInstruccion()] ?? null,
  );

  private frente: File | null = null;
  private dorso: File | null = null;
  private neutralPhoto: File | null = null;
  private livePhoto: File | null = null;
  private actionPhotos: File[] = [];
  private challengeToken = '';
  private stream: MediaStream | null = null;
  private faceLandmarker: FaceLandmarker | null = null;
  private animationFrameId: number | null = null;
  private lastVideoTime = -1;
  private destroyed = false;
  private busyFrame = false;
  private matchingFrames = 0;
  private neutralPose: HeadPose | null = null;
  private calibrationYaw = 0;
  private calibrationRoll = 0;
  private calibrationCount = 0;

  ngAfterViewInit(): void {
    void this.startCamera('environment').catch(() => undefined);
    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
    this.stopCamera();
    this.faceLandmarker?.close();
    this.revokePreview(this.frentePreview());
    this.revokePreview(this.dorsoPreview());
  }

  protected async capturarDocumento(): Promise<void> {
    if (!this.cameraReady() || this.procesando()) return;
    this.procesando.set(true);
    this.error.set('');
    try {
      const campo = this.paso();
      const foto = await this.captureFrame(`${campo}-${Date.now()}.jpg`);
      if (campo === 'dni_frente') {
        this.frente = foto;
        this.setPreview(this.frentePreview, foto);
        this.paso.set('dni_dorso');
        this.mensaje.set('Ahora colocá el dorso del DNI dentro del recuadro.');
      } else if (campo === 'dni_dorso') {
        this.dorso = foto;
        this.setPreview(this.dorsoPreview, foto);
        await this.iniciarPruebaFacial();
      }
    } catch (error: unknown) {
      this.showError(this.errorText(error));
    } finally {
      this.procesando.set(false);
    }
  }

  protected async reiniciar(): Promise<void> {
    this.frente = null;
    this.dorso = null;
    this.neutralPhoto = null;
    this.livePhoto = null;
    this.actionPhotos = [];
    this.challengeToken = '';
    this.neutralPose = null;
    this.matchingFrames = 0;
    this.calibrationYaw = 0;
    this.calibrationRoll = 0;
    this.calibrationCount = 0;
    this.indiceInstruccion.set(0);
    this.instrucciones.set([]);
    this.fase.set('idle');
    this.paso.set('dni_frente');
    this.error.set('');
    this.mensaje.set('Colocá el frente del DNI dentro del recuadro.');
    this.revokePreview(this.frentePreview());
    this.revokePreview(this.dorsoPreview());
    this.frentePreview.set('');
    this.dorsoPreview.set('');
    await this.startCamera('environment').catch(() => undefined);
  }

  private async iniciarPruebaFacial(): Promise<void> {
    this.paso.set('liveness');
    this.fase.set('calibrating');
    this.mensaje.set('Preparando la prueba de vida…');
    const [challenge] = await Promise.all([
      firstValueFrom(this.facialService.crearDesafio()),
      this.initializeFaceLandmarker(),
      this.startCamera('user'),
    ]);
    this.challengeToken = challenge.challengeToken;
    this.instrucciones.set(challenge.instructions);
    this.mensaje.set('Mirá de frente y mantené la cabeza quieta para calibrar.');
  }

  private async initializeFaceLandmarker(): Promise<void> {
    if (this.faceLandmarker) return;
    const vision = await FilesetResolver.forVisionTasks('/assets/wasm');
    this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: '/assets/face_landmarker.task', delegate: 'GPU' },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFaceBlendshapes: true,
    });
  }

  private async startCamera(facingMode: 'user' | 'environment'): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Este navegador no permite acceder a la cámara.');
    this.stopCamera();
    this.cameraReady.set(false);
    this.lastVideoTime = -1;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      const video = this.videoRef.nativeElement;
      video.srcObject = this.stream;
      await video.play();
      this.resizeOverlay();
      this.cameraReady.set(true);
    } catch (error: unknown) {
      const message = error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'Necesitamos permiso de cámara para tomar las fotos en el momento. Habilitalo y volvé a intentar.'
        : `No se pudo iniciar la cámara: ${this.errorText(error)}`;
      this.showError(message);
      throw error;
    }
  }

  private stopCamera(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }

  private readonly renderLoop = (): void => {
    if (this.destroyed) return;
    const video = this.videoRef.nativeElement;
    const canvas = this.overlayRef.nativeElement;
    const context = canvas.getContext('2d');
    if (context && this.cameraReady() && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      this.resizeOverlay();
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (this.paso() !== 'liveness') {
        this.drawDocumentGuide(context);
      } else if (this.faceLandmarker && video.currentTime !== this.lastVideoTime) {
        try {
          const result = this.faceLandmarker.detectForVideo(video, performance.now());
          this.lastVideoTime = video.currentTime;
          void this.processLiveness(result);
          this.drawFaceGuide(context, result.faceLandmarks.length === 1);
        } catch (error: unknown) {
          this.showError(`No se pudo analizar la cámara: ${this.errorText(error)}`);
        }
      }
    }
    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  };

  private async processLiveness(result: FaceLandmarkerResult): Promise<void> {
    if (this.busyFrame || ['idle', 'validating', 'complete'].includes(this.fase())) return;
    const landmarks = result.faceLandmarks[0];
    const blendshapes = result.faceBlendshapes[0];
    if (!landmarks || !blendshapes) {
      this.matchingFrames = 0;
      this.mensaje.set('Ubicá una sola cara dentro del óvalo.');
      return;
    }
    const pose = this.calculateHeadPose(landmarks);
    if (!pose) return;

    if (this.fase() === 'calibrating') {
      this.calibrationYaw += pose.yaw;
      this.calibrationRoll += pose.roll;
      this.calibrationCount++;
      if (this.calibrationCount >= CALIBRATION_FRAMES) {
        this.neutralPose = {
          yaw: this.calibrationYaw / this.calibrationCount,
          roll: this.calibrationRoll / this.calibrationCount,
        };
        this.busyFrame = true;
        try {
          this.neutralPhoto = await this.captureFrame(`neutral-${Date.now()}.jpg`);
          this.fase.set('actions');
          this.mensaje.set(this.instruccionActual()?.label ?? 'Seguí la instrucción.');
        } finally {
          this.busyFrame = false;
        }
      }
      return;
    }

    if (this.fase() === 'centering') {
      const centered = this.neutralPose &&
        Math.abs(pose.yaw - this.neutralPose.yaw) <= 0.045 &&
        Math.abs(pose.roll - this.neutralPose.roll) <= 0.1;
      this.matchingFrames = centered ? this.matchingFrames + 1 : 0;
      this.mensaje.set(centered ? 'Perfecto, mantenete quieto…' : 'Volvé a mirar de frente y centrá la cara.');
      if (this.matchingFrames >= REQUIRED_FRAMES) await this.finalizeLiveness();
      return;
    }

    const scores = new Map(blendshapes.categories.map(({ categoryName, score }) => [categoryName, score]));
    const detected = this.isActionDetected(this.instruccionActual()?.type ?? null, pose, scores);
    this.matchingFrames = detected ? this.matchingFrames + 1 : 0;
    this.mensaje.set(detected ? 'Bien, mantené el movimiento…' : (this.instruccionActual()?.label ?? 'Seguí la instrucción.'));
    if (this.matchingFrames >= REQUIRED_FRAMES) await this.completeAction();
  }

  private async completeAction(): Promise<void> {
    if (this.busyFrame) return;
    this.busyFrame = true;
    try {
      this.actionPhotos.push(await this.captureFrame(`movimiento-${this.indiceInstruccion() + 1}.jpg`));
      this.matchingFrames = 0;
      if (this.indiceInstruccion() === this.instrucciones().length - 1) {
        this.fase.set('centering');
        this.mensaje.set('Movimientos completos. Volvé a mirar de frente.');
      } else {
        this.indiceInstruccion.update((index) => index + 1);
        this.mensaje.set(this.instruccionActual()?.label ?? 'Seguí la nueva instrucción.');
      }
    } finally {
      this.busyFrame = false;
    }
  }

  private async finalizeLiveness(): Promise<void> {
    if (this.busyFrame || !this.frente || !this.dorso || !this.neutralPhoto) return;
    this.busyFrame = true;
    this.fase.set('validating');
    this.procesando.set(true);
    this.mensaje.set('Validando movimientos y rostro…');
    try {
      this.livePhoto = await this.captureFrame(`rostro-en-vivo-${Date.now()}.jpg`);
      const response = await firstValueFrom(
        this.facialService.validarVitalidad(this.challengeToken, this.neutralPhoto, this.actionPhotos, this.livePhoto),
      );
      this.fase.set('complete');
      this.paso.set('complete');
      this.mensaje.set('Identidad validada. Enviando la documentación…');
      this.stopCamera();
      this.identidadValidada.emit({
        dni_frente: this.frente,
        dni_dorso: this.dorso,
        rostro: this.livePhoto,
        verificationToken: response.verificationToken,
      });
    } catch (error: unknown) {
      this.fase.set('idle');
      this.showError(this.errorText(error));
    } finally {
      this.procesando.set(false);
      this.busyFrame = false;
    }
  }

  private isActionDetected(action: AccionVitalidad | null, pose: HeadPose, scores: ReadonlyMap<string, number>): boolean {
    if (!action || !this.neutralPose) return false;
    const yaw = pose.yaw - this.neutralPose.yaw;
    const roll = pose.roll - this.neutralPose.roll;
    if (action === 'TURN_LEFT') return yaw >= 0.07;
    if (action === 'TURN_RIGHT') return yaw <= -0.07;
    if (action === 'TILT_HEAD') return Math.abs(roll) >= 0.18;
    return (scores.get('jawOpen') ?? 0) >= 0.45;
  }

  private calculateHeadPose(landmarks: NormalizedLandmark[]): HeadPose | null {
    const nose = landmarks[1];
    const leftSide = landmarks[234];
    const rightSide = landmarks[454];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    if (!nose || !leftSide || !rightSide || !leftEye || !rightEye) return null;
    const width = Math.abs(rightSide.x - leftSide.x);
    if (width < 0.01) return null;
    return {
      yaw: (nose.x - (leftSide.x + rightSide.x) / 2) / width,
      roll: Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x),
    };
  }

  private drawDocumentGuide(context: CanvasRenderingContext2D): void {
    const { width, height } = context.canvas;
    const boxWidth = width * 0.72;
    const boxHeight = boxWidth / 1.586;
    context.strokeStyle = '#ff9800';
    context.lineWidth = Math.max(4, width / 150);
    context.setLineDash([14, 9]);
    context.strokeRect((width - boxWidth) / 2, (height - boxHeight) / 2, boxWidth, boxHeight);
    context.setLineDash([]);
    this.drawLabel(context, this.paso() === 'dni_frente' ? 'DNI — FRENTE' : 'DNI — DORSO');
  }

  private drawFaceGuide(context: CanvasRenderingContext2D, detected: boolean): void {
    const { width, height } = context.canvas;
    context.strokeStyle = detected ? '#22c55e' : '#ff9800';
    context.lineWidth = Math.max(4, width / 150);
    context.setLineDash([14, 9]);
    context.beginPath();
    context.ellipse(width / 2, height * 0.53, width * 0.2, height * 0.36, 0, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);
    const label = this.fase() === 'centering'
      ? 'MIRÁ DE FRENTE'
      : this.instruccionActual()?.label.toUpperCase() ?? 'UBICÁ TU CARA';
    this.drawLabel(context, label);
    if (detected && this.fase() === 'actions') this.drawActionArrow(context, this.instruccionActual()?.type ?? null);
  }

  private drawLabel(context: CanvasRenderingContext2D, text: string): void {
    const { width, height } = context.canvas;
    context.font = `700 ${Math.max(18, width / 31)}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = 'rgba(10, 18, 28, 0.78)';
    context.fillRect(width * 0.08, height * 0.05, width * 0.84, height * 0.1);
    context.fillStyle = '#fff';
    context.fillText(text, width / 2, height * 0.1, width * 0.78);
  }

  private drawActionArrow(context: CanvasRenderingContext2D, action: AccionVitalidad | null): void {
    const { width, height } = context.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    if (action === 'OPEN_MOUTH') {
      context.strokeStyle = '#22c55e';
      context.lineWidth = Math.max(5, width / 110);
      context.beginPath();
      context.ellipse(centerX, centerY + height * 0.18, width * 0.045, height * 0.055, 0, 0, Math.PI * 2);
      context.stroke();
      return;
    }
    if (action === 'TURN_LEFT') this.arrow(context, centerX + width * 0.2, centerY, centerX - width * 0.2, centerY);
    if (action === 'TURN_RIGHT') this.arrow(context, centerX - width * 0.2, centerY, centerX + width * 0.2, centerY);
    if (action === 'TILT_HEAD') this.arrow(context, centerX - width * 0.15, centerY + height * 0.14, centerX + width * 0.15, centerY - height * 0.14);
  }

  private arrow(context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const head = Math.max(18, context.canvas.width / 23);
    context.strokeStyle = '#22c55e';
    context.lineWidth = Math.max(5, context.canvas.width / 100);
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
    context.moveTo(x2, y2);
    context.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
    context.stroke();
  }

  private resizeOverlay(): void {
    const video = this.videoRef.nativeElement;
    const canvas = this.overlayRef.nativeElement;
    if (video.videoWidth && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
  }

  private async captureFrame(name: string): Promise<File> {
    const video = this.videoRef.nativeElement;
    const canvas = this.captureRef.nativeElement;
    if (!video.videoWidth || !video.videoHeight) throw new Error('La cámara todavía no está lista.');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No se pudo capturar la imagen.');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) throw new Error('No se pudo generar la foto.');
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
  }

  private setPreview(target: { set(value: string): void; (): string }, file: File): void {
    this.revokePreview(target());
    target.set(URL.createObjectURL(file));
  }

  private revokePreview(url: string): void {
    if (url) URL.revokeObjectURL(url);
  }

  private showError(message: string): void {
    this.error.set(message);
    this.mensaje.set('No se pudo completar la verificación.');
    this.fallo.emit(message);
  }

  private errorText(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
