import { computed, signal, type Signal } from '@angular/core';
import { normalizarTexto } from './texto';

/** Opción de un filtro. Sin `aplica` no filtra: es la opción «Todos». */
export interface OpcionFiltro<T> {
  valor: string;
  etiqueta: string;
  aplica?: (item: T) => boolean;
}

/** Filtro de una lista; la primera opción es la que viene elegida. */
export interface FiltroLista<T> {
  nombre: string;
  etiqueta: string;
  opciones: readonly OpcionFiltro<T>[];
}

export interface OpcionesListaFiltrable<T> {
  porPagina: number;
  /** Datos en los que se busca: cada palabra escrita tiene que aparecer en alguno. */
  textos: (item: T) => readonly (string | number | null | undefined)[];
  filtros?: readonly FiltroLista<T>[];
}

/** Búsqueda por palabras clave, filtros y paginación en el navegador para una lista ya cargada. */
export class ListaFiltrable<T> {
  readonly filtros: readonly FiltroLista<T>[];
  readonly busqueda = signal('');
  private readonly elegidos = signal<Readonly<Record<string, string>>>({});
  private readonly paginaElegida = signal(1);

  readonly filtrados = computed(() => {
    const terminos = normalizarTexto(this.busqueda()).split(/\s+/).filter(Boolean);
    const condiciones = this.filtros.map((filtro) => this.opcionElegida(filtro).aplica).filter((aplica) => aplica !== undefined);
    return this.items().filter((item) => condiciones.every((aplica) => aplica(item)) && this.coincide(item, terminos));
  });
  readonly paginas = computed(() => Math.max(1, Math.ceil(this.filtrados().length / this.opciones.porPagina)));
  readonly pagina = computed(() => Math.min(this.paginaElegida(), this.paginas()));
  readonly visibles = computed(() => {
    const inicio = (this.pagina() - 1) * this.opciones.porPagina;
    return this.filtrados().slice(inicio, inicio + this.opciones.porPagina);
  });
  /** Hay una búsqueda escrita o un filtro distinto del que viene elegido. */
  readonly filtrando = computed(() => !!this.busqueda().trim() || this.filtros.some((filtro) => this.opcionElegida(filtro) !== filtro.opciones[0]));

  constructor(private readonly items: Signal<readonly T[]>, private readonly opciones: OpcionesListaFiltrable<T>) {
    this.filtros = opciones.filtros ?? [];
  }

  valor(nombre: string): string {
    const filtro = this.filtros.find((item) => item.nombre === nombre);
    return filtro ? this.opcionElegida(filtro).valor : '';
  }

  buscar(texto: string): void {
    this.busqueda.set(texto);
    this.paginaElegida.set(1);
  }

  filtrar(nombre: string, valor: string): void {
    this.elegidos.update((actuales) => ({ ...actuales, [nombre]: valor }));
    this.paginaElegida.set(1);
  }

  irAPagina(pagina: number): void {
    this.paginaElegida.set(Math.max(1, pagina));
  }

  limpiar(): void {
    this.busqueda.set('');
    this.elegidos.set({});
    this.paginaElegida.set(1);
  }

  /** Lleva a la página del ítem; si la búsqueda o los filtros lo ocultan, primero los limpia. */
  mostrar(esElItem: (item: T) => boolean): boolean {
    if (!this.filtrados().some(esElItem)) this.limpiar();
    const indice = this.filtrados().findIndex(esElItem);
    if (indice < 0) return false;
    this.paginaElegida.set(Math.floor(indice / this.opciones.porPagina) + 1);
    return true;
  }

  private opcionElegida(filtro: FiltroLista<T>): OpcionFiltro<T> {
    const valor = this.elegidos()[filtro.nombre];
    return filtro.opciones.find((opcion) => opcion.valor === valor) ?? filtro.opciones[0];
  }

  private coincide(item: T, terminos: readonly string[]): boolean {
    if (!terminos.length) return true;
    const texto = normalizarTexto(this.opciones.textos(item).filter((valor) => valor !== null && valor !== undefined).join(' '));
    return terminos.every((termino) => texto.includes(termino));
  }
}
