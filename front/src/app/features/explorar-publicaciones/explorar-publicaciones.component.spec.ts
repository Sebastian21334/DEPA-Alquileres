import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { vi } from 'vitest';
import { ExplorarPublicacionesComponent } from './explorar-publicaciones.component';
import { ListingService, PaginaPublicaciones } from '../home/listing.service';
import { CatalogoService } from '../../shared/services/catalogo.service';

describe('ExplorarPublicacionesComponent: cambios de ubicación', () => {
  let fixture: ComponentFixture<ExplorarPublicacionesComponent>;
  let peticiones: Subject<PaginaPublicaciones>[];
  const getActivas = vi.fn();

  beforeEach(async () => {
    vi.useFakeTimers();
    peticiones = [];
    getActivas.mockReset().mockImplementation(() => {
      const peticion = new Subject<PaginaPublicaciones>();
      peticiones.push(peticion);
      return peticion;
    });
    await TestBed.configureTestingModule({
      imports: [ExplorarPublicacionesComponent],
      providers: [
        { provide: ListingService, useValue: { getActivas } },
        {
          provide: CatalogoService,
          useValue: {
            getModalidades: () => of([]),
            getTiposPropiedad: () => of([]),
            getTiposMoneda: () => of([]),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: new BehaviorSubject(convertToParamMap({})) },
        },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
      ],
    })
      .overrideComponent(ExplorarPublicacionesComponent, {
        set: { template: '{{ resultado().total }}', imports: [] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(ExplorarPublicacionesComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
  });

  it('actualiza los resultados al elegir provincia aunque la URL siga en la primera página', async () => {
    fixture.componentInstance['form'].controls.idProvincia.setValue(14);
    await vi.advanceTimersByTimeAsync(300);
    expect(getActivas).toHaveBeenLastCalledWith(
      expect.objectContaining({ pagina: 1, idProvincia: 14, idsCiudad: [] }),
    );
    expect(peticiones).toHaveLength(2);
  });

  it('impide que una respuesta vieja reemplace los resultados de la nueva ubicación', async () => {
    const anterior = peticiones[0];
    fixture.componentInstance['form'].patchValue({ idProvincia: 14, idsCiudad: [42] });
    await vi.advanceTimersByTimeAsync(300);
    expect(anterior.observed).toBe(false);
    peticiones[1].next({ datos: [], pagina: 1, limite: 12, total: 2, totalPaginas: 1 });
    anterior.next({ datos: [], pagina: 1, limite: 12, total: 999, totalPaginas: 84 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('2');
  });

  it('aplica ambientes y superficie automáticamente y los quita al limpiar los campos', async () => {
    fixture.componentInstance['form'].patchValue({
      ambientesSeleccionados: ['4+'],
      superficieMin: 50,
    });
    await vi.advanceTimersByTimeAsync(300);
    expect(getActivas).toHaveBeenLastCalledWith(
      expect.objectContaining({ ambientes: ['4+'], superficieMin: 50, pagina: 1 }),
    );

    fixture.componentInstance['form'].patchValue({
      ambientesSeleccionados: [],
      superficieMin: null,
    });
    await vi.advanceTimersByTimeAsync(300);
    expect(getActivas).toHaveBeenLastCalledWith(
      expect.objectContaining({ ambientes: [], superficieMin: null }),
    );
  });
});
