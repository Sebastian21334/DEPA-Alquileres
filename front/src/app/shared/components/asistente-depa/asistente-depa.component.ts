import { HttpErrorResponse } from '@angular/common/http';
import { SpinnerComponent } from '../spinner/spinner.component';
import { afterNextRender, Component, DestroyRef, ElementRef, inject, Injector, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowUpRight, LucideSend, LucideSparkles, LucideX } from '@lucide/angular';
import { AsistenteDepaService, type MensajeAsistente, type RespuestaAsistente } from '../../../core/services/asistente-depa.service';

interface Intercambio extends RespuestaAsistente {
  pregunta: string;
  bloques: BloqueRespuesta[];
}

interface FragmentoRespuesta { texto: string; destacado: boolean; }
interface BloqueRespuesta { tipo: 'texto' | 'lista' | 'titulo'; fragmentos: FragmentoRespuesta[]; }

@Component({
  selector: 'app-asistente-depa',
  imports: [FormsModule, RouterLink, LucideArrowUpRight, LucideSend, LucideSparkles, LucideX, SpinnerComponent],
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
        const seguirConversacion = this.estaCercaDelFinal();
        this.intercambios.update((actuales) => [...actuales, {
          pregunta, ...respuesta, bloques: this.formatearRespuesta(respuesta.respuesta),
        }]);
        this.consultaEnCurso.set('');
        if (seguirConversacion) this.mostrarInicioRespuesta();
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
    afterNextRender(() => this.desplazarHistorial(true), { injector: this.injector });
  }

  private desplazarHistorial(suave = false): void {
    const panel = this.historial()?.nativeElement;
    if (panel) panel.scrollTo({ top: panel.scrollHeight, behavior: suave ? 'smooth' : 'auto' });
  }

  private estaCercaDelFinal(): boolean {
    const panel = this.historial()?.nativeElement;
    return !panel || panel.scrollHeight - panel.scrollTop - panel.clientHeight < 100;
  }

  private mostrarInicioRespuesta(): void {
    afterNextRender(() => {
      const panel = this.historial()?.nativeElement;
      const respuesta = panel?.querySelector<HTMLElement>('.asistente__respuesta:last-of-type');
      if (!panel || !respuesta) return;
      const top = panel.scrollTop + respuesta.getBoundingClientRect().top - panel.getBoundingClientRect().top - 12;
      panel.scrollTo({ top, behavior: 'smooth' });
    }, { injector: this.injector });
  }

  private formatearRespuesta(respuesta: string): BloqueRespuesta[] {
    return respuesta.split(/\r?\n/).map((linea): BloqueRespuesta => {
      const titulo = /^\s*#{1,6}\s+/.test(linea);
      const lista = /^\s*[-*+]\s+/.test(linea);
      const contenido = linea.replace(/^\s*(?:#{1,6}\s+|[-*+]\s+)/, '');
      const fragmentos = contenido.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).filter(Boolean).map((texto) => {
        const destacado = /^(?:\*\*.+\*\*|__.+__)$/.test(texto);
        return { texto: destacado ? texto.slice(2, -2) : texto, destacado };
      });
      return { tipo: titulo ? 'titulo' : lista ? 'lista' : 'texto', fragmentos };
    });
  }

  protected tipoModalidad(modalidad: string): 'temporal' | 'largo' | null {
    const nombre = modalidad.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return nombre.includes('tempor') ? 'temporal' : nombre.includes('largo') ? 'largo' : null;
  }
}
