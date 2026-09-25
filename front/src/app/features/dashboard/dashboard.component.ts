import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Publicacion } from '../../shared/models/publicacion.model';
import { GestionPublicacionesService } from '../../shared/services/gestion-publicaciones.service';
import { Reserva, ReservationService } from '../../shared/services/reservation.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

interface SerieMensual {
  key: string;
  label: string;
  ingresos: number;
  reservas: number;
}

interface RendimientoPublicacion {
  publicacion: Publicacion;
  visualizaciones: number;
  reservas: number;
  ingresos: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, SpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly publicacionesApi = inject(GestionPublicacionesService);
  private readonly reservasApi = inject(ReservationService);

  protected readonly publicaciones = signal<Publicacion[]>([]);
  protected readonly reservas = signal<Reserva[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  protected readonly reservasValidas = computed(() => this.reservas().filter((reserva) => !reserva.cancelada));
  protected readonly totalVisualizaciones = computed(() =>
    this.publicaciones().reduce((total, publicacion) => total + Number(publicacion.visualizaciones ?? 0), 0),
  );
  protected readonly publicacionesActivas = computed(() => this.publicaciones().filter((item) => item.activa).length);
  protected readonly ingresos = computed(() =>
    this.reservasValidas().reduce((total, reserva) => total + Number(reserva.monto_pago ?? 0), 0),
  );
  protected readonly pendientes = computed(() =>
    this.reservasValidas().filter((reserva) => !reserva.finalizada).length,
  );
  protected readonly conversion = computed(() => {
    const vistas = this.totalVisualizaciones();
    return vistas ? Math.min(100, (this.reservasValidas().length / vistas) * 100) : 0;
  });

  protected readonly serieMensual = computed<SerieMensual[]>(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: new Intl.DateTimeFormat('es-AR', { month: 'short' }).format(date).replace('.', ''),
        ingresos: 0,
        reservas: 0,
      };
    });
    const byMonth = new Map(months.map((month) => [month.key, month]));
    for (const reserva of this.reservasValidas()) {
      const month = byMonth.get(reserva.fecha_pago?.slice(0, 7));
      if (!month) continue;
      month.reservas += 1;
      month.ingresos += Number(reserva.monto_pago ?? 0);
    }
    return months;
  });

  protected readonly linePoints = computed(() => {
    const max = Math.max(...this.serieMensual().map((item) => item.ingresos), 1);
    return this.serieMensual()
      .map((item, index) => `${20 + index * 112},${190 - (item.ingresos / max) * 150}`)
      .join(' ');
  });
  protected readonly areaPath = computed(() => `M20 190 L${this.linePoints().replaceAll(' ', ' L')} L580 190 Z`);

  protected readonly actividadSemanal = computed(() => {
    const days = [
      { label: 'Lun', day: 1, value: 0 }, { label: 'Mar', day: 2, value: 0 },
      { label: 'Mié', day: 3, value: 0 }, { label: 'Jue', day: 4, value: 0 },
      { label: 'Vie', day: 5, value: 0 }, { label: 'Sáb', day: 6, value: 0 },
      { label: 'Dom', day: 0, value: 0 },
    ];
    for (const reserva of this.reservasValidas()) {
      const value = reserva.fecha_inicio ?? reserva.fecha_pago;
      if (!value) continue;
      const day = new Date(`${value.slice(0, 10)}T12:00:00`).getDay();
      const target = days.find((item) => item.day === day);
      if (target) target.value += 1;
    }
    return days;
  });
  protected readonly maxActividad = computed(() => Math.max(...this.actividadSemanal().map((item) => item.value), 1));

  protected readonly rendimiento = computed<RendimientoPublicacion[]>(() => {
    const aggregates = new Map<number, { reservas: number; ingresos: number }>();
    for (const reserva of this.reservasValidas()) {
      const id = reserva.publicacion?.id;
      if (!id) continue;
      const current = aggregates.get(id) ?? { reservas: 0, ingresos: 0 };
      current.reservas += 1;
      current.ingresos += Number(reserva.monto_pago ?? 0);
      aggregates.set(id, current);
    }
    return this.publicaciones()
      .map((publicacion) => ({
        publicacion,
        visualizaciones: Number(publicacion.visualizaciones ?? 0),
        reservas: aggregates.get(publicacion.id)?.reservas ?? 0,
        ingresos: aggregates.get(publicacion.id)?.ingresos ?? 0,
      }))
      .sort((a, b) => b.visualizaciones - a.visualizaciones || b.reservas - a.reservas)
      .slice(0, 5);
  });

  constructor() {
    const id = Number(this.auth.currentUser()?.sub);
    forkJoin({
      publicaciones: this.publicacionesApi.listarMias(id),
      reservas: this.reservasApi.received(),
    }).subscribe({
      next: ({ publicaciones, reservas }) => {
        this.publicaciones.set(publicaciones);
        this.reservas.set(reservas);
        this.cargando.set(false);
      },
      error: (error) => {
        this.error.set(error?.error?.message ?? 'No pudimos cargar las métricas del panel.');
        this.cargando.set(false);
      },
    });
  }

  protected moneda(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
    }).format(value);
  }

  protected numero(value: number): string {
    return new Intl.NumberFormat('es-AR').format(value);
  }

  protected porcentaje(value: number): string {
    return `${value.toLocaleString('es-AR', { maximumFractionDigits: 1 })}%`;
  }

  protected alturaBarra(value: number): number {
    return value ? Math.max(14, (value / this.maxActividad()) * 100) : 8;
  }
}
