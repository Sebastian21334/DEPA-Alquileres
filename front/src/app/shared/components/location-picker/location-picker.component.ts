import { AfterViewInit, Component, ElementRef, OnDestroy, PLATFORM_ID, ViewChild, effect, inject, input, output, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { finalize } from 'rxjs';
import type { LeafletMouseEvent, Map as LeafletMap, Marker } from 'leaflet';
import { ResultadoGeocodificacion, UbicacionService } from '../../services/ubicacion.service';

export interface UbicacionConfirmada {
  latitud: number;
  longitud: number;
}

@Component({
  selector: 'app-location-picker',
  standalone: true,
  templateUrl: './location-picker.component.html',
  styleUrl: './location-picker.component.scss',
})
export class LocationPickerComponent implements AfterViewInit, OnDestroy {
  private readonly ubicaciones = inject(UbicacionService);
  private readonly platformId = inject(PLATFORM_ID);
  private leaflet: typeof import('leaflet') | null = null;
  private map: LeafletMap | null = null;
  private marker: Marker | null = null;
  private pendingInitial: UbicacionConfirmada | null = null;
  private lastSearchContext = '';

  @ViewChild('map') private mapElement?: ElementRef<HTMLDivElement>;

  readonly direccion = input('');
  readonly ciudad = input('');
  readonly provincia = input('');
  readonly initialLatitude = input<number | null>(null);
  readonly initialLongitude = input<number | null>(null);
  readonly locationConfirmed = output<UbicacionConfirmada>();

  protected readonly searching = signal(false);
  protected readonly error = signal('');
  protected readonly results = signal<ResultadoGeocodificacion[]>([]);
  protected readonly selectedName = signal('');
  protected readonly candidate = signal<UbicacionConfirmada | null>(null);
  protected readonly confirmed = signal(false);
  protected readonly mapLoadError = signal(false);

  constructor() {
    effect(() => {
      const latitudeInput = this.initialLatitude();
      const longitudeInput = this.initialLongitude();
      if (latitudeInput === null || longitudeInput === null) {
        if (this.confirmed()) this.resetCandidate();
        return;
      }
      const latitud = Number(latitudeInput);
      const longitud = Number(longitudeInput);
      if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) return;
      this.pendingInitial = { latitud, longitud };
      this.confirmed.set(true);
      if (this.map) this.placeMarker(latitud, longitud, 17);
    });
    effect(() => {
      const context = `${this.direccion()}|${this.ciudad()}|${this.provincia()}`;
      if (this.lastSearchContext && context !== this.lastSearchContext && this.candidate() && !this.confirmed()) {
        this.resetCandidate();
      }
      this.lastSearchContext = context;
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !this.mapElement) return;
    try {
      const imported = await import('leaflet');
      const moduleWithDefault = imported as unknown as { default?: typeof import('leaflet') };
      this.leaflet = moduleWithDefault.default ?? imported;
      const L = this.leaflet;
      this.map = L.map(this.mapElement.nativeElement, { center: [-32.5, -63.5], zoom: 5 });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);
      this.map.on('click', (event: LeafletMouseEvent) => this.choosePoint(event.latlng.lat, event.latlng.lng));

      if (this.pendingInitial) {
        this.placeMarker(this.pendingInitial.latitud, this.pendingInitial.longitud, 17);
      }
      setTimeout(() => this.map?.invalidateSize(), 0);
    } catch {
      this.mapLoadError.set(true);
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  protected search(): void {
    const direccion = this.direccion().trim();
    const ciudad = this.ciudad().trim();
    const provincia = this.provincia().trim();
    this.error.set('');
    this.results.set([]);
    if (!direccion || !ciudad || !provincia) {
      this.error.set('Completá provincia, ciudad y dirección antes de buscar.');
      return;
    }

    this.searching.set(true);
    this.ubicaciones.buscarDireccion(direccion, ciudad, provincia)
      .pipe(finalize(() => this.searching.set(false)))
      .subscribe({
        next: (results) => {
          this.results.set(results);
          if (!results.length) {
            this.error.set('No encontramos esa dirección. Probá con el nombre completo de la calle y luego marcá el punto en el mapa.');
            return;
          }
          this.selectResult(results[0]);
        },
        error: (err) => this.error.set(err?.error?.message ?? 'No pudimos buscar la dirección. Intentá nuevamente.'),
      });
  }

  protected selectResult(result: ResultadoGeocodificacion): void {
    this.selectedName.set(result.nombre);
    this.choosePoint(result.latitud, result.longitud, 17);
  }

  protected confirm(): void {
    const point = this.candidate();
    if (!point) return;
    this.confirmed.set(true);
    this.locationConfirmed.emit(point);
  }

  private choosePoint(latitud: number, longitud: number, zoom?: number): void {
    this.candidate.set({ latitud, longitud });
    this.confirmed.set(false);
    this.placeMarker(latitud, longitud, zoom);
  }

  private placeMarker(latitud: number, longitud: number, zoom?: number): void {
    if (!this.map || !this.leaflet) return;
    if (!this.marker) {
      const icon = this.leaflet.divIcon({
        className: 'depa-map-marker',
        html: '<span aria-hidden="true"></span>',
        iconSize: [38, 48],
        iconAnchor: [19, 45],
      });
      this.marker = this.leaflet.marker([latitud, longitud], { draggable: true, icon }).addTo(this.map);
      this.marker.on('dragend', () => {
        const position = this.marker!.getLatLng();
        this.candidate.set({ latitud: position.lat, longitud: position.lng });
        this.confirmed.set(false);
      });
    } else {
      this.marker.setLatLng([latitud, longitud]);
    }
    this.map.setView([latitud, longitud], zoom ?? Math.max(this.map.getZoom(), 15));
  }

  private resetCandidate(): void {
    this.pendingInitial = null;
    this.candidate.set(null);
    this.confirmed.set(false);
    this.selectedName.set('');
    this.results.set([]);
    if (this.map && this.marker) this.map.removeLayer(this.marker);
    this.marker = null;
  }
}
