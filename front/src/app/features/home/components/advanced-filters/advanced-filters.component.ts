import { NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, HostListener, computed, inject, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  LucideArrowLeftRight,
  LucideChevronDown,
  LucideCoins,
  LucideDoorOpen,
  LucideHouse,
  LucideMapPin,
  LucideSlidersHorizontal,
} from '@lucide/angular';
import { NombresUbicacion, SelectorUbicacionComponent } from '../../../../shared/components/selector-ubicacion/selector-ubicacion.component';
import { TipoPropiedad } from '../../../../shared/models/catalogo.model';

@Component({
  selector: 'app-advanced-filters',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet,
    SelectorUbicacionComponent,
    LucideHouse,
    LucideCoins,
    LucideDoorOpen,
    LucideArrowLeftRight,
    LucideChevronDown,
    LucideMapPin,
    LucideSlidersHorizontal,
  ],
  templateUrl: './advanced-filters.component.html',
  styleUrl: './advanced-filters.component.scss',
})
export class AdvancedFiltersComponent {
  private readonly elemento = inject(ElementRef<HTMLElement>);
  readonly form = input.required<FormGroup>();
  readonly tiposPropiedad = input<TipoPropiedad[]>([]);
  readonly categoria = input<string | null>(null);
  readonly compacto = input(false);
  readonly busquedaActiva = input('');
  protected readonly nombres = signal<NombresUbicacion>({ localidad: '', provincia: '' });
  protected readonly ubicacionTexto = computed(() => [this.nombres().localidad, this.nombres().provincia]
    .filter(Boolean).join(', ') || this.busquedaActiva() || 'Buscar ubicación');
  protected readonly ambientes = ['1', '2', '3', '4+'] as const;

  @HostListener('document:pointerdown', ['$event'])
  cerrarFuera(evento: PointerEvent): void {
    const menu = this.menuAbierto();
    if (menu && evento.target instanceof Node && !menu.contains(evento.target)) menu.open = false;
  }

  @HostListener('keydown.escape', ['$event'])
  cerrarConEscape(evento: Event): void {
    const menu = this.menuAbierto();
    if (!menu || evento.defaultPrevented) return;
    evento.preventDefault();
    menu.open = false;
    menu.querySelector('summary')?.focus();
  }

  private menuAbierto(): HTMLDetailsElement | null {
    return this.elemento.nativeElement.querySelector('.advanced__menu[open]');
  }

  protected seleccionarProvincia(id: number | null): void {
    this.form().patchValue({ idProvincia: id, idsCiudad: [] });
  }

  protected seleccionarCiudad(id: number | null): void {
    this.form().controls['idsCiudad'].setValue(id == null ? [] : [id]);
  }

  protected seleccionarTipoPropiedad(valor: string): void {
    this.form().controls['idsTipoPropiedad'].setValue(valor ? [Number(valor)] : []);
  }

  protected seleccionarAmbientes(valor: string): void {
    this.form().controls['ambientesSeleccionados'].setValue(valor ? [valor] : []);
  }
}
