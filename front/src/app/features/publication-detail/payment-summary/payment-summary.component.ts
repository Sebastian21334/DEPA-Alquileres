import { formatearMoneda } from '../../../shared/utils/formato-numero';
import { fechaCalendarioLocal } from '../../../shared/utils/rental-dates';
import { Component, DestroyRef, ElementRef, HostListener, afterNextRender, inject, input, output } from '@angular/core';
import { LucideLockKeyhole, LucideX } from '@lucide/angular';
import { Publicacion } from '../../../shared/models/publicacion.model';
import { PresupuestoReserva } from '../../../shared/services/reservation.service';

@Component({
  selector: 'app-payment-summary',
  standalone: true,
  imports: [LucideLockKeyhole, LucideX],
  templateUrl: './payment-summary.component.html',
  styleUrl: './payment-summary.component.scss',
})
export class PaymentSummaryComponent {
  readonly publicacion = input.required<Publicacion>();
  readonly anunciante = input.required<string>();
  readonly ubicacion = input.required<string>();
  readonly inicio = input<string | null>(null);
  readonly fin = input<string | null>(null);
  readonly presupuesto = input<PresupuestoReserva | null>(null);
  readonly cotizando = input(false);
  readonly procesando = input(false);
  readonly vencido = input(false);
  readonly conversionAceptada = input(false);
  readonly error = input('');
  readonly cerrar = output<void>();
  readonly recotizar = output<void>();
  readonly continuar = output<Event>();
  readonly aceptarConversion = output<boolean>();

  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    let focoAnterior: HTMLElement | null = null;
    afterNextRender(() => {
      focoAnterior = this.elemento.nativeElement.ownerDocument.activeElement as HTMLElement | null;
      this.elemento.nativeElement.querySelector<HTMLButtonElement>('.close')?.focus();
    });
    inject(DestroyRef).onDestroy(() => {
      if (focoAnterior?.isConnected) focoAnterior.focus();
    });
  }

  @HostListener('keydown', ['$event'])
  protected mantenerFoco(evento: KeyboardEvent): void {
    if (evento.key !== 'Tab') return;
    const controles = Array.from(this.elemento.nativeElement.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href], summary')).filter(control => control.getClientRects().length > 0);
    const primero = controles[0], ultimo = controles[controles.length - 1];
    const activo = this.elemento.nativeElement.ownerDocument.activeElement;
    if (evento.shiftKey && activo === primero) {
      evento.preventDefault();
      ultimo?.focus();
    } else if (!evento.shiftKey && activo === ultimo) {
      evento.preventDefault();
      primero?.focus();
    }
  }

  @HostListener('document:keydown.escape')
  protected cerrarModal(): void {
    if (!this.procesando()) this.cerrar.emit();
  }

  protected cambiarConversion(evento: Event): void {
    this.aceptarConversion.emit(evento.target instanceof HTMLInputElement && evento.target.checked);
  }

  protected importe(valor: string | number, moneda: string, decimales = 2): string {
    return formatearMoneda(valor, moneda, decimales);
  }

  protected fecha(valor: string | null): string {
    return valor ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(fechaCalendarioLocal(valor)) : 'Sin seleccionar';
  }

  protected fechaHora(valor: string): string {
    return new Date(valor).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
  }
}
