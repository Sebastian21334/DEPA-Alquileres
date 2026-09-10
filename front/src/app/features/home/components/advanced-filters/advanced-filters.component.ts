import { Component, computed, effect, signal, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import {
  LucideMapPin,
  LucideHome,
  LucideHexagon,
  LucideCoins,
  LucidePiggyBank,
  LucideX,
} from '@lucide/angular';
import { TipoPropiedad, TipoMoneda } from '../../../../shared/models/catalogo.model';
// Ajustar esta ruta si el modelo de Ciudad vive en otro archivo.
import { Ciudad } from '../../../../shared/models/ubicacion.model';

type SeccionFiltro = 'ubicacion' | 'tipoPropiedad' | 'ambientes' | 'moneda' | 'precio';

const PRECIO_MIN = 50_000;
const PRECIO_MAX = 1_500_000;

// Filtros combinables (RN-22), rediseñados como tarjetas con toggle propio
// (prototipo "Búsqueda Avanzada"). Cada tarjeta puede activarse/desactivarse:
// al apagarla se limpia y deshabilita su(s) control(es) del FormGroup
// compartido, para que quede excluida de la búsqueda sin necesidad de un
// estado aparte — el padre solo necesita leer form.value/getRawValue como ya
// hacía.
//
// Controles que este componente espera encontrar en el `form` recibido:
//   idsCiudad:              number[]   (antes no existía)
//   idsTipoPropiedad:       number[]   (reemplaza a idTipoPropiedad, que era único)
//   ambientesSeleccionados: string[]   ('1' | '2' | '3' | '4+')
//   idsTipoMoneda:          number[]   (antes no existía)
//   precioMin / precioMax:  number | null   (igual que antes)
@Component({
  selector: 'app-advanced-filters',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    LucideMapPin,
    LucideHome,
    LucideHexagon,
    LucideCoins,
    LucidePiggyBank,
    LucideX,
  ],
  templateUrl: './advanced-filters.component.html',
  styleUrl: './advanced-filters.component.scss',
})
export class AdvancedFiltersComponent {
  readonly form = input.required<FormGroup>();
  readonly tiposPropiedad = input<TipoPropiedad[]>([]);
  readonly ciudades = input<Ciudad[]>([]);
  readonly monedas = input<TipoMoneda[]>([]);
  readonly modalidades = input<{ id: number; nombre: string }[]>([]);

  protected readonly abierto = signal(false);

  protected readonly precioMinLimite = PRECIO_MIN;
  protected readonly precioMaxLimite = PRECIO_MAX;

  protected readonly ambientesBuckets = ['1', '2', '3', '4+'] as const;

  private readonly idModalidadSeleccionada = signal<number | null>(null);

  protected readonly esSecundaria = computed(() => {
    const id = this.idModalidadSeleccionada();
    const lista = this.modalidades();
    return lista.findIndex((m) => m.id === id) === 1;
  });

  protected readonly activos = signal<Record<SeccionFiltro, boolean>>({
    ubicacion: true,
    tipoPropiedad: true,
    ambientes: true,
    moneda: true,
    precio: true,
  });

  private readonly controlesPorSeccion: Record<SeccionFiltro, string[]> = {
    ubicacion: ['idsCiudad'],
    tipoPropiedad: ['idsTipoPropiedad'],
    ambientes: ['ambientesSeleccionados'],
    moneda: ['idsTipoMoneda'],
    precio: ['precioMin', 'precioMax'],
  };

  constructor() {
    effect((onCleanup) => {
      const control = this.form().controls['idModalidad'];
      if (!control) return;

      this.idModalidadSeleccionada.set(control.value);
      const sub = control.valueChanges.subscribe((valor) => {
        this.idModalidadSeleccionada.set(valor);
      });
      onCleanup(() => sub.unsubscribe());
    });
  }

  protected toggle(): void {
    this.abierto.update((v) => !v);
  }

  protected toggleSeccion(seccion: SeccionFiltro): void {
    const activaAhora = !this.activos()[seccion];
    this.activos.update((a) => ({ ...a, [seccion]: activaAhora }));

    for (const nombreControl of this.controlesPorSeccion[seccion]) {
      const control = this.form().controls[nombreControl];
      if (!control) continue;

      if (activaAhora) {
        control.enable({ emitEvent: false });
      } else {
        control.setValue(Array.isArray(control.value) ? [] : null, { emitEvent: false });
        control.disable({ emitEvent: false });
      }
    }
  }

  // ---- Ubicación ----
  protected get ciudadesSeleccionadasIds(): number[] {
    return (this.form().controls['idsCiudad']?.value ?? []) as number[];
  }

    protected ciudadesSeleccionadas(): Ciudad[] {
    const ids = new Set(this.ciudadesSeleccionadasIds);
    return this.ciudades().filter((c) => ids.has(c.id));
  }

  protected etiquetaCiudad(c: Ciudad): string {
    return c.provincia ? `${c.nombre}, ${c.provincia.nombre}` : c.nombre;
  }

  protected onSeleccionarCiudad(idStr: string): void {
    const id = Number(idStr);
    if (!id) return;
    const actuales = this.ciudadesSeleccionadasIds;
    if (!actuales.includes(id)) {
      this.actualizarControl('idsCiudad', [...actuales, id]);
    }
  }

  protected quitarCiudad(id: number): void {
    this.actualizarControl(
      'idsCiudad',
      this.ciudadesSeleccionadasIds.filter((x) => x !== id),
    );
  }

  // ---- Moneda ----
  protected get monedasSeleccionadasIds(): number[] {
    return (this.form().controls['idsTipoMoneda']?.value ?? []) as number[];
  }

  protected monedasSeleccionadas(): TipoMoneda[] {
    const ids = new Set(this.monedasSeleccionadasIds);
    return this.monedas().filter((m) => ids.has(m.id));
  }

  protected onSeleccionarMoneda(idStr: string): void {
    const id = Number(idStr);
    if (!id) return;
    const actuales = this.monedasSeleccionadasIds;
    if (!actuales.includes(id)) {
      this.actualizarControl('idsTipoMoneda', [...actuales, id]);
    }
  }

  protected quitarMoneda(id: number): void {
    this.actualizarControl(
      'idsTipoMoneda',
      this.monedasSeleccionadasIds.filter((x) => x !== id),
    );
  }

  // ---- Tipo de propiedad ----
  protected tipoPropiedadSeleccionado(id: number): boolean {
    const actuales = (this.form().controls['idsTipoPropiedad']?.value ?? []) as number[];
    return actuales.includes(id);
  }

  protected toggleTipoPropiedad(id: number): void {
    const actuales = (this.form().controls['idsTipoPropiedad']?.value ?? []) as number[];
    const nuevos = actuales.includes(id) ? actuales.filter((x) => x !== id) : [...actuales, id];
    this.actualizarControl('idsTipoPropiedad', nuevos);
  }

  // ---- Ambientes ----
  protected ambienteSeleccionado(bucket: string): boolean {
    const actuales = (this.form().controls['ambientesSeleccionados']?.value ?? []) as string[];
    return actuales.includes(bucket);
  }

  protected toggleAmbiente(bucket: string): void {
    const actuales = (this.form().controls['ambientesSeleccionados']?.value ?? []) as string[];
    const nuevos = actuales.includes(bucket)
      ? actuales.filter((x) => x !== bucket)
      : [...actuales, bucket];
    this.actualizarControl('ambientesSeleccionados', nuevos);
  }

  protected limpiarAmbientes(): void {
    this.actualizarControl('ambientesSeleccionados', []);
  }

  // ---- Precio ----
  protected get precioMinValor(): number {
    return (this.form().controls['precioMin']?.value as number) ?? PRECIO_MIN;
  }

  protected get precioMaxValor(): number {
    return (this.form().controls['precioMax']?.value as number) ?? PRECIO_MAX;
  }

  protected get precioMaxEtiqueta(): string {
    return this.precioMaxValor >= PRECIO_MAX ? `${PRECIO_MAX.toLocaleString('es-AR')}+` : this.precioMaxValor.toLocaleString('es-AR');
  }

  protected onPrecioMinRange(valor: string): void {
    const nuevo = Math.min(Number(valor), this.precioMaxValor);
    this.actualizarControl('precioMin', nuevo);
  }

  protected onPrecioMaxRange(valor: string): void {
    const nuevo = Math.max(Number(valor), this.precioMinValor);
    this.actualizarControl('precioMax', nuevo);
  }

  private actualizarControl(nombre: string, valor: unknown): void {
    const control = this.form().controls[nombre] as FormControl | undefined;
    control?.setValue(valor);
  }

  protected limpiar(): void {
    this.form().patchValue({
      idsTipoPropiedad: [],
      idsCiudad: [],
      idsTipoMoneda: [],
      ambientesSeleccionados: [],
      precioMin: null,
      precioMax: null,
    });
  }
}