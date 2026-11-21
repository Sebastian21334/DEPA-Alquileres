import { ConversationPanelComponent, mensajesApelacion } from '../../../shared/components/conversation-panel/conversation-panel.component';
import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideCalendar, LucideLockKeyhole, LucideMessageCircle, LucideSend } from '@lucide/angular';
import { ApiError } from '../../../core/interceptors/api-error';
import { AuthService, type VistaBloqueo } from '../../../core/services/auth.service';

@Component({
  selector: 'app-cuenta-bloqueada',
  imports: [DatePipe, FormsModule, RouterLink, ConversationPanelComponent, LucideArrowLeft, LucideCalendar,
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
  protected readonly mensajesApelacion = mensajesApelacion;

  protected get puedeApelar(): boolean {
    const detalle = this.bloqueo();
    const texto = this.texto.trim();
    return !!detalle && !detalle.apelacion && this.accesoVigente() && !this.ocupado() &&
      texto.length > 0 && texto.length <= 2000;
  }

  constructor() {
    if (this.accesoVigente()) this.consultar();
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
    this.ocupado.set(true);
    this.error.set('');
    this.auth.apelarBloqueo(token, texto).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (bloqueo) => {
        this.bloqueo.set(bloqueo);
        this.texto = '';
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
