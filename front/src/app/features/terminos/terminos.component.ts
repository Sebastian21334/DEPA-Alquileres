import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

interface PoliticaCancelacion {
  vigenteDesde: string;
  diasDevolucionTotal: number;
  diasDevolucionParcial: number;
  porcentajeTotal: number;
  porcentajeParcial: number;
  porcentajeFueraDePlazo: number;
}

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './terminos.component.html',
  styleUrl: './terminos.component.scss',
})
export class TerminosComponent {
  private readonly http = inject(HttpClient);
  private readonly parametros = toSignal(inject(ActivatedRoute).paramMap);
  protected readonly anunciante = computed(() => this.parametros()?.get('tipo') === 'anunciantes');
  protected readonly politica = signal<PoliticaCancelacion | null>(null);
  protected readonly comision = signal<number | null>(null);
  protected readonly errorPolitica = signal(false);
  protected readonly errorComision = signal(false);

  constructor() {
    this.http.get<PoliticaCancelacion>(`${environment.apiUrl}/reservas/politica-cancelacion/vigente`).subscribe({
      next: (politica) => this.politica.set(politica),
      error: () => this.errorPolitica.set(true),
    });
    this.http.get<{ porcentaje: number }>(`${environment.apiUrl}/catalogos/comision-vigente`).subscribe({
      next: ({ porcentaje }) => this.comision.set(porcentaje),
      error: () => this.errorComision.set(true),
    });
  }
}
