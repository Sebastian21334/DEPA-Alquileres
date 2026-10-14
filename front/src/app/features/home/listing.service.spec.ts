import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ListingService } from './listing.service';

describe('ListingService: filtros de ubicación', () => {
  let http: HttpTestingController;
  let service: ListingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ListingService);
  });

  afterEach(() => http.verify());

  it('filtra la provincia completa sin descargar ni enviar todas sus localidades', () => {
    service.getActivas({ idProvincia: 14 }).subscribe();
    const solicitud = http.expectOne((req) => req.url.endsWith('/publicaciones'));
    expect(solicitud.request.params.get('idProvincia')).toBe('14');
    expect(solicitud.request.params.has('idsCiudad')).toBe(false);
    solicitud.flush({ datos: [], pagina: 1, limite: 12, total: 0, totalPaginas: 0 });
  });

  it('combina la provincia con la localidad seleccionada', () => {
    service.getActivas({ idProvincia: 14, idsCiudad: [42] }).subscribe();
    const solicitud = http.expectOne((req) => req.url.endsWith('/publicaciones'));
    expect(solicitud.request.params.get('idProvincia')).toBe('14');
    expect(solicitud.request.params.get('idsCiudad')).toBe('42');
    solicitud.flush({ datos: [], pagina: 1, limite: 12, total: 0, totalPaginas: 0 });
  });
});
