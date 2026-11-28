import { ConversationPanelComponent } from '../conversation-panel/conversation-panel.component';
import { ConversationComposerComponent } from '../conversation-panel/conversation-composer.component';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, exhaustMap, expand, finalize, merge, timer } from 'rxjs';
import { ActividadReembolsosService } from '../../../core/services/actividad-reembolsos.service';
import { ReembolsosService, type MensajeReembolso } from '../../services/reembolsos.service';

@Component({
  selector: 'app-reembolso-chat',
  imports: [ConversationPanelComponent, ConversationComposerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-conversation-panel titulo="Conversación de reembolso" subtitulo="Coordiná la transferencia con Administración."
      [mensajes]="hilo()" [vacio]="abierta() === null ? 'Cargando conversación…' : 'Todavía no hay mensajes.'">
      @if (error()) { <p class="aviso" role="alert">{{ error() }}</p> }
      @if (abierta()) {
        <app-conversation-composer [(texto)]="borrador" [deshabilitado]="enviando()" (enviar)="enviar()" />
      } @else if (abierta() === false) {
        <p class="aviso">La conversación está cerrada.</p>
      }
    </app-conversation-panel>
  `,
  styles: ':host { display: block; } .aviso { margin: 0; padding: 12px; color: #52607a; }',
})
export class ReembolsoChatComponent {
  readonly reembolsoId = input.required<number>();
  readonly vistaInquilino = input(false);
  private readonly reembolsos = inject(ReembolsosService);
  private readonly actividad = inject(ActividadReembolsosService);
  private readonly actualizar = new Subject<void>();
  protected readonly abierta = signal<boolean | null>(null);
  protected readonly mensajes = signal<MensajeReembolso[]>([]);
  protected readonly hilo = computed(() => this.mensajes().map(mensaje => ({
    id: mensaje.id, autor: mensaje.autor, texto: mensaje.texto, fecha: mensaje.creado_en,
    rol: mensaje.administracion ? 'Administración' : 'Inquilino',
    propio: this.vistaInquilino() && !mensaje.administracion,
  })));
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
        const ultimo = [...pagina.mensajes].reverse().find(mensaje => mensaje.administracion);
        if (this.vistaInquilino() && ultimo) this.actividad.marcarLeido(id, ultimo.id);
      });
      onCleanup(() => consulta.unsubscribe());
    });
  }

  private leer(id: number, despuesDe: number) {
    return this.reembolsos.leerConversacion(id, despuesDe, this.abierta() !== null);
  }

  private readonly destruir = takeUntilDestroyed();

  protected enviar(): void {
    const texto = this.borrador.trim();
    if (!texto || this.enviando() || !this.abierta()) return;
    this.enviando.set(true);
    this.error.set('');
    this.reembolsos.enviarMensaje(this.reembolsoId(), texto).pipe(
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
