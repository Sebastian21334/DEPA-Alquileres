import { DatePipe } from '@angular/common';
import { afterRenderEffect, Component, computed, ElementRef, input, signal, viewChild } from '@angular/core';
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
  leido?: boolean;
  imagen?: string;
  /** Imágenes adjuntas al mensaje (reclamos). */
  imagenes?: { url: string; nombre: string }[];
}

export function mensajesApelacion(detalle: {
  apelacion?: { texto: string; fecha: string } | null;
  respuesta?: { texto: string; fecha: string } | null;
  mensajes?: { id: string; autor: 'usuario' | 'administracion'; texto: string; fecha: string; imagen?: string }[] | null;
}, autor: string, propia: boolean): MensajeConversacion[] {
  if (detalle.mensajes) return detalle.mensajes.map(mensaje => ({
    ...mensaje, autor: mensaje.autor === 'usuario' ? autor : 'Administración',
    propio: mensaje.autor === 'usuario' ? propia : !propia,
  }));
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
        @if (permitirAmpliar()) {
          <button class="ampliar" type="button" [attr.aria-expanded]="ampliado()" (click)="ampliado.set(!ampliado())">{{ ampliado() ? 'Reducir chat' : 'Ampliar chat' }}</button>
        }
      </header>
    }
    <div class="hilo" [class.hilo--ampliado]="ampliado()" #hilo role="log" aria-label="Mensajes" tabindex="0">
      @for (grupo of grupos(); track grupo.dia) {
        <div class="fecha"><span>{{ grupo.etiqueta }}</span></div>
        @for (mensaje of grupo.mensajes; track mensaje.id) {
          <article [class.propio]="mensaje.propio">
            <app-avatar class="avatar" [nombre]="mensaje.autor" [foto]="mensaje.foto ?? null" [usarDosIniciales]="true" aria-hidden="true" />
            <div class="mensaje">
              <div class="autor"><strong>{{ mensaje.autor }}</strong>
                @if (mensaje.rol) { <span>· {{ mensaje.rol }}</span> }
              </div>
              @if (mensaje.texto) { <p class="burbuja">{{ mensaje.texto }}</p> }
              @if (mensaje.imagen) {
                <a class="imagen" [href]="mensaje.imagen" target="_blank" rel="noopener noreferrer" aria-label="Abrir imagen adjunta">
                  <img [src]="mensaje.imagen" alt="Imagen adjunta" loading="lazy" />
                </a>
              }
              @if (mensaje.imagenes?.length) {
                <div class="imagenes" role="group" [attr.aria-label]="'Imágenes de ' + mensaje.autor">
                  @for (imagen of mensaje.imagenes; track $index) {
                    <a [href]="imagen.url" target="_blank" rel="noopener noreferrer" [attr.aria-label]="'Abrir ' + imagen.nombre" [title]="imagen.nombre">
                      <img [src]="imagen.url" [alt]="imagen.nombre" loading="lazy" />
                    </a>
                  }
                </div>
              }
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
    .ampliar { margin-left: auto; padding: 6px 10px; border: 1px solid #d5deee; border-radius: 7px; background: #f6f8ff; color: #1648c5; font: inherit; font-size: .82rem; font-weight: 700; cursor: pointer; }
    .ampliar:focus-visible { outline: 2px solid #1648f5; outline-offset: 2px; }
    h4, header p, .burbuja { margin: 0; }
    h4 { font-size: 1rem; }
    header p { margin-top: 3px; font-size: .88rem; color: #52607a; }
    .hilo { flex: 1 1 auto; min-height: 110px; max-height: var(--conversation-height, 330px); overflow-y: auto; padding: 14px clamp(10px, 3vw, 24px); background: #f3f6fc; }
    .hilo--ampliado { min-height: min(60vh, 600px); max-height: min(60vh, 600px); }
    .fecha { display: flex; align-items: center; gap: 12px; margin: 4px 0 14px; color: #52607a; font-size: .8rem; }
    .fecha::before, .fecha::after { content: ''; height: 1px; background: #d2dbea; flex: 1; }
    article { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px; }
    article.propio { flex-direction: row-reverse; text-align: right; }
    .avatar { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; flex: none; border-radius: 50%; background: #d3e1fb; color: #173a9e; font-size: .83rem; font-weight: 750; }
    .mensaje { min-width: 0; max-width: 85%; }
    .hilo article { animation: mensaje-entrar var(--motion-media) var(--ease-salida) backwards; }
    .hilo article.propio { animation-name: mensaje-entrar-propio; }
    @keyframes mensaje-entrar { from { opacity: 0; translate: -12px 0; } }
    @keyframes mensaje-entrar-propio { from { opacity: 0; translate: 12px 0; } }
    .autor { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-bottom: 5px; font-size: .79rem; }
    .propio .autor { justify-content: flex-end; }
    .autor span, .hora { color: #52607a; }
    .burbuja { display: inline-block; padding: 8px 11px; border-radius: 6px 11px 11px; background: #dbe8ff; text-align: left; white-space: pre-wrap; overflow-wrap: anywhere; font-size: .92rem; }
    .propio .burbuja { border-radius: 11px 6px 11px 11px; background: #e3eaff; }
    .imagen { display: block; margin-top: 6px; }
    .imagen img { display: block; max-width: min(100%, 240px); max-height: 220px; border-radius: 8px; object-fit: contain; }
    .imagenes { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
    .propio .imagenes { justify-content: flex-end; }
    .imagenes a { display: block; border-radius: 8px; }
    .imagenes a:focus-visible { outline: 2px solid #1640f5; outline-offset: 2px; }
    .imagenes img { display: block; width: 96px; height: 96px; border-radius: 8px; object-fit: cover; background: #e3eaff; }
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
  readonly permitirAmpliar = input(false);
  protected readonly ampliado = signal(false);
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
