import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, map, of, switchMap } from 'rxjs';
import { ListingService } from '../home/listing.service';
import { CatalogoService } from '../../shared/services/catalogo.service';
import { UbicacionService } from '../../shared/services/ubicacion.service';
import {
  AvailabilityService,
  FechaDisponibleAdministracion,
} from '../../shared/services/availability.service';
import { Modalidad, TipoMoneda, TipoPropiedad } from '../../shared/models/catalogo.model';
import { Ciudad, Provincia } from '../../shared/models/ubicacion.model';
import { PublicacionPayload } from '../../shared/models/publicacion.model';
import { AuthService } from '../../core/services/auth.service';
import { AvailabilityCalendarComponent } from '../../shared/components/availability-calendar/availability-calendar.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-publication-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AvailabilityCalendarComponent, SpinnerComponent],
  templateUrl: './publication-form.component.html',
  styleUrl: './publication-form.component.scss',
})
export class PublicationFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly listings = inject(ListingService);
  private readonly catalogs = inject(CatalogoService);
  private readonly locations = inject(UbicacionService);
  private readonly availabilityApi = inject(AvailabilityService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly auth = inject(AuthService);

  protected readonly publicationId = Number(this.route.snapshot.paramMap.get('id')) || null;
  protected readonly editing = this.publicationId !== null;
  protected readonly loading = signal(this.editing);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly modalidades = signal<Modalidad[]>([]);
  protected readonly monedas = signal<TipoMoneda[]>([]);
  protected readonly tiposPropiedad = signal<TipoPropiedad[]>([]);
  protected readonly ciudades = signal<Ciudad[]>([]);
  protected readonly selectedProvince = signal<number | null>(null);
  protected readonly selectedModality = signal<number | null>(null);
  protected readonly availability = signal<FechaDisponibleAdministracion[]>([]);
  protected readonly availabilityStart = signal<string | null>(null);
  protected readonly availabilityEnd = signal<string | null>(null);
  protected readonly provincias = computed<Provincia[]>(() => {
    const unique = new Map<number, Provincia>();
    for (const city of this.ciudades()) {
      if (city.provincia) unique.set(city.provincia.id, city.provincia);
    }
    return Array.from(unique.values()).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  });
  protected readonly filteredCities = computed(() => {
    const province = this.selectedProvince();
    return this.ciudades().filter((city) => !province || city.provincia?.id === province);
  });
  protected readonly isTemporary = computed(() => {
    const selected = this.modalidades().find((item) => item.id === this.selectedModality());
    return selected?.permite_reservas_por_fecha ?? selected?.nombre.toLowerCase().includes('tempor') ?? false;
  });

  protected readonly form = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(255)]],
    descripcion: ['', Validators.required],
    precio: [null as number | null, [Validators.required, Validators.min(1)]],
    direccion: ['', [Validators.required, Validators.maxLength(255)]],
    cantidad_ambientes: [null as number | null, [Validators.required, Validators.min(1)]],
    superficie: [null as number | null, [Validators.required, Validators.min(1)]],
    idTipoMoneda: [null as number | null, Validators.required],
    idModalidad: [null as number | null, Validators.required],
    idProvincia: [null as number | null, Validators.required],
    idCiudad: [null as number | null, Validators.required],
    idTipoPropiedad: [null as number | null, Validators.required],
  });

  constructor() {
    if (!this.auth.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.form.controls.idModalidad.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.selectedModality.set(value));
    this.form.controls.idProvincia.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.selectedProvince.set(value);
        const currentCity = this.ciudades().find((city) => city.id === this.form.controls.idCiudad.value);
        if (currentCity && currentCity.provincia?.id !== value) this.form.controls.idCiudad.setValue(null);
      });

    forkJoin({
      modalidades: this.catalogs.getModalidades(),
      monedas: this.catalogs.getTiposMoneda(),
      tipos: this.catalogs.getTiposPropiedad(),
      ciudades: this.locations.getTodasCiudades(),
    }).subscribe({
      next: ({ modalidades, monedas, tipos, ciudades }) => {
        this.modalidades.set(modalidades);
        this.monedas.set(monedas);
        this.tiposPropiedad.set(tipos);
        this.ciudades.set(ciudades);
      },
      error: () => this.error.set('No se pudieron cargar los datos necesarios para publicar.'),
    });

    if (this.publicationId) this.loadPublication(this.publicationId);
  }

  protected selectAvailabilityDate(date: string): void {
    const start = this.availabilityStart();
    if (!start || this.availabilityEnd() || date <= start) {
      this.availabilityStart.set(date);
      this.availabilityEnd.set(null);
      return;
    }
    this.availabilityEnd.set(date);
  }

  protected toggleAvailability(item: FechaDisponibleAdministracion): void {
    if (item.reserva) {
      this.error.set('Ese día pertenece a una reserva confirmada y no puede modificarse.');
      return;
    }
    this.error.set('');
    this.availabilityApi.setAvailable(item.id, !item.disponible).subscribe({
      next: (updated) => this.availability.update((items) =>
        items.map((current) => current.id === updated.id ? { ...current, disponible: updated.disponible } : current),
      ),
      error: (err) => this.error.set(err?.error?.message ?? 'No se pudo modificar ese día.'),
    });
  }

  protected submit(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Revisá los campos obligatorios antes de continuar.');
      return;
    }
    if (this.isTemporary() && !this.editing && (!this.availabilityStart() || !this.availabilityEnd())) {
      this.error.set('En un alquiler temporal debés seleccionar el primer y el último día disponible.');
      return;
    }
    if (this.isTemporary() && this.editing && !this.availability().length && (!this.availabilityStart() || !this.availabilityEnd())) {
      this.error.set('La publicación temporal debe tener al menos un rango de días disponibles.');
      return;
    }

    const raw = this.form.getRawValue();
    const payload: PublicacionPayload = {
      titulo: raw.titulo!,
      descripcion: raw.descripcion!,
      precio: Number(raw.precio),
      direccion: raw.direccion!,
      cantidad_ambientes: Number(raw.cantidad_ambientes),
      superficie: Number(raw.superficie),
      idTipoMoneda: Number(raw.idTipoMoneda),
      idModalidad: Number(raw.idModalidad),
      idProvincia: Number(raw.idProvincia),
      idCiudad: Number(raw.idCiudad),
      idTipoPropiedad: Number(raw.idTipoPropiedad),
    };

    this.saving.set(true);
    const save$ = this.publicationId
      ? this.listings.update(this.publicationId, payload)
      : this.listings.create(payload);

    save$.pipe(
      switchMap((publication) => {
        const start = this.availabilityStart();
        const end = this.availabilityEnd();
        if (this.isTemporary() && start && end) {
          return this.availabilityApi.addRange(publication.id, start, end).pipe(map(() => publication));
        }
        return of(publication);
      }),
      finalize(() => this.saving.set(false)),
    ).subscribe({
      next: (publication) => this.router.navigate(['/publicaciones', publication.id]),
      error: (err) => this.error.set(err?.error?.message ?? 'No se pudo guardar la publicación.'),
    });
  }

  private loadPublication(id: number): void {
    this.listings.getById(id).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (item) => {
        if (item.anunciante?.idUsuario !== this.auth.currentUser()?.sub) {
          this.error.set('No tenés permiso para modificar esta publicación.');
          this.form.disable();
          return;
        }
        this.form.patchValue({
          titulo: item.titulo,
          descripcion: item.descripcion,
          precio: Number(item.precio),
          direccion: item.direccion,
          cantidad_ambientes: item.cantidad_ambientes,
          superficie: Number(item.superficie),
          idTipoMoneda: item.tipoMoneda?.id ?? null,
          idModalidad: item.modalidad?.id ?? null,
          idProvincia: item.provincia?.id ?? null,
          idCiudad: item.ciudad?.id ?? null,
          idTipoPropiedad: item.tipoPropiedad?.id ?? null,
        });
        this.selectedProvince.set(item.provincia?.id ?? null);
        this.selectedModality.set(item.modalidad?.id ?? null);
        this.availabilityApi.getForAdministration(id).subscribe({
          next: (dates) => this.availability.set(dates),
        });
      },
      error: () => this.error.set('No se pudo cargar la publicación que querés modificar.'),
    });
  }
}
