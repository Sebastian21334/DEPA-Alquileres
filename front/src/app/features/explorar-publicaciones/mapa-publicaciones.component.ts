import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit, Component, ElementRef, Injector, OnDestroy, PLATFORM_ID, ViewChild,
  afterNextRender, computed, effect, inject, input, signal, untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideHouse, LucideList, LucidePanelLeftClose, LucideX } from '@lucide/angular';
import type { FeatureGroup, LatLngExpression, Map as MapaLeaflet, Marker } from 'leaflet';
import {
  FiltrosPublicaciones, ListingService, PuntoPublicacion,
} from '../home/listing.service';
import { ListingCardComponent } from '../../shared/components/listing-card/listing-card.component';
import { Publicacion } from '../../shared/models/publicacion.model';
import { crearCapaMapaBase } from '../../shared/utils/mapa-base';

const VILLA_MARIA: [number, number] = [-32.41, -63.24];
const TAMANO_GRUPO = 105;
const MAX_PINES_DESPLEGADOS = 6;
const SEPARACION_VERTICAL = 56;
const SEPARACION_HORIZONTAL = 220;
/** Duración de las animaciones de los pines (styles.css) y retraso máximo de la onda de entrada. */
const DURACION_ANIMACION_PIN = 450;
const RETRASO_MAXIMO_ENTRADA = 350;
const Z_RESALTADO = 1500;
const precio = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

type AnimacionPines = 'entrada' | 'seleccion' | 'despliegue';
interface PinDibujado { marcador: Marker; zBase: number; }

@Component({
  selector: 'app-mapa-publicaciones',
  imports: [RouterLink, ListingCardComponent, LucideHouse, LucideList, LucidePanelLeftClose, LucideX],
  templateUrl: './mapa-publicaciones.component.html',
  styleUrl: './mapa-publicaciones.component.scss',
})
export class MapaPublicacionesComponent implements AfterViewInit, OnDestroy {
  private readonly api = inject(ListingService);
  private readonly plataforma = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);
  private readonly listo = signal(false);
  private readonly reintento = signal(0);
  protected readonly seleccionado = signal<number | null>(null);
  protected readonly puntos = signal<PuntoPublicacion[]>([]);
  private leaflet?: typeof import('leaflet');
  private mapa?: MapaLeaflet;
  private marcadores?: FeatureGroup;
  private grupoExpandido: PuntoPublicacion[] = [];
  private observador?: ResizeObserver;
  private destruido = false;
  private contextoAnterior?: string;
  private faltaCentrar = true;
  private pinesPorPublicacion = new Map<number, PinDibujado>();
  private pinResaltado?: PinDibujado;
  private animacion?: { tipo: AnimacionPines; inicio: number };

  @ViewChild('contenedor') private contenedor!: ElementRef<HTMLDivElement>;
  @ViewChild('botonListado') private botonListado?: ElementRef<HTMLButtonElement>;
  @ViewChild('botonCerrarListado') private botonCerrarListado?: ElementRef<HTMLButtonElement>;
  readonly filtros = input.required<FiltrosPublicaciones>();
  protected readonly listadoAbierto = signal(false);
  protected readonly cargando = signal(true);
  protected readonly error = signal(false);
  protected readonly errorMapa = signal(false);
  protected readonly errorFondo = signal(false);
  protected readonly cantidad = computed(() => this.puntos().length);
  protected readonly detalleAbierto = computed(() => this.seleccionado() !== null);
  protected readonly detalle = signal<Publicacion | null>(null);
  protected readonly errorDetalle = signal(false);
  protected readonly grupo = signal<PuntoPublicacion[]>([]);
  /** Publicación bajo el mouse o el foco, en el listado o en el mapa: se destaca en ambos. */
  protected readonly resaltado = signal<number | null>(null);

  constructor() {
    effect((limpiar) => {
      if (!this.listo()) return;
      const filtros = this.filtros();
      this.reintento();
      // Cambiar ciudad, provincia o búsqueda abre su ámbito completo.
      const contexto = JSON.stringify([filtros.idProvincia, filtros.idsCiudad, filtros.busqueda]);
      if (contexto !== this.contextoAnterior) {
        this.contextoAnterior = contexto;
        this.faltaCentrar = true;
      }
      this.grupoExpandido = [];
      this.limpiarSeleccion();
      this.cargando.set(true);
      this.error.set(false);
      this.puntos.set([]);
      this.marcadores?.clearLayers();
      const peticion = this.api.getMapa(filtros).subscribe({
        next: (puntos) => {
          this.puntos.set(puntos);
          this.animar('entrada');
          if (this.faltaCentrar && puntos.length) {
            this.faltaCentrar = false;
            this.mapa?.fitBounds(puntos.map(({ latitud, longitud }) => [latitud, longitud]), {
              padding: [60, 60], maxZoom: 14, animate: false,
            });
          }
          this.dibujarPines();
          this.cargando.set(false);
        },
        error: () => {
          this.error.set(true);
          this.cargando.set(false);
        },
      });
      limpiar(() => peticion.unsubscribe());
    });

    effect((limpiar) => {
      const id = this.seleccionado();
      this.detalle.set(null);
      this.errorDetalle.set(false);
      if (id === null) return;
      const peticion = this.api.getById(id).subscribe({
        next: (publicacion) => this.detalle.set(publicacion),
        error: () => this.errorDetalle.set(true),
      });
      limpiar(() => peticion.unsubscribe());
    });

    effect(() => this.aplicarResaltado(this.resaltado()));
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.plataforma)) return;
    try {
      const modulo = await import('leaflet');
      if (this.destruido) return;
      const L = (modulo as { default?: typeof import('leaflet') }).default ?? modulo;
      this.leaflet = L;
      const elemento = this.contenedor.nativeElement;
      const mapa = L.map(elemento, {
        center: VILLA_MARIA,
        zoom: 12,
        minZoom: 4,
        maxZoom: 19,
        maxBounds: [[-85, -180], [85, 180]],
        zoomControl: false,
        scrollWheelZoom: true,
      });
      this.mapa = mapa;
      L.control.zoom({ position: 'bottomright', zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar' }).addTo(mapa);
      crearCapaMapaBase(L)
        .on('tileerror', () => this.errorFondo.set(true))
        .on('tileload', () => this.errorFondo.set(false))
        .addTo(mapa);
      this.marcadores = L.featureGroup().addTo(mapa);
      mapa.on('moveend', () => this.dibujarPines());
      mapa.on('click', () => this.cerrarGrupo());
      this.observador = new ResizeObserver(() => mapa.invalidateSize({ debounceMoveend: true }));
      this.observador.observe(elemento);
      this.listo.set(true);
    } catch {
      this.mapa?.remove();
      this.mapa = undefined;
      this.errorMapa.set(true);
      this.listo.set(true);
    }
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.observador?.disconnect();
    this.mapa?.remove();
  }

  protected reintentar(): void {
    this.reintento.update((valor) => valor + 1);
  }

  protected seleccionar(punto: PuntoPublicacion): void {
    if (!this.grupoExpandido.some(({ id }) => id === punto.id)) this.grupoExpandido = [];
    this.seleccionado.set(punto.id);
    this.grupo.set([]);
    this.animar('seleccion');
    this.dibujarPines(punto.id);
  }

  protected alternarListado(): void {
    const abrir = !this.listadoAbierto();
    this.listadoAbierto.set(abrir);
    afterNextRender(() => {
      const destino = abrir ? this.botonCerrarListado : this.botonListado;
      destino?.nativeElement.focus({ preventScroll: true });
    }, { injector: this.injector });
  }

  protected seleccionarDesdeListado(punto: PuntoPublicacion): void {
    const mapa = this.mapa;
    if (mapa) mapa.setView([punto.latitud, punto.longitud], Math.max(mapa.getZoom(), 15));
    this.seleccionar(punto);
    if (window.matchMedia('(max-width: 680px)').matches) this.alternarListado();
  }

  protected cerrarDetalle(): void {
    this.limpiarSeleccion();
    this.dibujarPines();
  }

  private limpiarSeleccion(): void {
    this.seleccionado.set(null);
    this.grupo.set([]);
  }

  private cerrarGrupo(): void {
    if (!this.grupoExpandido.length && this.seleccionado() === null && !this.grupo().length) return;
    this.grupoExpandido = [];
    this.cerrarDetalle();
  }

  protected textoPrecio(punto: PuntoPublicacion): string {
    const importe = precio.format(punto.precio);
    const moneda = punto.moneda?.match(/\b(?:ARS|USD)\b/i)?.[0] ?? punto.moneda ?? '$';
    return `${moneda} ${importe} / ${punto.temporal ? 'día' : 'mes'}`;
  }

  private dibujarPines(idFoco?: number): void {
    const mapa = this.mapa;
    const capa = this.marcadores;
    const leaflet = this.leaflet;
    if (!mapa || !capa || !leaflet) return;
    const elemento = mapa.getContainer();
    const foco = elemento.ownerDocument.activeElement;
    const conservarFoco = foco instanceof HTMLElement && foco.classList.contains('depa-pin') && elemento.contains(foco);
    const seleccionado = untracked(this.seleccionado);
    capa.clearLayers();
    this.pinesPorPublicacion.clear();
    this.pinResaltado = undefined;
    const grupos = this.agruparPines(mapa);
    const grupoSeleccionado = grupos.find((grupo) => grupo.some(({ id }) => id === seleccionado));
    const expandido = this.grupoExpandido.length ? this.grupoExpandido : grupoSeleccionado ?? [];
    const idsExpandidos = new Set(expandido.map(({ id }) => id));

    for (const grupo of grupos) {
      const pendientes = grupo.filter(({ id }) => !idsExpandidos.has(id));
      if (pendientes.length) this.agregarMarcador(pendientes, leaflet, capa);
    }
    if (expandido.length) this.dibujarGrupoExpandido(expandido, seleccionado, mapa, leaflet, capa);
    this.aplicarResaltado(untracked(this.resaltado));

    if (conservarFoco) {
      const nuevoFoco = idFoco ?? (foco.hasAttribute('data-publicacion') ? Number(foco.dataset['publicacion']) : null);
      if (nuevoFoco !== null) {
        elemento.querySelector<HTMLElement>(`[data-publicacion="${nuevoFoco}"]`)?.focus({ preventScroll: true });
      }
    }
  }

  private agruparPines(mapa: MapaLeaflet): PuntoPublicacion[][] {
    const grupos = new Map<string, PuntoPublicacion[]>();
    const limites = mapa.getBounds().pad(.25);
    for (const punto of this.puntos()) {
      if (!limites.contains([punto.latitud, punto.longitud])) continue;
      const posicion = mapa.project([punto.latitud, punto.longitud]);
      const celda = `${Math.floor(posicion.x / TAMANO_GRUPO)}:${Math.floor(posicion.y / 56)}`;
      const grupo = grupos.get(celda);
      if (grupo) grupo.push(punto);
      else grupos.set(celda, [punto]);
    }
    return [...grupos.values()];
  }

  private dibujarGrupoExpandido(grupo: PuntoPublicacion[], seleccionado: number | null, mapa: MapaLeaflet, L: typeof import('leaflet'), capa: FeatureGroup): void {
    const [primero] = grupo;
    if (grupo.length === 1) {
      this.agregarMarcador(grupo, L, capa, undefined, seleccionado);
      return;
    }

    // La separación se mide en píxeles; los inmuebles conservan sus coordenadas.
    const centro = mapa.project([primero.latitud, primero.longitud]);
    if (grupo.length > MAX_PINES_DESPLEGADOS) {
      const elegido = grupo.find(({ id }) => id === seleccionado);
      const restantes = grupo.filter(({ id }) => id !== seleccionado);
      this.agregarMarcador(restantes, L, capa);
      if (elegido) {
        const posicion = mapa.unproject(centro.subtract([0, SEPARACION_VERTICAL]));
        this.agregarPinDesplazado(elegido, posicion, [0, SEPARACION_VERTICAL], seleccionado, L, capa);
      }
      return;
    }

    const columnas = grupo.length > 2 && mapa.getSize().x >= 460 ? 2 : 1;
    const filas = Math.ceil(grupo.length / columnas);
    grupo.forEach((punto, indice) => {
      const fila = Math.floor(indice / columnas);
      const cantidadFila = Math.min(columnas, grupo.length - fila * columnas);
      const x = (indice % columnas - (cantidadFila - 1) / 2) * SEPARACION_HORIZONTAL;
      const y = (fila - (filas - 1) / 2) * SEPARACION_VERTICAL + 17;
      const posicion = mapa.unproject(centro.add([x, y]));
      this.agregarPinDesplazado(punto, posicion, [-x, -y], seleccionado, L, capa);
    });
  }

  /** `desde` es el desplazamiento en píxeles hasta el centro del grupo: el pin sale de ahí al desplegarse. */
  private agregarPinDesplazado(punto: PuntoPublicacion, posicion: LatLngExpression, desde: [number, number], seleccionado: number | null, L: typeof import('leaflet'), capa: FeatureGroup): void {
    const linea = L.polyline([[punto.latitud, punto.longitud], posicion], {
      color: '#526580', opacity: .68, weight: 2, interactive: false, className: 'depa-pin-linea',
    }).addTo(capa);
    const trazo = linea.getElement();
    const retraso = this.animacion?.tipo === 'despliegue' ? this.retrasoRestante(0) : null;
    if (trazo instanceof SVGElement && retraso !== null) {
      trazo.setAttribute('pathLength', '1');
      this.animarElemento(trazo, 'depa-pin-linea--despliegue', retraso);
    }
    this.agregarMarcador([punto], L, capa, posicion, seleccionado, desde);
  }

  private agregarMarcador(grupo: PuntoPublicacion[], L: typeof import('leaflet'), capa: FeatureGroup, posicion?: LatLngExpression, seleccionado: number | null = null, desde?: [number, number]): void {
    const punto = grupo[0];
    const agrupado = grupo.length > 1;
    const activo = !agrupado && punto.id === seleccionado;
    const etiqueta = agrupado ? String(grupo.length) : this.textoPrecio(punto);
    const descripcion = agrupado
      ? `${grupo.length} publicaciones`
      : `${punto.titulo}, ${punto.temporal ? 'temporal' : 'largo plazo'}, ${etiqueta}`;
    const contenido = document.createElement('span');
    contenido.textContent = etiqueta;
    const clase = agrupado ? 'grupo' : punto.temporal ? 'temporal' : 'largo';
    const icon = L.divIcon({
      html: contenido,
      className: `depa-pin depa-pin--${clase}${activo ? ' depa-pin--seleccionado' : ''}`,
      iconSize: [0, 0],
    });
    const ubicacion = posicion ?? [punto.latitud, punto.longitud];
    this.animarPin(contenido, ubicacion, activo, desde);
    const zBase = activo ? 1000 : 0;
    const marcador = L.marker(ubicacion, {
      icon, title: descripcion, zIndexOffset: zBase, riseOnHover: true,
    });
    marcador
      .on('click', () => {
        if (agrupado) this.abrirGrupo(grupo);
        else this.seleccionar(punto);
      })
      .on('mouseover', () => { if (!agrupado) this.resaltado.set(punto.id); })
      .on('mouseout', () => { if (!agrupado && this.resaltado() === punto.id) this.resaltado.set(null); })
      .addTo(capa);
    for (const { id } of grupo) this.pinesPorPublicacion.set(id, { marcador, zBase });
    const elemento = marcador.getElement();
    elemento?.setAttribute('aria-label', activo ? `${descripcion}, seleccionada` : descripcion);
    if (activo) elemento?.setAttribute('aria-current', 'true');
    if (!agrupado && elemento) elemento.dataset['publicacion'] = String(punto.id);
  }

  private abrirGrupo(grupo: PuntoPublicacion[]): void {
    const mapa = this.mapa;
    if (!mapa) return;
    this.limpiarSeleccion();
    this.grupoExpandido = [];
    const [primero] = grupo;
    const mismaUbicacion = grupo.every((punto) =>
      punto.latitud === primero.latitud && punto.longitud === primero.longitud,
    );
    if (!mismaUbicacion && mapa.getZoom() < mapa.getMaxZoom() && this.leaflet) {
      const limites = this.leaflet.latLngBounds(grupo.map(({ latitud, longitud }) => [latitud, longitud]));
      const margen = this.leaflet.point(150, 150);
      const zoom = Math.max(mapa.getZoom() + 1, mapa.getBoundsZoom(limites, false, margen));
      mapa.setView(limites.getCenter(), zoom);
      return;
    }

    if (grupo.length > MAX_PINES_DESPLEGADOS) this.grupo.set(grupo);
    else {
      this.grupoExpandido = grupo;
      this.animar('despliegue');
    }
    this.dibujarPines(primero.id);
    mapa.panTo([primero.latitud, primero.longitud]);
  }

  // ---------- Animaciones de los pines ----------
  // Leaflet recrea los pines cada vez que el mapa termina de moverse. Una animación guarda cuándo
  // empezó y los pines recreados la retoman con un retraso negativo, sin cortarse ni repetirse.

  private animar(tipo: AnimacionPines): void {
    this.animacion = { tipo, inicio: performance.now() };
  }

  /** Retraso que le queda a una animación que debía empezar `retraso` ms después del inicio; null si ya terminó. */
  private retrasoRestante(retraso: number): number | null {
    if (!this.animacion) return null;
    const transcurrido = performance.now() - this.animacion.inicio;
    return transcurrido < retraso + DURACION_ANIMACION_PIN ? Math.round(retraso - transcurrido) : null;
  }

  private animarPin(contenido: HTMLElement, ubicacion: LatLngExpression, activo: boolean, desde?: [number, number]): void {
    const tipo = this.animacion?.tipo;
    const mapa = this.mapa;
    if (!tipo || !mapa || (tipo === 'seleccion' && !activo) || (tipo === 'despliegue' && !desde)) return;
    // La entrada se propaga como una onda desde el centro del mapa.
    const distancia = tipo === 'entrada' ? mapa.latLngToContainerPoint(ubicacion).distanceTo(mapa.getSize().divideBy(2)) : 0;
    const retraso = this.retrasoRestante(Math.min(distancia * .35, RETRASO_MAXIMO_ENTRADA));
    if (retraso === null) return;
    if (desde) {
      contenido.style.setProperty('--desde-x', `${desde[0]}px`);
      contenido.style.setProperty('--desde-y', `${desde[1]}px`);
    }
    this.animarElemento(contenido, `depa-pin__${tipo}`, retraso);
  }

  /** Aplica una animación de una sola vez y quita la clase al terminar, para no tapar el resaltado. */
  private animarElemento(elemento: HTMLElement | SVGElement, clase: string, retraso: number): void {
    elemento.classList.add(clase);
    elemento.style.animationDelay = `${retraso}ms`;
    elemento.addEventListener('animationend', () => {
      elemento.classList.remove(clase);
      elemento.style.animationDelay = '';
    }, { once: true });
  }

  private aplicarResaltado(id: number | null): void {
    const anterior = this.pinResaltado;
    const siguiente = id === null ? undefined : this.pinesPorPublicacion.get(id);
    if (anterior === siguiente) return;
    if (anterior) {
      anterior.marcador.getElement()?.classList.remove('depa-pin--resaltado');
      anterior.marcador.setZIndexOffset(anterior.zBase);
    }
    if (siguiente) {
      siguiente.marcador.getElement()?.classList.add('depa-pin--resaltado');
      siguiente.marcador.setZIndexOffset(Z_RESALTADO);
    }
    this.pinResaltado = siguiente;
  }
}
