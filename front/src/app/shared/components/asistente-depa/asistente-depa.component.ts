import { HttpErrorResponse } from '@angular/common/http';
import { afterNextRender, Component, DestroyRef, ElementRef, inject, Injector, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowUpRight, LucideSend, LucideSparkles, LucideX } from '@lucide/angular';
import { AsistenteDepaService, type MensajeAsistente, type RespuestaAsistente } from '../../../core/services/asistente-depa.service';

interface Intercambio extends RespuestaAsistente {
  pregunta: string;
}

@Component({
  selector: 'app-asistente-depa',
  imports: [FormsModule, RouterLink, LucideArrowUpRight, LucideSend, LucideSparkles, LucideX],
  templateUrl: './asistente-depa.component.html',
  styleUrl: './asistente-depa.component.css',
})
export class AsistenteDepaComponent {
  private readonly servicio = inject(AsistenteDepaService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly entrada = viewChild<ElementRef<HTMLTextAreaElement>>('entrada');
  private readonly historial = viewChild<ElementRef<HTMLElement>>('historial');
  private readonly lanzador = viewChild<ElementRef<HTMLButtonElement>>('lanzador');

  protected readonly abierto = signal(false);
  protected readonly intercambios = signal<Intercambio[]>([]);
  protected readonly consultaEnCurso = signal('');
  protected readonly error = signal('');
  protected readonly limiteMensaje = 500;
  protected readonly importe = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
  protected borrador = '';

  protected abrir(): void {
    this.abierto.set(true);
    afterNextRender(() => {
      this.entrada()?.nativeElement.focus();
      this.desplazarHistorial();
    }, { injector: this.injector });
  }

  protected cerrar(devolverFoco = true): void {
    this.abierto.set(false);
    if (devolverFoco) {
      afterNextRender(() => this.lanzador()?.nativeElement.focus(), { injector: this.injector });
    }
  }

  protected manejarEnter(evento: Event): void {
    if (!(evento instanceof KeyboardEvent) || evento.shiftKey || evento.isComposing) return;
    evento.preventDefault();
    this.enviar();
  }

  protected enviar(texto = this.borrador): void {
    const pregunta = texto.trim();
    if (!pregunta || pregunta.length > this.limiteMensaje || this.consultaEnCurso()) return;

    const mensajes = this.intercambios().slice(-4).flatMap<MensajeAsistente>((intercambio) => [
      { rol: 'user', contenido: intercambio.pregunta },
      { rol: 'assistant', contenido: Array.from(intercambio.respuesta).slice(0, this.limiteMensaje).join('') },
    ]);
    mensajes.push({ rol: 'user', contenido: pregunta });
    this.borrador = '';
    this.error.set('');
    this.consultaEnCurso.set(pregunta);
    this.programarDesplazamiento();

    this.servicio.consultar(mensajes).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (respuesta) => {
        this.intercambios.update((actuales) => [...actuales, { pregunta, ...respuesta }]);
        this.consultaEnCurso.set('');
        this.programarDesplazamiento();
      },
      error: (error: unknown) => {
        this.consultaEnCurso.set('');
        this.borrador = pregunta;
        this.error.set(error instanceof HttpErrorResponse && error.status === 429
          ? 'Hiciste varias consultas seguidas. Probá de nuevo en un minuto.'
          : 'No pudimos responderte en este momento. Probá de nuevo en unos instantes.');
        this.programarDesplazamiento();
      },
    });
  }

  private programarDesplazamiento(): void {
    afterNextRender(() => this.desplazarHistorial(), { injector: this.injector });
  }

  private desplazarHistorial(): void {
    const panel = this.historial()?.nativeElement;
    if (panel) panel.scrollTop = panel.scrollHeight;
  }
}
