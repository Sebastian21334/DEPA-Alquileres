import { DatePipe } from '@angular/common';
import { afterRenderEffect, Component, computed, ElementRef, input, viewChild } from '@angular/core';
import { LucideMessageCircle } from '@lucide/angular';
import { AvatarComponent } from '../avatar/avatar.component';

export interface MensajeConversacion {
  id: number | string;
  autor: string;
  texto: string;
  fecha: string;
  rol?: string;
  foto?: string | null;
  propio?: boolean;
  interno?: boolean;
  leido?: boolean;
}

export function mensajesApelacion(detalle: {
  apelacion?: { texto: string; fecha: string } | null;
  respuesta?: { texto: string; fecha: string } | null;
}, autor: string, propia: boolean): MensajeConversacion[] {
  const mensajes: MensajeConversacion[] = [];
  if (detalle.apelacion) mensajes.push({ id: 'apelacion', autor, propio: propia, ...detalle.apelacion });
  if (detalle.respuesta) mensajes.push({ id: 'respuesta', autor: 'Administración', ...detalle.respuesta });
  return mensajes;
}

@Component({
  selector: 'app-conversation-panel',
  imports: [AvatarComponent, DatePipe, LucideMessageCircle],
  template: `
    @if (titulo()) {
      <header><svg lucideMessageCircle [size]="26" aria-hidden="true"></svg>
        <div><h4>{{ titulo() }}</h4>@if (subtitulo()) { <p>{{ subtitulo() }}</p> }</div>
      </header>
    }
    <div class="hilo" #hilo role="log" aria-label="Mensajes" tabindex="0">
      @for (grupo of grupos(); track grupo.dia) {
        <div class="fecha"><span>{{ grupo.etiqueta }}</span></div>
        @for (mensaje of grupo.mensajes; track mensaje.id) {
          <article [class.propio]="mensaje.propio">
            <app-avatar class="avatar" [nombre]="mensaje.autor" [foto]="mensaje.foto ?? null" [usarDosIniciales]="true" aria-hidden="true" />
            <div class="mensaje">
              <div class="autor"><strong>{{ mensaje.autor }}</strong>
                @if (mensaje.rol) { <span>· {{ mensaje.rol }}</span> }
                @if (mensaje.interno) { <span class="nota">Nota interna</span> }
              </div>
              <p class="burbuja" [class.interna]="mensaje.interno">{{ mensaje.texto }}</p>
              <div class="hora"><time [attr.datetime]="mensaje.fecha">{{ mensaje.fecha | date:'HH:mm' }}</time>
                @if (mensaje.leido !== undefined) {
                  <span [attr.aria-label]="mensaje.leido ? 'Leído' : 'Enviado'">{{ mensaje.leido ? '✓✓' : '✓' }}</span>
                }
              </div>
            </div>
          </article>
        }
      } @empty {
        <p class="vacio">{{ vacio() }}</p>
      }
    </div>
    <ng-content />
  `,
  styles: `
    :host { display: flex; flex-direction: column; min-width: 0; min-height: 0; overflow: hidden; border: 1px solid #d5deee; border-radius: 12px; background: #fff; color: #121b36; }
    header { display: flex; align-items: flex-start; gap: 12px; padding: 15px 20px; border-bottom: 1px solid #d5deee; }
    header svg { color: #1648f5; flex: none; }
    h4, header p, .burbuja { margin: 0; }
    h4 { font-size: 1rem; }
    header p { margin-top: 3px; font-size: .88rem; color: #52607a; }
    .hilo { flex: 1 1 auto; min-height: 110px; max-height: var(--conversation-height, 330px); overflow-y: auto; padding: 14px clamp(10px, 3vw, 24px); background: #f3f6fc; }
    .fecha { display: flex; align-items: center; gap: 12px; margin: 4px 0 14px; color: #52607a; font-size: .8rem; }
    .fecha::before, .fecha::after { content: ''; height: 1px; background: #d2dbea; flex: 1; }
    article { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px; }
    article.propio { flex-direction: row-reverse; text-align: right; }
    .avatar { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; flex: none; border-radius: 50%; background: #d3e1fb; color: #173a9e; font-size: .83rem; font-weight: 750; }
    .mensaje { min-width: 0; max-width: 85%; }
    .autor { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-bottom: 5px; font-size: .79rem; }
    .propio .autor { justify-content: flex-end; }
    .autor span, .hora { color: #52607a; }
    .autor .nota { padding: 2px 5px; border-radius: 4px; background: #fff0cb; color: #694500; }
    .burbuja { display: inline-block; padding: 8px 11px; border-radius: 6px 11px 11px; background: #dbe8ff; text-align: left; white-space: pre-wrap; overflow-wrap: anywhere; font-size: .92rem; }
    .propio .burbuja { border-radius: 11px 6px 11px 11px; background: #e3eaff; }
    .burbuja.interna { background: #fff0cb; }
    .hora { margin-top: 4px; font-size: .72rem; }
    .hora span { margin-inline-start: 4px; }
    .vacio { margin: 16px 0; color: #52607a; font-size: .88rem; text-align: center; }
  `,
})
export class ConversationPanelComponent {
  readonly titulo = input('');
  readonly subtitulo = input('');
  readonly mensajes = input.required<MensajeConversacion[]>();
  readonly vacio = input('Todavía no hay mensajes.');
  private readonly hilo = viewChild.required<ElementRef<HTMLElement>>('hilo');
  private readonly fecha = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' });
  protected readonly grupos = computed(() => {
    const grupos = new Map<string, { dia: string; etiqueta: string; mensajes: MensajeConversacion[] }>();
    for (const mensaje of this.mensajes()) {
      const fecha = new Date(mensaje.fecha);
      const dia = fecha.toDateString();
      const grupo = grupos.get(dia);
      if (grupo) grupo.mensajes.push(mensaje);
      else grupos.set(dia, { dia, etiqueta: Number.isNaN(+fecha) ? 'Sin fecha' : this.fecha.format(fecha), mensajes: [mensaje] });
    }
    return [...grupos.values()];
  });
  private ultimoId: MensajeConversacion['id'] | undefined;

  constructor() {
    afterRenderEffect(() => {
      const ultimo = this.mensajes().at(-1)?.id;
      const hilo = this.hilo().nativeElement;
      if (ultimo !== this.ultimoId) hilo.scrollTop = hilo.scrollHeight;
      this.ultimoId = ultimo;
    });
  }
}
