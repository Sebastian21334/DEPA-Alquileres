import { computed, signal } from '@angular/core';
import { normalizarTexto } from './texto';
/** Búsqueda por palabras clave, filtros y paginación en el navegador para una lista ya cargada. */
export class ListaFiltrable {
    items;
    opciones;
    filtros;
    busqueda = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busqueda" }] : /* istanbul ignore next */ []));
    elegidos = signal({}, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "elegidos" }] : /* istanbul ignore next */ []));
    paginaElegida = signal(1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "paginaElegida" }] : /* istanbul ignore next */ []));
    filtrados = computed(() => {
        const terminos = normalizarTexto(this.busqueda()).split(/\s+/).filter(Boolean);
        const condiciones = this.filtros.map((filtro) => this.opcionElegida(filtro).aplica).filter((aplica) => aplica !== undefined);
        return this.items().filter((item) => condiciones.every((aplica) => aplica(item)) && this.coincide(item, terminos));
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "filtrados" }] : /* istanbul ignore next */ []));
    paginas = computed(() => Math.max(1, Math.ceil(this.filtrados().length / this.opciones.porPagina)), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "paginas" }] : /* istanbul ignore next */ []));
    pagina = computed(() => Math.min(this.paginaElegida(), this.paginas()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pagina" }] : /* istanbul ignore next */ []));
    visibles = computed(() => {
        const inicio = (this.pagina() - 1) * this.opciones.porPagina;
        return this.filtrados().slice(inicio, inicio + this.opciones.porPagina);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "visibles" }] : /* istanbul ignore next */ []));
    /** Hay una búsqueda escrita o un filtro distinto del que viene elegido. */
    filtrando = computed(() => !!this.busqueda().trim() || this.filtros.some((filtro) => this.opcionElegida(filtro) !== filtro.opciones[0]), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "filtrando" }] : /* istanbul ignore next */ []));
    constructor(items, opciones) {
        this.items = items;
        this.opciones = opciones;
        this.filtros = opciones.filtros ?? [];
    }
    valor(nombre) {
        const filtro = this.filtros.find((item) => item.nombre === nombre);
        return filtro ? this.opcionElegida(filtro).valor : '';
    }
    buscar(texto) {
        this.busqueda.set(texto);
        this.paginaElegida.set(1);
    }
    filtrar(nombre, valor) {
        this.elegidos.update((actuales) => ({ ...actuales, [nombre]: valor }));
        this.paginaElegida.set(1);
    }
    irAPagina(pagina) {
        this.paginaElegida.set(Math.max(1, pagina));
    }
    limpiar() {
        this.busqueda.set('');
        this.elegidos.set({});
        this.paginaElegida.set(1);
    }
    /** Lleva a la página del ítem; si la búsqueda o los filtros lo ocultan, primero los limpia. */
    mostrar(esElItem) {
        if (!this.filtrados().some(esElItem))
            this.limpiar();
        const indice = this.filtrados().findIndex(esElItem);
        if (indice < 0)
            return false;
        this.paginaElegida.set(Math.floor(indice / this.opciones.porPagina) + 1);
        return true;
    }
    opcionElegida(filtro) {
        const valor = this.elegidos()[filtro.nombre];
        return filtro.opciones.find((opcion) => opcion.valor === valor) ?? filtro.opciones[0];
    }
    coincide(item, terminos) {
        if (!terminos.length)
            return true;
        const texto = normalizarTexto(this.opciones.textos(item).filter((valor) => valor !== null && valor !== undefined).join(' '));
        return terminos.every((termino) => texto.includes(termino));
    }
}
