import { Component, input } from '@angular/core';
import type { RevisionVerificacion } from '../../models/perfil.model';

@Component({
  selector: 'app-historial-verificacion',
  template: `
    <ul class="history">
      @for (revision of revisiones(); track revision.id) {
        <li>
          <span class="acct-badge" [class.acct-badge--ok]="revision.estado === 'aprobada'"
            [class.acct-badge--error]="revision.estado === 'rechazada'">
            {{ revision.estado }}
          </span>
          <div>
            <strong>Revisión #{{ revision.numero_revision }}</strong> · {{ fecha(revision.creada_en) }}
            @if (revision.identidad_aprobada != null) {
              <p>Identidad {{ revision.identidad_aprobada ? 'aprobada' : 'rechazada' }}.</p>
            }
            @if (revision.cbu_aprobado != null) {
              <p>CBU {{ revision.cbu_aprobado ? 'aprobado' : 'rechazado' }}.</p>
            }
            @if (revision.motivo) { <p>{{ revision.motivo }}</p> }
          </div>
        </li>
      }
    </ul>
  `,
  styles: `
    .history { list-style: none; margin: 0; padding: 0; }
    .history li {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.7rem 0;
      border-bottom: 1px solid var(--color-border);
      font-size: 0.9rem;
    }
    .history li:last-child { border-bottom: 0; }
    .history .acct-badge { text-transform: capitalize; min-width: 84px; justify-content: center; }
    .history p { margin: 0.25rem 0 0; color: var(--color-text-muted); overflow-wrap: anywhere; }
  `,
})
export class HistorialVerificacionComponent {
  readonly revisiones = input.required<readonly RevisionVerificacion[]>();

  protected fecha(valor: string): string {
    return new Date(valor).toLocaleString('es-AR', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Argentina/Buenos_Aires',
    });
  }
}
