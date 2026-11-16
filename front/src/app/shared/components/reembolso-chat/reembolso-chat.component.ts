import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { EMPTY, Subject, catchError, exhaustMap, expand, finalize, merge, timer } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface Mensaje {
  id: number;
  autor: string;
  administracion: boolean;
  texto: string;
  creado_en: string;
}

interface Conversacion {
  abierta: boolean;
  mensajes: Mensaje[];
}

@Component({
  selector: 'app-reembolso-chat',
  imports: [DatePipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-label="Conversación de reembolso">
      <h3>Conversación de reembolso</h3>
      <p>Administración y el inquilino pueden coordinar acá la transferencia.</p>
      <div class="mensajes" role="log" aria-label="Mensajes">
        @for (mensaje of mensajes(); track mensaje.id) {
          <article>
            <strong>{{ mensaje.autor }} · {{ mensaje.administracion ? 'Administración' : 'Inquilino' }}</strong>
            <small>{{ mensaje.creado_en | date:'dd/MM HH:mm' }}</small>
            <p>{{ mensaje.texto }}</p>
          </article>
        } @empty {
          @if (abierta() !== null) { <p>Todavía no hay mensajes.</p> }
        }
      </div>
      @if (error()) { <p role="alert">{{ error() }}</p> }
      @if (abierta()) {
        <label for="mensaje-reembolso-{{ reembolsoId() }}">Mensaje</label>
        <textarea id="mensaje-reembolso-{{ reembolsoId() }}" [(ngModel)]="borrador"
          [ngModelOptions]="{ standalone: true }" rows="3" maxlength="1000"
          [disabled]="enviando()"></textarea>
        <button type="button" [disabled]="enviando() || !borrador.trim()" (click)="enviar()">Enviar mensaje</button>
      } @else if (abierta() === false) {
        <p>La conversación está cerrada.</p>
      }
    </section>
  `,
  styles: `
    :host { display: block; }
    section { padding: 16px; border: 1px solid #dce4e8; border-radius: 10px; background: #f8fafb; }
    h3 { margin: 0; }
    .mensajes { display: grid; gap: 8px; max-height: 18rem; overflow-y: auto; }
    article { padding: 8px 10px; border-radius: 6px; background: white; overflow-wrap: anywhere; }
    article p { margin: 4px 0 0; white-space: pre-wrap; }
    small { margin-inline-start: 8px; color: #526773; }
    label { display: block; margin-top: 10px; }
    textarea { box-sizing: border-box; width: 100%; padding: 8px; }
    button { margin-top: 6px; padding: 6px 12px; cursor: pointer; }
  `,
})
export class ReembolsoChatComponent {
  readonly reembolsoId = input.required<number>();
  private readonly http = inject(HttpClient);
  private readonly actualizar = new Subject<void>();
  protected readonly abierta = signal<boolean | null>(null);
  protected readonly mensajes = signal<Mensaje[]>([]);
  protected readonly error = signal('');
  protected readonly enviando = signal(false);
  protected borrador = '';

  constructor() {
    effect(onCleanup => {
      const id = this.reembolsoId();
      this.mensajes.set([]);
      this.abierta.set(null);
      this.error.set('');
      const consulta = merge(timer(0, 5000), this.actualizar).pipe(exhaustMap(() =>
        this.leer(id, this.mensajes().at(-1)?.id ?? 0).pipe(
          expand(pagina => pagina.mensajes.length === 100 ? this.leer(id, pagina.mensajes[99].id) : EMPTY),
          catchError(() => {
            this.error.set('No se pudo actualizar la conversación.');
            return EMPTY;
          }),
        ),
      )).subscribe(pagina => {
        if (!this.enviando()) this.error.set('');
        this.abierta.set(pagina.abierta);
        this.mensajes.update(actuales => [...actuales, ...pagina.mensajes]);
      });
      onCleanup(() => consulta.unsubscribe());
    });
  }

  private leer(id: number, despuesDe: number) {
    return this.http.get<Conversacion>(`${environment.apiUrl}/reembolsos/${id}/conversacion`, { params: { despuesDe } });
  }

  private readonly destruir = takeUntilDestroyed();

  protected enviar(): void {
    const texto = this.borrador.trim();
    if (!texto || this.enviando() || !this.abierta()) return;
    this.enviando.set(true);
    this.error.set('');
    this.http.post(`${environment.apiUrl}/reembolsos/${this.reembolsoId()}/conversacion`, { texto }).pipe(
      this.destruir,
      finalize(() => this.enviando.set(false)),
    ).subscribe({
      next: () => {
        this.borrador = '';
        this.actualizar.next();
      },
      error: (error: Error) => this.error.set(error.message),
    });
  }
}
