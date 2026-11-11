import { Component, inject } from '@angular/core';
import { LucideCircleAlert, LucideCheck, LucideX } from '@lucide/angular';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [LucideCircleAlert, LucideCheck, LucideX],
  template: `
    @if (toast.aviso(); as aviso) {
      <div [class]="'toast toast--' + aviso.tipo">
        <span class="toast__icon" aria-hidden="true">
          @if (aviso.tipo === 'exito') {
            <svg lucideCheck [size]="20"></svg>
          } @else {
            <svg lucideCircleAlert [size]="20"></svg>
          }
        </span>
        <span class="toast__message" [attr.role]="aviso.tipo === 'error' ? 'alert' : 'status'">
          {{ aviso.mensaje }}
        </span>
        <button type="button" aria-label="Cerrar aviso" (click)="toast.cerrar()">
          <svg lucideX [size]="18" aria-hidden="true"></svg>
        </button>
      </div>
    }
  `,
  styles: `
    .toast {
      position: fixed;
      right: max(1rem, env(safe-area-inset-right));
      bottom: max(1rem, env(safe-area-inset-bottom));
      z-index: 100;
      display: flex;
      width: min(26rem, calc(100vw - 2rem));
      align-items: center;
      gap: .75rem;
      padding: .75rem;
      border: 1px solid #dbe5e9;
      border-inline-start: 4px solid var(--toast-accent);
      border-radius: 12px;
      background: #fff;
      color: #172a34;
      font-size: .9rem;
      font-weight: 600;
      line-height: 1.4;
      box-shadow: 0 12px 32px rgba(16, 24, 40, .18);
      animation: toast-in .3s ease both;
      --toast-accent: #285879;
      --toast-tint: #eaf3fa;
    }
    .toast--exito { --toast-accent: #126347; --toast-tint: #e6f6ed; }
    .toast--error { --toast-accent: #9e2020; --toast-tint: #ffeded; }
    .toast--advertencia { --toast-accent: #855009; --toast-tint: #fff3dc; }
    .toast__icon {
      display: grid;
      place-items: center;
      flex: 0 0 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      background: var(--toast-tint);
      color: var(--toast-accent);
    }
    .toast__message { flex: 1; min-width: 0; overflow-wrap: anywhere; }
    .toast button {
      display: grid;
      place-items: center;
      flex: 0 0 2.75rem;
      height: 2.75rem;
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: #41535e;
      cursor: pointer;
    }
    .toast button:hover { background: #eef3f5; }
    .toast button:focus-visible { outline: 2px solid var(--toast-accent); outline-offset: 2px; }
    @keyframes toast-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
    @media (prefers-reduced-motion: reduce) { .toast { animation: none; } }
  `,
})
export class ToastComponent {
  protected readonly toast = inject(ToastService);
}
