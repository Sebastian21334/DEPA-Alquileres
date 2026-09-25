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
type FaseVitalidad =
  | 'idle'
  | 'calibrating'
  | 'actions'
  | 'centering'
  | 'capturing'
  | 'validating'
  | 'complete';

interface HeadPose {
  yaw: number;
  roll: number;
}

const REQUIRED_FRAMES = 8;
const FINAL_CAPTURE_FRAMES = 24;
const CALIBRATION_FRAMES = 12;
const CAPTURE_NOTICE_MS = 900;

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
  protected readonly cameraAspectRatio = signal('4 / 3');
  protected readonly procesando = signal(false);
  protected readonly cambiandoDesafio = signal(false);
  protected readonly mensaje = signal('Colocá el frente del DNI dentro del recuadro.');
  protected readonly error = signal('');
  protected readonly frentePreview = signal('');
  protected readonly dorsoPreview = signal('');
  protected readonly instrucciones = signal<DesafioVitalidad['instructions']>([]);
  protected readonly indiceInstruccion = signal(0);
  protected readonly instruccionActual = computed(
    () => this.instrucciones()[this.indiceInstruccion()] ?? null,
  );
  protected readonly progresoCapturaFinal = signal(0);
  protected readonly fotoPendientePreview = signal('');
  protected readonly puedeCambiarCamara = signal(false);
  protected readonly ayudaGesto = computed(() => {
    switch (this.instruccionActual()?.type) {
      case 'TURN_LEFT': return 'Girá la nariz hacia tu hombro izquierdo, sin mover el celular.';
      case 'TURN_RIGHT': return 'Girá la nariz hacia tu hombro derecho, sin mover el celular.';
      case 'TILT_HEAD': return 'Acercá una oreja al hombro, manteniendo la mirada hacia adelante.';
      case 'OPEN_MOUTH': return 'Mantené la cabeza de frente y abrí bien la boca.';
      default: return '';
    }
  });

  private frente: File | null = null;
  private dorso: File | null = null;
  private fotoPendiente: File | null = null;
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
  private camarasTraseras: MediaDeviceInfo[] = [];
  private indiceCamaraTrasera = 0;

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
    this.revokePreview(this.fotoPendientePreview());
  }

  protected async capturarDocumento(): Promise<void> {
    if (!this.cameraReady() || this.procesando() || this.fotoPendiente) return;
    this.procesando.set(true);
    this.error.set('');
    try {
      const campo = this.paso();
      const foto = await this.captureFrame(`${campo}-${Date.now()}.jpg`);
      this.fotoPendiente = foto;
      this.setPreview(this.fotoPendientePreview, foto);
      this.mensaje.set(`Revisá que el ${campo === 'dni_frente' ? 'frente' : 'dorso'} se vea completo, nítido y sin reflejos.`);
    } catch (error: unknown) {
      this.showError(this.errorText(error));
    } finally {
      this.procesando.set(false);
    }
  }

  protected async confirmarDocumento(): Promise<void> {
    if (!this.fotoPendiente || this.procesando()) return;
    const foto = this.fotoPendiente;
    this.limpiarFotoPendiente();
    if (this.paso() === 'dni_frente') {
      this.frente = foto;
      this.setPreview(this.frentePreview, foto);
      this.paso.set('dni_dorso');
      this.mensaje.set('Ahora colocá el dorso del DNI dentro del recuadro.');
      return;
    }
    if (this.paso() === 'dni_dorso') {
      this.dorso = foto;
      this.setPreview(this.dorsoPreview, foto);
      this.procesando.set(true);
      try {
        await this.iniciarPruebaFacial();
      } catch (error: unknown) {
        this.showError(this.errorText(error));
      } finally {
        this.procesando.set(false);
      }
    }
  }

  protected repetirDocumento(): void {
    this.limpiarFotoPendiente();
    this.mensaje.set(
      this.paso() === 'dni_frente'
        ? 'Colocá el frente del DNI dentro del recuadro.'
        : 'Colocá el dorso del DNI dentro del recuadro.',
    );
  }

  protected async cambiarCamara(): Promise<void> {
    if (this.camarasTraseras.length < 2 || this.procesando()) return;
    this.indiceCamaraTrasera = (this.indiceCamaraTrasera + 1) % this.camarasTraseras.length;
    this.procesando.set(true);
    try {
      await this.startCamera('environment', this.camarasTraseras[this.indiceCamaraTrasera].deviceId);
    } catch {
      // startCamera ya muestra un mensaje accionable.
    } finally {
      this.procesando.set(false);
    }
  }

  protected async cambiarGestos(): Promise<void> {
    if (!this.challengeToken || this.cambiandoDesafio() || ['capturing', 'validating', 'complete'].includes(this.fase())) return;
    this.cambiandoDesafio.set(true);
    this.error.set('');
    try {
      const challenge = await firstValueFrom(this.facialService.cambiarDesafio(this.challengeToken));
      this.challengeToken = challenge.challengeToken;
      this.instrucciones.set(challenge.instructions);
      this.indiceInstruccion.set(0);
      this.actionPhotos = [];
      this.neutralPhoto = null;
      this.neutralPose = null;
      this.matchingFrames = 0;
      this.calibrationYaw = 0;
      this.calibrationRoll = 0;
      this.calibrationCount = 0;
      this.progresoCapturaFinal.set(0);
      this.fase.set('calibrating');
      this.mensaje.set('Gestos cambiados. Mirá de frente para volver a calibrar.');
    } catch (error: unknown) {
      this.showError(this.errorText(error));
    } finally {
      this.cambiandoDesafio.set(false);
    }
  }

  protected async reiniciar(): Promise<void> {
    this.frente = null;
    this.dorso = null;
    this.limpiarFotoPendiente();
    this.neutralPhoto = null;
    this.livePhoto = null;
    this.actionPhotos = [];
    this.challengeToken = '';
    this.neutralPose = null;
    this.matchingFrames = 0;
    this.calibrationYaw = 0;
    this.calibrationRoll = 0;
    this.calibrationCount = 0;
    this.progresoCapturaFinal.set(0);
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

  private async startCamera(facingMode: 'user' | 'environment', deviceId?: string): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Este navegador no permite acceder a la cámara.');
    this.stopCamera();
    this.cameraReady.set(false);
    this.lastVideoTime = -1;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: facingMode } }),
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (facingMode === 'environment' && !deviceId) await this.seleccionarCamaraTraseraNormal();
      await this.normalizarZoom();
      const video = this.videoRef.nativeElement;
      video.srcObject = this.stream;
      await video.play();
      this.cameraAspectRatio.set(`${video.videoWidth} / ${video.videoHeight}`);
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

  private async seleccionarCamaraTraseraNormal(): Promise<void> {
    if (typeof navigator.mediaDevices.enumerateDevices !== 'function') return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    this.camarasTraseras = devices.filter(({ kind, label }) =>
      kind === 'videoinput' && /back|rear|environment|trasera|posterior/i.test(label),
    );
    this.puedeCambiarCamara.set(this.camarasTraseras.length > 1);
    if (this.camarasTraseras.length < 2) return;

    const esLenteSecundaria = (label: string) => /ultra[ -]?wide|0[.,]5|telephoto|teleobjetivo|macro/i.test(label);
    const preferida = this.camarasTraseras.find(({ label }) => !esLenteSecundaria(label));
    const actualId = this.stream?.getVideoTracks()[0]?.getSettings().deviceId;
    if (!preferida || preferida.deviceId === actualId) {
      this.indiceCamaraTrasera = Math.max(0, this.camarasTraseras.findIndex(({ deviceId: id }) => id === actualId));
      return;
    }
    try {
      const reemplazo = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { deviceId: { exact: preferida.deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      this.stream?.getTracks().forEach((track) => track.stop());
      this.stream = reemplazo;
      this.indiceCamaraTrasera = this.camarasTraseras.findIndex(({ deviceId: id }) => id === preferida.deviceId);
    } catch {
      // Algunos navegadores listan las lentes pero no permiten elegirlas por ID.
      // En ese caso se conserva el stream trasero que ya estaba funcionando.
    }
  }

  private async normalizarZoom(): Promise<void> {
    const track = this.stream?.getVideoTracks()[0];
    if (!track || typeof track.getCapabilities !== 'function') return;
    const capabilities = track.getCapabilities() as MediaTrackCapabilities & { zoom?: { min: number; max: number } };
    if (!capabilities.zoom || capabilities.zoom.min > 1 || capabilities.zoom.max < 1) return;
    await track.applyConstraints({ advanced: [{ zoom: 1 } as MediaTrackConstraintSet] }).catch(() => undefined);
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
    if (this.busyFrame || ['idle', 'capturing', 'validating', 'complete'].includes(this.fase())) return;
    const landmarks = result.faceLandmarks[0];
    const blendshapes = result.faceBlendshapes[0];
    if (!landmarks || !blendshapes) {
      this.matchingFrames = 0;
      this.progresoCapturaFinal.set(0);
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
      this.progresoCapturaFinal.set(
        centered ? Math.min(100, Math.round((this.matchingFrames / FINAL_CAPTURE_FRAMES) * 100)) : 0,
      );
      this.mensaje.set(
        centered
          ? 'Mirá a la cámara y mantenete quieto hasta que te avisemos.'
          : 'Volvé a mirar de frente y centrá la cara dentro del óvalo.',
      );
      if (this.matchingFrames >= FINAL_CAPTURE_FRAMES) await this.finalizeLiveness();
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
        this.progresoCapturaFinal.set(0);
        this.mensaje.set('Movimientos completos. Ahora mirá a la cámara para la foto final.');
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
    this.fase.set('capturing');
    this.procesando.set(true);
    this.progresoCapturaFinal.set(100);
    this.mensaje.set('¡Perfecto! Vamos a sacar la foto. Mantené la mirada en la cámara…');
    try {
      // Da tiempo a que el aviso se vea antes de congelar el fotograma final.
      await new Promise<void>((resolve) => window.setTimeout(resolve, CAPTURE_NOTICE_MS));
      this.livePhoto = await this.captureFrame(`rostro-en-vivo-${Date.now()}.jpg`);
      this.fase.set('validating');
      this.mensaje.set('Foto tomada. Estamos validando tu identidad…');
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
    const label = this.fase() === 'centering' || this.fase() === 'capturing'
      ? 'MIRÁ DE FRENTE'
      : this.instruccionActual()?.label.toUpperCase() ?? 'UBICÁ TU CARA';
    this.drawLabel(context, label);
    if (this.fase() === 'actions') this.drawActionArrow(context, this.instruccionActual()?.type ?? null, detected);
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

  private drawActionArrow(context: CanvasRenderingContext2D, action: AccionVitalidad | null, detected: boolean): void {
    const { width, height } = context.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    if (action === 'OPEN_MOUTH') {
      context.strokeStyle = detected ? '#22c55e' : '#ff9800';
      context.lineWidth = Math.max(5, width / 110);
      context.beginPath();
      context.ellipse(centerX, centerY + height * 0.18, width * 0.045, height * 0.055, 0, 0, Math.PI * 2);
      context.stroke();
      return;
    }
    if (action === 'TURN_LEFT') this.arrow(context, centerX + width * 0.2, centerY, centerX - width * 0.2, centerY, detected);
    if (action === 'TURN_RIGHT') this.arrow(context, centerX - width * 0.2, centerY, centerX + width * 0.2, centerY, detected);
    if (action === 'TILT_HEAD') this.arrow(context, centerX - width * 0.15, centerY + height * 0.14, centerX + width * 0.15, centerY - height * 0.14, detected);
  }

  private arrow(context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, detected: boolean): void {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const head = Math.max(18, context.canvas.width / 23);
    context.strokeStyle = detected ? '#22c55e' : '#ff9800';
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

  private limpiarFotoPendiente(): void {
    this.fotoPendiente = null;
    this.revokePreview(this.fotoPendientePreview());
    this.fotoPendientePreview.set('');
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
