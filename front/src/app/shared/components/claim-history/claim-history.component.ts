import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ParticipanteReclamo, Reclamo, ReclamoEvidencia, ReclamoMensaje } from '../../services/reservation.service';

@Component({
  selector: 'app-claim-history',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  host: { '[class.administracion]': 'administracion()' },
  template: `
    @let item = reclamo();
    <header>
      <div>
        <p class="meta">Reclamo #{{ item.id }} · Reserva #{{ item.reserva?.id ?? '—' }}</p>
        <h3>{{ item.reserva?.publicacion?.titulo || categorias[item.categoria] }}</h3>
      </div>
      <span class="status" [class.status--resolved]="item.resuelto_en || item.estado === 'CERRADO'">
        {{ estados[item.estado] }}
      </span>
    </header>
    <p class="meta">{{ categorias[item.categoria] }} · {{ item.creado_en | date:'dd/MM/yyyy, HH:mm' }}</p>
    @if (administracion()) {
      <div class="claim-context">
        @for (parte of participantes(); track parte.rol) {
          <div class="context-card">
            <span class="initials" [class.initials--tenant]="parte.rol === 'Inquilino'" aria-hidden="true">
              {{ iniciales(parte.usuario) }}
            </span>
            <div>
              <p class="meta">{{ parte.rol }}</p>
              <p class="context-name">{{ nombreCompleto(parte.usuario) || 'Sin datos' }}</p>
              @if (parte.usuario; as usuario) {
                <a [routerLink]="['/admin/usuarios', usuario.id]"
                   [attr.aria-label]="'Ver perfil de ' + (nombreCompleto(usuario) || parte.rol)">
                  Ver perfil <span aria-hidden="true">→</span>
                </a>
              }
            </div>
          </div>
        }
        <div class="context-card">
          @if (item.reserva?.publicacion?.imagenes?.[0]?.url; as portada) {
            <img class="listing-cover" [src]="portada" alt="" loading="lazy" (error)="ocultarPortada($event)" />
          }
          <div>
            <p class="meta">Publicación de la reserva</p>
            <p class="context-name">{{ item.reserva?.publicacion?.titulo || 'Sin datos' }}</p>
            @if (item.reserva?.publicacion?.id; as id) {
              <a [routerLink]="['/admin/publicaciones', id]">Ver publicación <span aria-hidden="true">→</span></a>
            }
          </div>
        </div>
      </div>
      <div class="claim-description">
        <h4>Detalle del reclamo</h4>
        <p class="body">{{ item.descripcion }}</p>
      </div>
    } @else {
      <p class="body">{{ item.descripcion }}</p>
    }
    @if (item.evidencias?.length) {
      <div class="attachments" aria-label="Imágenes adjuntas">
        @for (archivo of item.evidencias; track archivo.id) {
          <button type="button" (click)="verArchivo.emit(archivo)">{{ archivo.nombre_archivo }}</button>
        }
      </div>
    }
    <details [open]="administracion()">
      <summary>Historial de mensajes ({{ mensajes().length }})</summary>
      <ol>
        @for (mensaje of mensajes(); track mensaje.id) {
          <li>
            <strong>{{ nombreCompleto(mensaje.autor) || 'Usuario' }}</strong>
            @if (administracion() && rolMensaje(mensaje); as rol) {
              <span class="meta"> · {{ rol }}</span>
            }
            @if (mensaje.visible_para === 'ADMIN') { <span class="meta"> · Nota interna</span> }
            <time class="meta" [class.message-date]="administracion()" [attr.datetime]="mensaje.creado_en">
              @if (!administracion()) { · }
              {{ mensaje.creado_en | date:'dd/MM/yyyy, HH:mm' }}
            </time>
            <p class="body">{{ mensaje.texto }}</p>
          </li>
        } @empty {
          <li class="meta">Todavía no hay mensajes.</li>
        }
      </ol>
    </details>
    @if (item.resolucion) {
      <div class="resolution">
        <strong>{{ resoluciones[item.resolucion] }}</strong>
        @if (item.importe_reembolso) { · {{ item.importe_reembolso | currency:'ARS' }} }
        @if (item.resuelto_en) { <p class="meta">{{ item.resuelto_en | date:'dd/MM/yyyy, HH:mm' }}</p> }
      </div>
    }
  `,
  styles: `
    :host { display: grid; gap: .6rem; min-width: 0; }
    header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: .6rem; }
    h3, p { margin: 0; }
    h3 { font-size: 1.1rem; font-weight: 700; overflow-wrap: anywhere; }
    .meta { color: #526475; font-size: .84rem; }
    .status { background: #fff1d8; color: #74470a; padding: .25rem .65rem; border-radius: 1rem; font-size: .8rem; font-weight: 700; }
    .status--resolved, .resolution { background: #edf6f2; color: #205c46; }
    .body { white-space: pre-wrap; overflow-wrap: anywhere; }
    .attachments { display: flex; flex-wrap: wrap; gap: .45rem; }
    .attachments button { max-width: 100%; overflow-wrap: anywhere; padding: .4rem .65rem; border: 1px solid #d9e3ea; border-radius: .45rem; background: #fff; color: #204b66; cursor: pointer; }
    details, .resolution { padding: .75rem; border-radius: .6rem; }
    details { background: #f4f7fa; }
    summary { cursor: pointer; font-weight: 650; }
    ol { display: grid; gap: .5rem; list-style: none; padding: 0; margin: .6rem 0 0; }
    li { background: #fff; padding: .65rem; border-radius: .45rem; }
    :host(.administracion) { color: #101d36; gap: .75rem; }
    :host(.administracion) h3 { margin-top: .2rem; font-size: 1.45rem; }
    :host(.administracion) details, .context-card, .claim-description .body {
      border: 1px solid #dce4ef;
      border-radius: .65rem;
    }
    :host(.administracion) details { background: #eef2f8; }
    .claim-context {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: .75rem;
      margin-block: .25rem;
    }
    .context-card {
      display: flex;
      align-items: center;
      gap: .85rem;
      padding: .9rem;
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .context-name { margin-block: .2rem; font-weight: 750; }
    .context-card a { color: #124db9; font-weight: 650; }
    .initials {
      flex: none;
      display: grid;
      place-items: center;
      width: 3.2rem;
      height: 3.2rem;
      border-radius: 50%;
      background: #d4dfff;
      color: #172f6b;
      font-weight: 800;
    }
    .initials--tenant { background: #e9dcfa; color: #422668; }
    .listing-cover { width: clamp(3.5rem, 7vw, 7rem); aspect-ratio: 3 / 2; object-fit: cover; border-radius: .5rem; }
    .claim-description h4 { margin: 0 0 .35rem; }
    .claim-description .body { padding: .6rem .8rem; background: #f6f8fb; }
    .message-date { display: block; }
    @media (max-width: 900px) {
      .claim-context { grid-template-columns: 1fr; }
    }
  `,
})
export class ClaimHistoryComponent {
  readonly reclamo = input.required<Reclamo>();
  readonly administracion = input(false);
  protected readonly participantes = computed(() => [
    { rol: 'Anunciante', usuario: this.reclamo().anunciante },
    { rol: 'Inquilino', usuario: this.reclamo().inquilino },
  ]);

  protected nombreCompleto(usuario?: ParticipanteReclamo | null): string {
    return [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ').trim();
  }

  protected iniciales(usuario?: ParticipanteReclamo | null): string {
    return [usuario?.nombre, usuario?.apellido].map((nombre) => nombre?.trim().charAt(0)).join('').toUpperCase() || '?';
  }

  protected rolMensaje(mensaje: ReclamoMensaje): string {
    const autor = mensaje.autor;
    if (!autor) return '';
    if (autor.rol?.nombre === 'Administrador') return 'Admin';
    if (autor.id === this.reclamo().inquilino?.id) return 'Inquilino';
    if (autor.id === this.reclamo().anunciante?.id) return 'Anunciante';
    return '';
  }

  protected ocultarPortada(evento: Event): void {
    (evento.target as HTMLImageElement).hidden = true;
  }
  readonly verArchivo = output<ReclamoEvidencia>();
  protected readonly mensajes = computed(() => [...(this.reclamo().mensajes ?? [])].sort((a, b) => a.id - b.id));
  protected readonly categorias = {
    LIMPIEZA: 'Limpieza', MANTENIMIENTO: 'Mantenimiento', INGRESO: 'Problemas de ingreso',
    DESCRIPCION: 'La propiedad no coincide', OTRO: 'Otro motivo',
  };
  protected readonly estados = {
    ABIERTO: 'Recibido', EN_REVISION: 'En revisión', RESUELTO_INQUILINO: 'Resuelto',
    RESUELTO_ANUNCIANTE: 'Resuelto', CERRADO: 'Cerrado',
  };
  protected readonly resoluciones = {
    SIN_DEVOLUCION: 'Cerrado sin devolución', DEVOLUCION_TOTAL: 'Devolución total',
    DEVOLUCION_PARCIAL: 'Devolución parcial',
  };
}
