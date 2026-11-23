import { ConversationPanelComponent } from '../conversation-panel/conversation-panel.component';
import { AuthService } from '../../../core/services/auth.service';
import { CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, inject, input, output, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EMPTY, catchError, exhaustMap, timer } from 'rxjs';
import { ReservationService } from '../../services/reservation.service';
import type { AutorReclamo, ParticipanteReclamo, Reclamo, ReclamoEvidencia, ReclamoMensaje } from '../../services/reservation.service';
import { puedeValidarCodigo } from '../../utils/reservation-state';
import { rolEnReclamo } from '../../utils/reclamo-rol';

/** Mismo ritmo que los chats de mensajes y de reembolsos. */
const INTERVALO_CHAT_MS = 5000;
/** T49: los enlaces de las imágenes vencen a los 15 minutos; se renuevan antes. */
const RENOVAR_ENLACE_MS = 10 * 60 * 1000;

@Component({
  selector: 'app-claim-history',
  imports: [CurrencyPipe, DatePipe, RouterLink, ConversationPanelComponent],
  host: { '[class.administracion]': 'administracion()' },
  template: `
    @let item = reclamo();
    <header>
      <div>
        <p class="meta">Reclamo #{{ item.id }} · Reserva #{{ item.reserva?.id ?? '—' }}
          @if (rolPropio(); as rol) { <span class="rol">Sos el {{ rol }}</span> }
        </p>
        <h3>{{ item.reserva?.publicacion?.titulo || categorias[item.categoria] }}</h3>
      </div>
      <div class="header-actions">
        <span class="status" [class.status--resolved]="item.resuelto_en || item.estado === 'CERRADO'">
          {{ estados[item.estado] }}
        </span>
        <!-- T53: el admin va al detalle de su panel; las partes, al resumen de la reserva. -->
        @if (item.reserva?.id; as idReserva) {
          <a class="ver-reserva" [routerLink]="administracion() ? ['/admin/reservas', idReserva] : ['/reserva/resultado']"
            [queryParams]="administracion() ? { desde: 'reclamos' } : { reserva_id: idReserva }">Ver reserva</a>
        }
      </div>
    </header>
    <p class="meta">{{ categorias[item.categoria] }} · {{ item.creado_en | date:'dd/MM/yyyy, HH:mm' }}</p>
    @if (item.reserva?.monto_pago; as monto) {
      <p class="meta">Importe de la reserva: <strong class="amount">{{ monto | currency:(item.reserva?.moneda_contratada || 'ARS') }}</strong></p>
    }
    @if (item.resolucion) {
      <div class="resolution" role="status">
        <p class="resolution__title">Reclamo resuelto</p>
        @if (item.resolucion === 'SIN_DEVOLUCION' || item.resolucion === 'REINICIAR_CODIGO') {
          <p>{{ item.resolucion === 'REINICIAR_CODIGO'
            ? 'A favor del anunciante: la administración habilitó nuevos intentos para cargar el código.'
            : 'A favor del anunciante: sin devolución al inquilino.' }}</p>
          <!-- Misma regla que el campo del código: solo mientras el anunciante puede cargarlo. -->
          @if (item.reserva && puedeValidarCodigo(item.reserva)) {
            <p>El anunciante ya puede volver a ingresar el código de alojamiento.</p>
          }
        } @else if (item.resolucion === 'CONFIRMAR_INGRESO') {
          <p>A favor del anunciante: la administración confirmó el ingreso sin el código. El pago sigue los plazos habituales.</p>
        } @else {
          <p>
            A favor del inquilino: {{ resoluciones[item.resolucion].toLowerCase() }}
            @if (item.importe_reembolso) {<span> de {{ item.importe_reembolso | currency:(item.reserva?.moneda_contratada || 'ARS') }}</span>}.
            {{ administracion() ? 'La devolución se gestiona en Reembolsos.' : 'La devolución se sigue desde el detalle de la reserva.' }}
          </p>
        }
        @if (item.resuelto_en) { <p class="meta">Resuelto el {{ item.resuelto_en | date:'dd/MM/yyyy, HH:mm' }}</p> }
        @if (mostrarVerReembolso() && (item.resolucion === 'DEVOLUCION_TOTAL' || item.resolucion === 'DEVOLUCION_PARCIAL')) {
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
      <!-- T49: imágenes de la descripción (las que se subieron al crear el reclamo), cada una con su autor. -->
      <ul class="imagenes-reclamo" aria-label="Imágenes del reclamo">
        @for (imagen of item.evidencias; track imagen.id) {
          <li>
            <a [href]="urlImagen(imagen)" target="_blank" rel="noopener noreferrer" [attr.aria-label]="'Abrir ' + imagen.nombre_archivo" [title]="imagen.nombre_archivo">
              <img [src]="urlImagen(imagen)" [alt]="imagen.nombre_archivo" loading="lazy" />
            </a>
            <span>Subida por {{ autorImagen(imagen) }}</span>
          </li>
        }
      </ul>
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
    .header-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
    .rol { display: inline-block; margin-inline-start: .35rem; padding: .1rem .5rem; border-radius: 1rem; background: #e8eeff; color: #1d3b8f; font-size: .78rem; font-weight: 700; }
    .ver-reserva { padding: .3rem .7rem; border: 1px solid #10233f; border-radius: .45rem; color: #10233f; font-size: .82rem; font-weight: 700; text-decoration: none; }
    .ver-reserva:hover, .ver-reserva:focus-visible { background: #10233f; color: #fff; }
    .status--resolved, .resolution { background: #edf6f2; color: #205c46; }
    .body { white-space: pre-wrap; overflow-wrap: anywhere; }
    .imagenes-reclamo { display: flex; flex-wrap: wrap; gap: .6rem; margin: 0; padding: 0; list-style: none; }
    .imagenes-reclamo li { display: grid; gap: .25rem; width: 7.5rem; color: #526475; font-size: .78rem; overflow-wrap: anywhere; }
    .imagenes-reclamo a { display: block; border-radius: .5rem; }
    .imagenes-reclamo a:focus-visible { outline: 2px solid #1640f5; outline-offset: 2px; }
    .imagenes-reclamo img { display: block; width: 100%; aspect-ratio: 1; border-radius: .5rem; object-fit: cover; background: #e3eaff; }
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
  /** El admin la apaga mientras la sección Reclamos está oculta, para no consultar en segundo plano. */
  readonly actualizar = input(true);
  protected readonly puedeValidarCodigo = puedeValidarCodigo;
  /** T53: en Mis reservas, el rol de quien mira el reclamo; el admin no lo necesita. */
  protected readonly rolPropio = computed(() => {
    if (this.administracion()) return '';
    return rolEnReclamo(this.reclamo(), Number(this.auth.currentUser()?.sub)) ?? '';
  });
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

  private rolDe(autor?: AutorReclamo | null): string {
    if (!autor) return '';
    if (autor.rol?.nombre === 'Administrador') return 'Admin';
    if (autor.id === this.reclamo().inquilino?.id) return 'Inquilino';
    if (autor.id === this.reclamo().anunciante?.id) return 'Anunciante';
    return '';
  }

  /** T49: cada imagen dice quién la subió. */
  protected autorImagen(imagen: ReclamoEvidencia): string {
    const rol = this.rolDe(imagen.autor);
    return [this.nombreCompleto(imagen.autor) || 'un usuario', rol].filter(Boolean).join(' · ');
  }

  /**
   * T49: el chat se consulta cada 5 segundos y cada respuesta trae un enlace firmado nuevo. Se conserva el primero
   * para no volver a descargar las miniaturas y se cambia por el más reciente antes de que venza (15 minutos).
   */
  protected urlImagen(imagen: ReclamoEvidencia): string {
    const guardada = this.urlsImagenes.get(imagen.id);
    if (guardada && Date.now() - guardada.desde < RENOVAR_ENLACE_MS) return guardada.url;
    this.urlsImagenes.set(imagen.id, { url: imagen.url, desde: Date.now() });
    return imagen.url;
  }

  protected ocultarPortada(evento: Event): void {
    (evento.target as HTMLImageElement).hidden = true;
  }
  private readonly urlsImagenes = new Map<number, { url: string; desde: number }>();
  private readonly auth = inject(AuthService);
  private readonly reservas = inject(ReservationService);
  private readonly esNavegador = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly idReclamo = computed(() => this.reclamo().id);
  private readonly abierto = computed(() => ['ABIERTO', 'EN_REVISION'].includes(this.reclamo().estado));
  /** Mensajes traídos por la consulta periódica; se combinan con los que llegaron en el listado. */
  private readonly mensajesRecibidos = signal<ReclamoMensaje[]>([]);
  private idConsultado?: number;

  constructor() {
    // T48: el hilo de un reclamo abierto se actualiza solo, como los chats de mensajes y reembolsos.
    effect(onCleanup => {
      const id = this.idReclamo();
      if (id !== this.idConsultado) {
        this.idConsultado = id;
        this.mensajesRecibidos.set([]);
      }
      if (!this.esNavegador || !this.abierto() || !this.actualizar()) return;
      const consulta = timer(INTERVALO_CHAT_MS, INTERVALO_CHAT_MS).pipe(
        // Un fallo puntual no corta la actualización: se reintenta en el próximo intervalo.
        exhaustMap(() => this.reservas.claimMessages(id).pipe(catchError(() => EMPTY))),
      ).subscribe(mensajes => this.mensajesRecibidos.set(mensajes));
      onCleanup(() => consulta.unsubscribe());
    });
  }

  protected readonly mensajes = computed(() => [
    ...new Map([...(this.reclamo().mensajes ?? []), ...this.mensajesRecibidos()].map(mensaje => [mensaje.id, mensaje])).values(),
  ]
    .sort((a, b) => a.id - b.id)
    .map(mensaje => ({
      id: mensaje.id, autor: this.nombreCompleto(mensaje.autor) || 'Usuario',
      texto: mensaje.texto, fecha: mensaje.creado_en,
      rol: this.rolDe(mensaje.autor), interno: mensaje.visible_para === 'ADMIN',
      propio: mensaje.autor?.id === Number(this.auth.currentUser()?.sub),
      imagenes: (mensaje.evidencias ?? []).map((imagen) => ({ url: this.urlImagen(imagen), nombre: imagen.nombre_archivo })),
    })));
  protected readonly categorias = {
    LIMPIEZA: 'Limpieza', MANTENIMIENTO: 'Mantenimiento', INGRESO: 'Problemas de ingreso',
    DESCRIPCION: 'La propiedad no coincide', OTRO: 'Otro motivo',
    CODIGO_BLOQUEADO: 'Pedido de reinicio del código de alojamiento',
  };
  protected readonly estados = {
    ABIERTO: 'Recibido', EN_REVISION: 'En revisión', RESUELTO_INQUILINO: 'Resuelto',
    RESUELTO_ANUNCIANTE: 'Resuelto', CERRADO: 'Cerrado',
  };
  protected readonly resoluciones = {
    SIN_DEVOLUCION: 'Cerrado sin devolución', DEVOLUCION_TOTAL: 'Devolución total',
    DEVOLUCION_PARCIAL: 'Devolución parcial', REINICIAR_CODIGO: 'Nuevos intentos del código',
    CONFIRMAR_INGRESO: 'Ingreso confirmado sin código',
  };
}
