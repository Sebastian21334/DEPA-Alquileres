import { environment } from '../../../environments/environment';

export function crearCapaMapaBase(leaflet: typeof import('leaflet')) {
  return leaflet.tileLayer(environment.mapTileUrl, {
    maxZoom: 19,
    noWrap: true,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });
}
