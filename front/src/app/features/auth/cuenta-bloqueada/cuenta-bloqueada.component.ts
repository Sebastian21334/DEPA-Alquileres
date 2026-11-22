import { ConversationPanelComponent, mensajesApelacion } from '../../../shared/components/conversation-panel/conversation-panel.component';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideCalendar, LucideImagePlus, LucideLockKeyhole, LucideMessageCircle, LucideSend, LucideX } from '@lucide/angular';
import { ApiError } from '../../../core/interceptors/api-error';
import { AuthService, type VistaBloqueo } from '../../../core/services/auth.service';
import { finalize, timer } from 'rxjs';

@Component({
  selector: 'app-cuenta-bloqueada',
  imports: [DatePipe, FormsModule, RouterLink, ConversationPanelComponent, LucideArrowLeft, LucideCalendar,
    LucideImagePlus, LucideLockKeyhole, LucideMessageCircle, LucideSend, LucideX],
  templateUrl: './cuenta-bloqueada.component.html',
  styleUrl: './cuenta-bloqueada.component.scss',
})
export class CuentaBloqueadaComponent {
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly bloqueo = signal<VistaBloqueo | null>(null);
  protected readonly error = signal('');
  protected readonly ocupado = signal(false);
  protected readonly accesoLimitado = computed(() => this.auth.currentUser()?.accesoLimitado === true);
  protected readonly accesoVigente = signal(Boolean(this.auth.tokenBloqueo) || this.accesoLimitado());
  protected texto = '';
  protected imagen: File | null = null;
  protected vistaPreviaImagen: string | null = null;
  private version = 0;
  private actualizando = false;
  protected readonly mensajesApelacion = mensajesApelacion;

  protected get puedeApelar(): boolean {
    const detalle = this.bloqueo();
    const texto = this.texto.trim();
    return !!detalle && this.accesoVigente() && !this.ocupado() &&
      texto.length > 0 && texto.length <= 2000;
  }

  constructor() {
    this.destroyRef.onDestroy(() => this.liberarVistaPrevia());
    if (this.accesoVigente()) this.consultar();
    if (isPlatformBrowser(inject(PLATFORM_ID)))
      timer(15_000, 15_000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.actualizarSilencioso());
  }

  private actualizarSilencioso(): void {
    if (!this.accesoVigente() || this.ocupado() || this.actualizando) return;
    const version = this.version;
    this.actualizando = true;
    this.auth.consultarBloqueo(this.auth.tokenBloqueo).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.actualizando = false; })).subscribe({
      next: bloqueo => { if (version === this.version && !this.ocupado()) this.bloqueo.set(bloqueo); },
      error: (error: ApiError) => {
        if (version === this.version && !this.ocupado() && (error.status === 401 || error.status === 403)) this.mostrarError(error);
      },
    });
  }

  protected consultar(): void {
    const token = this.auth.tokenBloqueo;
    if (!this.accesoVigente() || this.ocupado()) return;
    this.ocupado.set(true);
    this.error.set('');
    this.auth.consultarBloqueo(token).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (bloqueo) => {
        this.bloqueo.set(bloqueo);
        this.ocupado.set(false);
      },
      error: (error: ApiError) => this.mostrarError(error),
    });
  }

  protected apelar(): void {
    if (!this.puedeApelar) return;
    const token = this.auth.tokenBloqueo;
    const texto = this.texto.trim();
    this.version++;
    this.ocupado.set(true);
    this.error.set('');
    this.auth.apelarBloqueo(token, texto, this.imagen).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (bloqueo) => {
        this.bloqueo.set(bloqueo);
        this.texto = '';
        this.quitarImagen();
        this.ocupado.set(false);
      },
      error: (error: ApiError) => this.mostrarError(error),
    });
  }

  protected seleccionarImagen(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) return;
    if (!['image/jpeg', 'image/png'].includes(archivo.type) || archivo.size > 5 * 1024 * 1024) {
      this.error.set('Elegí una imagen JPEG o PNG de hasta 5 MB.');
      return;
    }
    this.error.set('');
    this.liberarVistaPrevia();
    this.imagen = archivo;
    this.vistaPreviaImagen = URL.createObjectURL(archivo);
  }

  protected quitarImagen(): void {
    this.liberarVistaPrevia();
    this.imagen = null;
  }

  private liberarVistaPrevia(): void {
    if (this.vistaPreviaImagen) URL.revokeObjectURL(this.vistaPreviaImagen);
    this.vistaPreviaImagen = null;
  }

  protected apelarConEnter(evento: Event): void {
    const tecla = evento as KeyboardEvent;
    if (tecla.shiftKey || tecla.isComposing) return;
    tecla.preventDefault();
    this.apelar();
  }

  private mostrarError(error: ApiError): void {
    this.ocupado.set(false);
    this.error.set(error.message);
    if (error.status === 401 || error.status === 403) {
      this.auth.tokenBloqueo = null;
      this.accesoVigente.set(false);
      this.bloqueo.set(null);
    }
  }
}
