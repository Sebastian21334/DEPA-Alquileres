import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogoService } from '../../shared/services/catalogo.service';
import { PoliticaCancelacion, ReservationService } from '../../shared/services/reservation.service';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './terminos.component.html',
  styleUrl: './terminos.component.scss',
})
export class TerminosComponent {
  private readonly reservas = inject(ReservationService);
  private readonly catalogos = inject(CatalogoService);
  private readonly parametros = toSignal(inject(ActivatedRoute).paramMap);
  protected readonly anunciante = computed(() => this.parametros()?.get('tipo') === 'anunciantes');
  protected readonly politica = signal<PoliticaCancelacion | null>(null);
  protected readonly comision = signal<number | null>(null);
  protected readonly errorPolitica = signal(false);
  protected readonly errorComision = signal(false);

  constructor() {
    this.reservas.politicaCancelacionVigente().pipe(takeUntilDestroyed()).subscribe({
      next: (politica) => this.politica.set(politica),
      error: () => this.errorPolitica.set(true),
    });
    this.catalogos.comisionVigente().pipe(takeUntilDestroyed()).subscribe({
      next: ({ porcentaje }) => this.comision.set(porcentaje),
      error: () => this.errorComision.set(true),
    });
  }
}
