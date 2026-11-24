import { ConversationPanelComponent, mensajesApelacion } from '../../../shared/components/conversation-panel/conversation-panel.component';
import { CargaImagenesComponent } from '../../../shared/components/carga-imagenes/carga-imagenes.component';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideCalendar, LucideLockKeyhole, LucideMessageCircle, LucideSend } from '@lucide/angular';
import { ApiError } from '../../../core/interceptors/api-error';
import { AuthService, type VistaBloqueo } from '../../../core/services/auth.service';
import { finalize, timer } from 'rxjs';

@Component({
  selector: 'app-cuenta-bloqueada',
  imports: [DatePipe, FormsModule, RouterLink, ConversationPanelComponent, CargaImagenesComponent, LucideArrowLeft, LucideCalendar,
    LucideLockKeyhole, LucideMessageCircle, LucideSend],
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
  /** El back admite una imagen por mensaje; `app-carga-imagenes` la valida. */
  protected readonly imagenes = signal<File[]>([]);
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
    this.auth.apelarBloqueo(token, texto, this.imagenes()[0] ?? null).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (bloqueo) => {
        this.bloqueo.set(bloqueo);
        this.texto = '';
        this.imagenes.set([]);
        this.ocupado.set(false);
      },
      error: (error: ApiError) => this.mostrarError(error),
    });
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
