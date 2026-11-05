import {
  AfterViewInit,
  Component,
  DestroyRef,
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { bocaEnReposo, detectarGesto, evaluarEncuadre, medirAperturaBoca, PosicionEstable } from './vitalidad';
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
  | 'recentering'
  | 'centering'
  | 'capturing'
  | 'validating'
  | 'complete'
  | 'error';

interface HeadPose {
  yaw: number;
  roll: number;
}

const HOLD_ACTION_MS = 650;
const HOLD_CENTER_MS = 500;
const HOLD_FINAL_MS = 900;
const HOLD_CALIBRATION_MS = 900;
const CAPTURE_NOTICE_MS = 250;
const FRAMES_POR_ACCION = 2;
const ESPERA_ENTRE_FRAMES_MS = 90;

const puntuarCamaraTrasera = (label: string): number => {
  const nombre = label.toLocaleLowerCase();

  // En varios teléfonos `facingMode: environment` abre la lente ultra gran angular.
  // Priorizamos las etiquetas que identifican la cámara principal/1x y dejamos las
  // lentes especiales al final, sin depender del orden que entrega el navegador.
  if (/ultra[ -]?(wide|gran angular)|0[.,]5\s?x/.test(nombre)) return -300;
  if (/macro/.test(nombre)) return -250;
  if (/tele(photo|objetivo)?|\b[2-9](?:[.,]\d+)?\s?x\b/.test(nombre)) return -200;
  if (/\b1(?:[.,]0)?\s?x\b|main|principal|standard|normal/.test(nombre)) return 300;
  if (/^(back|rear|environment|trasera|posterior) camera$/.test(nombre)) return 250;
  if (/wide|gran angular/.test(nombre)) return 200;
  if (/dual|triple|fusion/.test(nombre)) return 100;
  return 0;
};

@Component({
  selector: 'app-captura-identidad',
  standalone: true,
  imports: [],
  templateUrl: './captura-identidad.component.html',
  styleUrl: './captura-identidad.component.scss',
})
export class CapturaIdentidadComponent implements AfterViewInit, OnDestroy {
  @ViewChild('dialog', { static: true }) private readonly dialogRef!: ElementRef<HTMLDialogElement>;
  @ViewChild('video', { static: true }) private readonly videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlay', { static: true }) private readonly overlayRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('capture', { static: true }) private readonly captureRef!: ElementRef<HTMLCanvasElement>;

  @Output() readonly pruebaVidaCompletada = new EventEmitter<IdentidadCapturada>();
  @Output() readonly fallo = new EventEmitter<string>();
  @Output() readonly reintento = new EventEmitter<void>();
  @Output() readonly cerrar = new EventEmitter<void>();

  private readonly facialService = inject(VerificacionFacialService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly paso = signal<PasoCaptura>('dni_frente');
  protected readonly fase = signal<FaseVitalidad>('idle');
  protected readonly cameraReady = signal(false);
  protected readonly cameraAspectRatio = signal(4 / 3);
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
  protected readonly segundosRestantes = signal(0);
  protected readonly tiempoRestante = computed(() => {
    const total = this.segundosRestantes();
    const minutos = Math.floor(total / 60);
    const segundos = total % 60;
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  });
  protected readonly progresoCapturaFinal = signal(0);
  protected readonly fotoPendientePreview = signal('');
  protected readonly puedeCambiarCamara = signal(false);
  protected readonly feedback = signal('Preparando la cámara…');
  protected readonly estadoEnVivo = signal<'waiting' | 'adjust' | 'detected' | 'confirmed'>('waiting');
  protected readonly progresoGesto = signal(0);
  protected readonly tituloPaso = computed(() => {
    if (this.paso() === 'dni_frente') return 'Fotografiá el frente de tu DNI';
    if (this.paso() === 'dni_dorso') return 'Ahora, el dorso de tu DNI';
    if (this.fase() === 'complete') return 'Tu prueba de vida es válida';
    if (this.fase() === 'calibrating') return 'Primero, mirá de frente';
    if (this.fase() === 'validating') return 'Comprobando tu prueba';
    if (this.fase() === 'error') return 'Vamos a intentarlo de nuevo';
    if (['centering', 'capturing'].includes(this.fase())) return 'Último paso: una foto de frente';
    if (this.fase() === 'recentering') return 'Bien, volvé al centro';
    return this.instruccionActual()?.label ?? 'Seguí las indicaciones';
  });
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
  private actionPhotos: File[][] = [];
  private challengeToken = '';
  private challengeExpiraEn = 0;
  private temporizadorChallenge: number | null = null;
  private stream: MediaStream | null = null;
  private cameraSession = 0;
  private faceLandmarker: FaceLandmarker | null = null;
  private modeloPendiente: Promise<void> | null = null;
  private animationFrameId: number | null = null;
  private lastVideoTime = -1;
  private destroyed = false;
  private busyFrame = false;
  private neutralPose: HeadPose | null = null;
  private aperturaNeutral: number | null = null;
  private sumaApertura = 0;
  private muestrasApertura = 0;
  private calibrationYaw = 0;
  private calibrationRoll = 0;
  private calibrationCount = 0;
  private camarasTraseras: MediaDeviceInfo[] = [];
  private indiceCamaraTrasera = 0;
  private readonly posicionEstable = new PosicionEstable();
  private ultimaDeteccion: FaceLandmarkerResult | null = null;
  private ultimaDeteccionEn = 0;
  private ultimoAnalisisEn = 0;
  private verificationToken = '';
  private verificationExpiraEn = 0;
  private focoAnterior: HTMLElement | null = null;
  private overflowAnterior = '';

  ngAfterViewInit(): void {
    this.focoAnterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.dialogRef.nativeElement.showModal();
    void this.startCamera('environment').catch(() => undefined);
    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.detenerContador();
    if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
    this.stopCamera();
    this.faceLandmarker?.close();
    this.revokePreview(this.frentePreview());
    this.revokePreview(this.dorsoPreview());
    this.revokePreview(this.fotoPendientePreview());
    this.dialogRef.nativeElement.close();
    document.body.style.overflow = this.overflowAnterior;
    this.focoAnterior?.focus();
  }

  protected cancelar(event?: Event): void {
    event?.preventDefault();
    this.cerrar.emit();
  }

  protected enviarCapturas(): void {
    if (this.destroyed || this.fase() !== 'complete' || !this.frente || !this.dorso || !this.livePhoto) return;
    if (Date.now() >= this.verificationExpiraEn) {
      this.fase.set('error');
      this.paso.set('liveness');
      this.showError('La prueba venció antes del envío. Repetí solo los movimientos; conservamos las fotos de tu DNI.');
      return;
    }
    this.pruebaVidaCompletada.emit({
      dni_frente: this.frente, dni_dorso: this.dorso, rostro: this.livePhoto,
      verificationToken: this.verificationToken,
    });
  }

  protected async capturarDocumento(): Promise<void> {
    if (!this.cameraReady() || this.procesando() || this.fotoPendiente) return;
    this.procesando.set(true);
    this.error.set('');
    try {
      const campo = this.paso();
      const foto = await this.captureFrame(`${campo}-${Date.now()}.jpg`);
      if (this.destroyed) return;
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
        if (this.destroyed) return;
        this.fase.set('error');
        this.stopCamera();
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
    if (
      this.busyFrame ||
      this.cambiandoDesafio() ||
      this.procesando() ||
      ['capturing', 'validating', 'complete'].includes(this.fase())
    ) return;

    this.cambiandoDesafio.set(true);
    this.fase.set('idle');
    this.error.set('');
    this.reintento.emit();
    try {
      let challenge: DesafioVitalidad;
      try {
        challenge = await firstValueFrom(
          (this.challengeToken ? this.facialService.cambiarDesafio(this.challengeToken) :
            this.facialService.crearDesafio()).pipe(takeUntilDestroyed(this.destroyRef)),
        );
      } catch {
        // Si el backend no puede reutilizar el desafío anterior (por ejemplo,
        // porque venció), se pide uno nuevo sin reiniciar las fotos del DNI.
        if (this.destroyed) return;
        challenge = await firstValueFrom(this.facialService.crearDesafio().pipe(takeUntilDestroyed(this.destroyRef)));
      }
      await this.asegurarCamaraYModelo();
      if (this.destroyed) return;
      this.aplicarDesafio(challenge);
      this.fase.set('calibrating');
      this.mensaje.set('Mirá de frente. Conservamos las fotos de tu DNI.');
    } catch (error: unknown) {
      if (this.destroyed) return;
      this.fase.set('error');
      this.showError(this.errorText(error));
    } finally {
      this.cambiandoDesafio.set(false);
    }
  }

  /**
   * Reinicia todo el flujo, incluidas las fotos del DNI. Para reintentar solo
   * la prueba de vida conservando el DNI se usa "Cambiar gestos".
   */
  protected async reiniciar(): Promise<void> {
    if (this.procesando() || this.cambiandoDesafio() || this.busyFrame) return;
    this.procesando.set(true);
    this.reintento.emit();
    this.frente = null;
    this.dorso = null;
    this.limpiarFotoPendiente();
    this.neutralPhoto = null;
    this.livePhoto = null;
    this.actionPhotos = [];
    this.challengeToken = '';
    this.neutralPose = null;
    this.aperturaNeutral = null;
    this.sumaApertura = this.muestrasApertura = 0;
    this.calibrationYaw = 0;
    this.calibrationRoll = 0;
    this.calibrationCount = 0;
    this.posicionEstable.reiniciar();
    this.progresoGesto.set(0);
    this.verificationToken = '';
    this.progresoCapturaFinal.set(0);
    this.indiceInstruccion.set(0);
    this.instrucciones.set([]);
    this.detenerContador();
    this.challengeExpiraEn = 0;
    this.segundosRestantes.set(0);
    this.fase.set('idle');
    this.paso.set('dni_frente');
    this.error.set('');
    this.mensaje.set('Colocá el frente del DNI dentro del recuadro.');
    this.revokePreview(this.frentePreview());
    this.revokePreview(this.dorsoPreview());
    this.frentePreview.set('');
    this.dorsoPreview.set('');
    try { await this.startCamera('environment'); }
    catch { /* startCamera muestra cómo recuperar la cámara. */ }
    finally { this.procesando.set(false); }
  }

  private async iniciarPruebaFacial(): Promise<void> {
    this.paso.set('liveness');
    this.fase.set('idle');
    this.mensaje.set('Preparando la prueba de vida…');
    const [challenge] = await Promise.all([
      firstValueFrom(this.facialService.crearDesafio().pipe(takeUntilDestroyed(this.destroyRef))),
      this.initializeFaceLandmarker(),
      this.startCamera('user'),
    ]);
    if (this.destroyed) return;
    this.aplicarDesafio(challenge);
    this.fase.set('calibrating');
    this.mensaje.set('Mirá de frente y mantené la cabeza quieta para calibrar.');
  }

  private async initializeFaceLandmarker(): Promise<void> {
    if (this.faceLandmarker) return;
    if (this.modeloPendiente) return this.modeloPendiente;
    this.modeloPendiente = this.crearModeloFacial();
    try { await this.modeloPendiente; }
    finally { this.modeloPendiente = null; }
  }

  private async crearModeloFacial(): Promise<void> {
    const vision = await FilesetResolver.forVisionTasks('/assets/wasm');
    let modelo: FaceLandmarker;
    try {
      modelo = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: '/assets/face_landmarker.task', delegate: 'GPU' },
        runningMode: 'VIDEO', numFaces: 2, outputFaceBlendshapes: true,
      });
    } catch {
      modelo = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: '/assets/face_landmarker.task', delegate: 'CPU' },
        runningMode: 'VIDEO', numFaces: 2, outputFaceBlendshapes: true,
      });
    }
    if (this.destroyed) modelo.close();
    else this.faceLandmarker = modelo;
  }

  private async startCamera(facingMode: 'user' | 'environment', deviceId?: string): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Este navegador no permite acceder a la cámara.');
    this.stopCamera();
    const sesion = this.cameraSession;
    this.cameraReady.set(false);
    this.lastVideoTime = -1;
    try {
      const nueva = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: facingMode } }),
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (this.destroyed || sesion !== this.cameraSession) { nueva.getTracks().forEach(track => track.stop()); return; }
      this.stream = nueva;
      if (facingMode === 'environment' && !deviceId) await this.seleccionarCamaraTraseraNormal();
      await this.normalizarZoom();
      if (this.destroyed || sesion !== this.cameraSession) return;
      const video = this.videoRef.nativeElement;
      video.srcObject = this.stream;
      await video.play();
      if (this.destroyed || sesion !== this.cameraSession) return;
      this.cameraAspectRatio.set(video.videoWidth / video.videoHeight || 4 / 3);
      const actual = this.stream;
      actual?.getVideoTracks()[0]?.addEventListener('ended', () => {
        if (this.destroyed || this.stream !== actual) return;
        if (this.paso() === 'liveness') this.fase.set('error');
        this.stopCamera();
        this.showError('La cámara se desconectó. Volvé a conectarla y reintentá.');
      }, { once: true });
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
    this.camarasTraseras = devices
      .filter(({ kind, label }) =>
        kind === 'videoinput' && /back|rear|environment|trasera|posterior/i.test(label),
      )
      .sort((a, b) => puntuarCamaraTrasera(b.label) - puntuarCamaraTrasera(a.label));
    this.puedeCambiarCamara.set(this.camarasTraseras.length > 1);
    if (this.camarasTraseras.length < 2) return;

    const preferida = this.camarasTraseras.find(({ label }) => puntuarCamaraTrasera(label) >= 0);
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
    this.cameraSession++;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.cameraReady.set(false);
    if (this.videoRef?.nativeElement) this.videoRef.nativeElement.srcObject = null;
  }

  private readonly renderLoop = (): void => {
    if (this.destroyed) return;
    const video = this.videoRef.nativeElement;
    const canvas = this.overlayRef.nativeElement;
    const context = canvas.getContext('2d');
    if (context && this.cameraReady() && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      this.resizeOverlay();
      if (this.paso() !== 'liveness') {
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.drawDocumentGuide(context);
      } else if (this.faceLandmarker && video.currentTime !== this.lastVideoTime &&
          performance.now() - this.ultimoAnalisisEn >= 80) {
        try {
          context.clearRect(0, 0, canvas.width, canvas.height);
          this.ultimoAnalisisEn = performance.now();
          const result = this.faceLandmarker.detectForVideo(video, performance.now());
          this.ultimaDeteccion = result;
          this.ultimaDeteccionEn = performance.now();
          this.lastVideoTime = video.currentTime;
          void this.processLiveness(result).catch((error: unknown) => {
            this.fase.set('error');
            this.showError(this.errorText(error));
          });
          this.drawFaceGuide(context, this.estadoEnVivo() === 'detected');
        } catch (error: unknown) {
          this.fase.set('error');
          this.stopCamera();
          this.showError(`No se pudo analizar la cámara: ${this.errorText(error)}`);
        }
      }
    }
    if (!this.destroyed) this.animationFrameId = requestAnimationFrame(this.renderLoop);
  };

  private async processLiveness(result: FaceLandmarkerResult): Promise<void> {
    if (this.destroyed || this.busyFrame || this.cambiandoDesafio() ||
        ['idle', 'error', 'capturing', 'validating', 'complete'].includes(this.fase())) return;
    const problema = evaluarEncuadre(result.faceLandmarks);
    const landmarks = result.faceLandmarks[0];
    const blendshapes = result.faceBlendshapes[0];
    const pose = landmarks ? this.calculateHeadPose(landmarks) : null;
    if (problema || !pose || !blendshapes) {
      this.posicionEstable.reiniciar();
      this.calibrationYaw = this.calibrationRoll = this.calibrationCount = 0;
      this.sumaApertura = this.muestrasApertura = 0;
      this.progresoGesto.set(0);
      this.progresoCapturaFinal.set(0);
      this.estadoEnVivo.set('adjust');
      this.feedback.set(problema ?? 'No vemos bien tu cara. Mirá de frente con buena luz.');
      return;
    }
    const scores = new Map(blendshapes.categories.map(({ categoryName, score }) => [categoryName, score]));
    const apertura = medirAperturaBoca(landmarks, this.cameraAspectRatio());
    const ahora = performance.now();
    if (this.fase() === 'calibrating') {
      const quieto = Math.abs(pose.yaw) <= .12 && Math.abs(pose.roll) <= .16 &&
        bocaEnReposo(apertura, null, scores.get('jawOpen') ?? 0) &&
        (!this.calibrationCount || (
          Math.abs(pose.yaw - this.calibrationYaw / this.calibrationCount) <= .025 &&
          Math.abs(pose.roll - this.calibrationRoll / this.calibrationCount) <= .06));
      const progreso = this.posicionEstable.progreso(quieto, ahora, HOLD_CALIBRATION_MS);
      this.progresoGesto.set(progreso);
      this.estadoEnVivo.set(quieto ? 'detected' : 'adjust');
      this.feedback.set(quieto ? 'Bien encuadrado. Quedate quieto un momento…' : 'Mirá de frente, con la cabeza derecha y la boca cerrada.');
      if (!quieto || progreso === 0) {
        this.calibrationYaw = this.calibrationRoll = this.calibrationCount = 0;
        this.sumaApertura = this.muestrasApertura = 0;
      }
      if (!quieto) return;
      this.calibrationYaw += pose.yaw;
      this.calibrationRoll += pose.roll;
      this.calibrationCount++;
      if (apertura !== null) { this.sumaApertura += apertura; this.muestrasApertura++; }
      if (progreso === 100) {
        this.aperturaNeutral = this.muestrasApertura ? this.sumaApertura / this.muestrasApertura : null;
        this.neutralPose = {
          yaw: this.calibrationYaw / this.calibrationCount,
          roll: this.calibrationRoll / this.calibrationCount,
        };
        this.busyFrame = true;
        try {
          this.neutralPhoto = await this.captureFrame(`neutral-${Date.now()}.jpg`);
          if (this.destroyed) return;
          this.posicionEstable.reiniciar();
          this.progresoGesto.set(0);
          this.fase.set('actions');
          this.feedback.set('Ahora hacé el movimiento indicado.');
          this.estadoEnVivo.set('waiting');
        } finally {
          this.busyFrame = false;
        }
      }
      return;
    }

    if (this.fase() === 'recentering' || this.fase() === 'centering') {
      const final = this.fase() === 'centering';
      const centered = this.isCentered(pose) && bocaEnReposo(apertura, this.aperturaNeutral, scores.get('jawOpen') ?? 0);
      const progreso = this.posicionEstable.progreso(centered, ahora, final ? HOLD_FINAL_MS : HOLD_CENTER_MS);
      this.estadoEnVivo.set(centered ? 'detected' : 'adjust');
      this.feedback.set(centered ? 'Perfecto. Mantené la mirada en la cámara…' : 'Volvé a mirar de frente y cerrá la boca.');
      this.progresoGesto.set(progreso);
      this.progresoCapturaFinal.set(progreso);
      if (progreso === 100) {
        this.posicionEstable.reiniciar();
        if (final) await this.finalizeLiveness();
        else {
          this.indiceInstruccion.update(index => index + 1);
          this.progresoGesto.set(0);
          this.fase.set('actions');
          this.estadoEnVivo.set('waiting');
          this.feedback.set('Seguí con el próximo movimiento.');
        }
      }
      return;
    }
    const accion = this.instruccionActual()?.type ?? null;
    const detected = this.isActionDetected(accion, pose, scores, apertura);
    const progreso = this.posicionEstable.progreso(detected, ahora, HOLD_ACTION_MS);
    this.progresoGesto.set(progreso);
    this.estadoEnVivo.set(detected ? 'detected' : 'adjust');
    const yaw = pose.yaw - (this.neutralPose?.yaw ?? 0);
    const contrario = (accion === 'TURN_LEFT' && yaw < -.04) || (accion === 'TURN_RIGHT' && yaw > .04);
    const bocaAbierta = apertura !== null && this.aperturaNeutral !== null &&
      apertura >= .16 && apertura >= this.aperturaNeutral + .06;
    this.feedback.set(detected ? '¡Bien! Gesto detectado. Mantenelo hasta completar la barra.' :
      contrario ? 'Estás girando hacia el otro lado. Seguí la flecha.' :
      accion === 'OPEN_MOUTH' ? (bocaAbierta
        ? 'Vemos tu boca abierta. Mirá de frente para completar el gesto.'
        : 'Separá un poco más los labios, como al decir «A».') : this.ayudaGesto());
    if (progreso === 100) await this.completeAction();
  }

  private evidenciaActualValida(final = false): boolean {
    const result = this.ultimaDeteccion;
    if (!result || performance.now() - this.ultimaDeteccionEn > 400 || evaluarEncuadre(result.faceLandmarks)) return false;
    const pose = this.calculateHeadPose(result.faceLandmarks[0]);
    const blendshapes = result.faceBlendshapes[0];
    if (!pose || !blendshapes) return false;
    const scores = new Map(blendshapes.categories.map(({ categoryName, score }) => [categoryName, score]));
    return final ? this.isCentered(pose) && bocaEnReposo(
      medirAperturaBoca(result.faceLandmarks[0], this.cameraAspectRatio()), this.aperturaNeutral, scores.get('jawOpen') ?? 0) :
      this.isActionDetected(this.instruccionActual()?.type ?? null, pose, scores,
        medirAperturaBoca(result.faceLandmarks[0], this.cameraAspectRatio()));
  }

  private async completeAction(): Promise<void> {
    if (this.busyFrame) return;
    this.busyFrame = true;
    this.procesando.set(true);
    try {
      const fotogramas: File[] = [];
      for (let frame = 0; frame < FRAMES_POR_ACCION; frame++) {
        if (this.destroyed || !this.evidenciaActualValida()) {
          this.posicionEstable.reiniciar();
          this.progresoGesto.set(0);
          this.estadoEnVivo.set('adjust');
          this.feedback.set('Mantené el gesto un poco más para tomar una foto clara.');
          return;
        }
        fotogramas.push(
          await this.captureFrame(
            `movimiento-${this.indiceInstruccion() + 1}-${frame + 1}.jpg`,
          ),
        );
        if (frame < FRAMES_POR_ACCION - 1) {
          await new Promise<void>((resolve) =>
            window.setTimeout(resolve, ESPERA_ENTRE_FRAMES_MS),
          );
        }
      }
      if (this.destroyed) return;
      this.actionPhotos.push(fotogramas);
      this.posicionEstable.reiniciar();
      this.progresoGesto.set(0);
      this.estadoEnVivo.set('waiting');
      this.feedback.set('Gesto capturado. Volvé a mirar al centro.');
      if (this.indiceInstruccion() === this.instrucciones().length - 1) {
        this.fase.set('centering');
        this.progresoCapturaFinal.set(0);
        this.mensaje.set('Movimientos capturados. Falta la foto final y la comprobación.');
      } else {
        this.fase.set('recentering');
        this.mensaje.set('Gesto capturado. Volvé a mirar al centro.');
      }
    } finally {
      this.busyFrame = false;
      this.procesando.set(false);
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
      // Breve aviso visual sin hacer esperar innecesariamente a la persona.
      await new Promise<void>((resolve) => window.setTimeout(resolve, CAPTURE_NOTICE_MS));
      if (this.destroyed) return;
      if (!this.evidenciaActualValida(true)) {
        this.fase.set('centering');
        this.posicionEstable.reiniciar();
        this.progresoCapturaFinal.set(0);
        this.feedback.set('Mirá de frente un momento más. La foto se toma automáticamente.');
        return;
      }
      this.livePhoto = await this.captureFrame(`rostro-en-vivo-${Date.now()}.jpg`);
      if (this.destroyed) return;
      this.stopCamera();
      this.cameraReady.set(false);
      this.fase.set('validating');
      this.mensaje.set('Foto tomada. Estamos comprobando la prueba de vida…');
      const response = await firstValueFrom(
        this.facialService.validarVitalidad(
          this.challengeToken,
          this.neutralPhoto,
          this.actionPhotos,
          this.livePhoto,
        ).pipe(takeUntilDestroyed(this.destroyRef)),
      );
      if (this.destroyed) return;
      if (response.valid !== true || !response.verificationToken) throw new Error('El servidor no confirmó la prueba. Intentá nuevamente.');
      this.verificationToken = response.verificationToken;
      this.verificationExpiraEn = this.expiracionDelToken(response.verificationToken) ?? Date.now() + 5 * 60 * 1000;
      this.fase.set('complete');
      this.paso.set('complete');
      this.estadoEnVivo.set('confirmed');
      this.mensaje.set('El servidor confirmó tu prueba de vida. Ya podés enviar la documentación.');
      this.detenerContador();
      this.segundosRestantes.set(0);
      this.stopCamera();
    } catch (error: unknown) {
      if (this.destroyed) return;
      this.fase.set('error');
      this.showError(this.errorText(error));
      // La cámara queda apagada. Se enciende recién cuando el usuario pulsa
      // "Cambiar gestos", para que el fallo no se confunda con una cámara activa.
      this.stopCamera();
      this.cameraReady.set(false);
    } finally {
      this.procesando.set(false);
      this.busyFrame = false;
    }
  }

  private aplicarDesafio(challenge: DesafioVitalidad): void {
    this.challengeToken = challenge.challengeToken;
    this.instrucciones.set(challenge.instructions);
    this.limpiarEstadoVitalidad();
    this.iniciarContador(challenge);
  }

  /** Deja la prueba de vida lista para empezar de cero sin tocar las fotos del DNI. */
  private limpiarEstadoVitalidad(): void {
    this.posicionEstable.reiniciar();
    this.progresoGesto.set(0);
    this.estadoEnVivo.set('waiting');
    this.feedback.set('Mirá de frente para comenzar.');
    this.ultimaDeteccion = null;
    this.verificationToken = '';
    this.neutralPhoto = null;
    this.livePhoto = null;
    this.actionPhotos = [];
    this.neutralPose = null;
    this.aperturaNeutral = null;
    this.sumaApertura = this.muestrasApertura = 0;
    this.calibrationYaw = 0;
    this.calibrationRoll = 0;
    this.calibrationCount = 0;
    this.progresoCapturaFinal.set(0);
    this.indiceInstruccion.set(0);
  }

  private async asegurarCamaraYModelo(): Promise<void> {
    if (!this.faceLandmarker) await this.initializeFaceLandmarker();
    if (!this.cameraReady()) await this.startCamera('user');
  }

  private iniciarContador(challenge: DesafioVitalidad): void {
    this.detenerContador();
    this.challengeExpiraEn =
      this.expiracionDelToken(challenge.challengeToken) ??
      Date.now() + challenge.expiresInSeconds * 1000;
    this.actualizarContador();
    this.temporizadorChallenge = window.setInterval(
      () => this.actualizarContador(),
      1000,
    );
  }

  private actualizarContador(): void {
    const restantes = Math.max(
      0,
      Math.ceil((this.challengeExpiraEn - Date.now()) / 1000),
    );
    this.segundosRestantes.set(restantes);
    if (restantes <= 0) {
      this.detenerContador();
      if (!['complete', 'validating', 'capturing', 'idle', 'error'].includes(this.fase())) {
        this.fase.set('error');
        this.stopCamera();
        this.showError('Se terminó el tiempo de la prueba. Reintentá los movimientos; las fotos del DNI se conservan.');
      }
    }
  }

  private detenerContador(): void {
    if (this.temporizadorChallenge !== null) {
      window.clearInterval(this.temporizadorChallenge);
      this.temporizadorChallenge = null;
    }
  }

  /** Lee el `exp` del JWT del desafío para mostrar el tiempo real restante. */
  private expiracionDelToken(token: string): number | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const normalizado = payload.replace(/-/g, '+').replace(/_/g, '/');
      const conPadding = normalizado.padEnd(
        Math.ceil(normalizado.length / 4) * 4,
        '=',
      );
      const json = JSON.parse(atob(conPadding)) as { exp?: number };
      return typeof json.exp === 'number' ? json.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  private isActionDetected(action: AccionVitalidad | null, pose: HeadPose, scores: ReadonlyMap<string, number>, apertura: number | null = null): boolean {
    return detectarGesto(action, pose, this.neutralPose, scores.get('jawOpen') ?? 0, apertura, this.aperturaNeutral);
  }

  private isCentered(pose: HeadPose): boolean {
    return !!this.neutralPose &&
      Math.abs(pose.yaw - this.neutralPose.yaw) <= 0.045 &&
      Math.abs(pose.roll - this.neutralPose.roll) <= 0.1;
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
      // No tapar los labios con un dibujo en una posición fija.
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
    if (this.destroyed) return;
    this.error.set(message);
    this.mensaje.set('No se pudo completar la verificación.');
    this.fallo.emit(message);
  }

  private errorText(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
