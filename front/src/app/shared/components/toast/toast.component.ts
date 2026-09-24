import { Component, inject } from '@angular/core';
import { LucideCircleAlert, LucideX } from '@lucide/angular';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [LucideCircleAlert, LucideX],
  template: `
    @if (toast.mensaje(); as mensaje) {
      <div class="toast" role="status" aria-live="polite">
        <svg lucideCircleAlert [size]="21" aria-hidden="true"></svg>
        <span>{{ mensaje }}</span>
        <button type="button" aria-label="Cerrar aviso" (click)="toast.cerrar()">
          <svg lucideX [size]="18" aria-hidden="true"></svg>
        </button>
      </div>
    }
  `,
  styles: `
    .toast {
      position: fixed;
      right: 1rem;
      bottom: 1rem;
      z-index: 100;
      display: flex;
      width: min(26rem, calc(100vw - 2rem));
      align-items: flex-start;
      gap: .7rem;
      padding: .9rem 1rem;
      border-radius: 10px;
      background: #1d2939;
      color: #fff;
      font-size: .9rem;
      font-weight: 700;
      line-height: 1.4;
      box-shadow: 0 12px 30px rgba(16, 24, 40, .28);
      animation: toast-in .3s ease both;
    }
    .toast > svg { flex: 0 0 auto; color: var(--color-accent); margin-top: .05rem; }
    .toast span { flex: 1; }
    .toast button { display: grid; flex: 0 0 auto; padding: .1rem; border: 0; background: transparent; color: #fff; cursor: pointer; opacity: .8; }
    .toast button:hover { opacity: 1; }
    .toast button:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
    @keyframes toast-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
  `,
})
export class ToastComponent {
  protected readonly toast = inject(ToastService);
}
