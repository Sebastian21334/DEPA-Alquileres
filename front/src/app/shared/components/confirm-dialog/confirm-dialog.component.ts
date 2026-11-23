import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';
import { LucideTriangleAlert, LucideX } from '@lucide/angular';

export type TonoConfirmDialog = 'advertencia' | 'peligro';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [LucideTriangleAlert, LucideX],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly titulo = input.required<string>();
  readonly mensaje = input.required<string>();
  readonly textoConfirmar = input('Confirmar');
  readonly textoCancelar = input('Cancelar');
  readonly tono = input<TonoConfirmDialog>('advertencia');
  readonly procesando = input(false);
  readonly identificador = input('confirm-dialog');

  readonly confirmar = output<void>();
  readonly cancelar = output<void>();

  protected readonly tituloId = computed(() => `${this.identificador()}-titulo`);
  protected readonly mensajeId = computed(() => `${this.identificador()}-mensaje`);

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');
  private focoAnterior: HTMLElement | null = null;

  abrir(disparador?: HTMLElement): void {
    const dialogo = this.dialogo().nativeElement;
    if (dialogo.open) return;
    this.focoAnterior =
      disparador ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    dialogo.showModal();
  }

  cerrar(): void {
    const dialogo = this.dialogo().nativeElement;
    if (!dialogo.open) {
      this.focoAnterior = null;
      return;
    }
    dialogo.close();
  }

  protected solicitarConfirmacion(): void {
    if (this.procesando()) return;
    this.confirmar.emit();
  }

  protected solicitarCancelacion(): void {
    if (this.procesando()) return;
    this.cancelar.emit();
  }

  protected alCancelar(event: Event): void {
    event.preventDefault();
    this.solicitarCancelacion();
  }

  protected alClicDialogo(event: MouseEvent): void {
    if (event.target !== this.dialogo().nativeElement) return;
    this.solicitarCancelacion();
  }

  protected alCerrar(): void {
    this.focoAnterior?.focus();
    this.focoAnterior = null;
  }
}
