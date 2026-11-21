import { ConversationPanelComponent } from '../conversation-panel/conversation-panel.component';
import { AuthService } from '../../../core/services/auth.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ParticipanteReclamo, Reclamo, ReclamoEvidencia, ReclamoMensaje } from '../../services/reservation.service';

@Component({
  selector: 'app-claim-history',
  imports: [CurrencyPipe, DatePipe, RouterLink, ConversationPanelComponent],
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
    @if (item.reserva?.monto_pago; as monto) {
      <p class="meta">Importe de la reserva: <strong class="amount">{{ monto | currency:(item.reserva?.moneda_contratada || 'ARS') }}</strong></p>
    }
    @if (item.resolucion) {
      <div class="resolution" role="status">
        <p class="resolution__title">Reclamo resuelto</p>
        @if (item.resolucion === 'SIN_DEVOLUCION') {
          <p>A favor del anunciante: sin devolución al inquilino.</p>
        } @else {
          <p>
            A favor del inquilino: {{ resoluciones[item.resolucion].toLowerCase() }}
            @if (item.importe_reembolso) {<span> de {{ item.importe_reembolso | currency:(item.reserva?.moneda_contratada || 'ARS') }}</span>}.
            {{ administracion() ? 'La devolución se gestiona en Reembolsos.' : 'La devolución se sigue desde el detalle de la reserva.' }}
          </p>
        }
        @if (item.resuelto_en) { <p class="meta">Resuelto el {{ item.resuelto_en | date:'dd/MM/yyyy, HH:mm' }}</p> }
        @if (mostrarVerReembolso() && item.resolucion !== 'SIN_DEVOLUCION') {
          <button type="button" class="resolution__action" (click)="verReembolso.emit(item)">Ver reembolso</button>
        }
      </div>
    }
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
    <app-conversation-panel titulo="Conversación del reclamo" [mensajes]="mensajes()">
      <ng-content />
    </app-conversation-panel>
  `,
  styles: `
    :host { display: grid; gap: .6rem; min-width: 0; }
    header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: .6rem; }
    h3, p { margin: 0; }
    h3 { font-size: 1.1rem; font-weight: 700; overflow-wrap: anywhere; }
    .meta { color: #526475; font-size: .84rem; }
    .amount { color: #101d36; }
    .status { background: #fff1d8; color: #74470a; padding: .25rem .65rem; border-radius: 1rem; font-size: .8rem; font-weight: 700; }
    .status--resolved, .resolution { background: #edf6f2; color: #205c46; }
    .body { white-space: pre-wrap; overflow-wrap: anywhere; }
    .attachments { display: flex; flex-wrap: wrap; gap: .45rem; }
    .attachments button { max-width: 100%; overflow-wrap: anywhere; padding: .4rem .65rem; border: 1px solid #d9e3ea; border-radius: .45rem; background: #fff; color: #204b66; cursor: pointer; }
    .resolution { display: grid; gap: .3rem; justify-items: start; padding: .75rem .9rem; border-radius: .6rem; border: 1px solid #b9dccb; }
    .resolution__title { font-weight: 800; }
    .resolution__action {
      margin-top: .25rem; padding: .45rem .8rem; border: 1px solid #205c46; border-radius: .45rem;
      background: #fff; color: #205c46; font-weight: 700; cursor: pointer;
    }
    .resolution__action:hover, .resolution__action:focus-visible { background: #205c46; color: #fff; }
    :host(.administracion) { color: #101d36; gap: .75rem; }
    :host(.administracion) h3 { margin-top: .2rem; font-size: 1.45rem; }
    .context-card, .claim-description .body {
      border: 1px solid #dce4ef;
      border-radius: .65rem;
    }
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
    @media (max-width: 900px) {
      .claim-context { grid-template-columns: 1fr; }
    }
  `,
})
export class ClaimHistoryComponent {
  readonly reclamo = input.required<Reclamo>();
  readonly administracion = input(false);
  /** Cada pantalla decide a dónde lleva el reembolso; este componente solo lo ofrece si hubo devolución. */
  readonly mostrarVerReembolso = input(false);
  readonly verReembolso = output<Reclamo>();
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
  private readonly auth = inject(AuthService);
  protected readonly mensajes = computed(() => [...(this.reclamo().mensajes ?? [])]
    .sort((a, b) => a.id - b.id)
    .map(mensaje => ({
      id: mensaje.id, autor: this.nombreCompleto(mensaje.autor) || 'Usuario',
      texto: mensaje.texto, fecha: mensaje.creado_en,
      rol: this.rolMensaje(mensaje), interno: mensaje.visible_para === 'ADMIN',
      propio: mensaje.autor?.id === Number(this.auth.currentUser()?.sub),
    })));
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
