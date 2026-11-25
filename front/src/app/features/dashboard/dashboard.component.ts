import { EsqueletoListaComponent } from '../../shared/components/esqueleto-lista/esqueleto-lista.component';
import { formatearImporteConMoneda, formatearMoneda } from '../../shared/utils/formato-numero';
import { fechaCalendarioLocal } from '../../shared/utils/rental-dates';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { activarActualizacionReservas } from '../../shared/utils/reservation-refresh';
import { estadiaActiva } from '../../shared/utils/reservation-state';
import { RouterLink } from '@angular/router';
import { LucideEye, LucideHouse, LucideCalendarDays, LucideWallet } from '@lucide/angular';
import { forkJoin, Subscription } from 'rxjs';
import { ApiError } from '../../core/interceptors/api-error';
import { AuthService } from '../../core/services/auth.service';
import { Publicacion } from '../../shared/models/publicacion.model';
import { GestionPublicacionesService, type PagoPublicacion } from '../../shared/services/gestion-publicaciones.service';
import { Reserva, ReservationService } from '../../shared/services/reservation.service';
import { HistorialLiquidacionesComponent } from '../../shared/components/historial-liquidaciones/historial-liquidaciones.component';
import { PaginadorComponent } from '../../shared/components/paginador/paginador.component';
import { SearchFieldComponent } from '../../shared/components/search-field/search-field.component';
import { normalizarTexto } from '../../shared/utils/texto';

interface SerieEvolucion {
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
  imports: [RouterLink, EsqueletoListaComponent, PaginadorComponent, SearchFieldComponent, HistorialLiquidacionesComponent, LucideEye, LucideHouse, LucideCalendarDays, LucideWallet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly publicacionesApi = inject(GestionPublicacionesService);
  private readonly reservasApi = inject(ReservationService);
  private readonly destroyRef = inject(DestroyRef);
  private consultaReservas?: Subscription;

  protected readonly publicaciones = signal<Publicacion[]>([]);
  protected readonly reservas = signal<Reserva[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  /** Historial de pagos de todas las publicaciones; null mientras carga. */
  protected readonly pagos = signal<PagoPublicacion[] | null>(null);
  protected readonly errorPagos = signal(false);
  protected readonly periodo = signal<'dias' | 'semanas' | 'meses'>('meses');
  protected readonly verTodasPendientes = signal(false);
  protected readonly liquidacionesPendientes = computed(() => this.reservas().filter(reserva =>
    reserva.estado_pago === 'APROBADO' &&
    ['RETENIDO', 'EN_REVISION', 'PENDIENTE_PAGO_PROPIETARIO', 'DEVUELTO_PARCIAL_INQUILINO'].includes(reserva.estado_liquidacion),
  ));
  protected readonly pendientesVisibles = computed(() => this.verTodasPendientes()
    ? this.liquidacionesPendientes()
    : this.liquidacionesPendientes().slice(0, 5));

  protected readonly reservasValidas = computed(() => this.reservas().filter((reserva) => !reserva.cancelada));
  protected readonly totalVisualizaciones = computed(() =>
    this.publicaciones().reduce((total, publicacion) => total + Number(publicacion.visualizaciones ?? 0), 0),
  );
  protected readonly publicacionesActivas = computed(() => this.publicaciones().filter((item) => item.activa).length);
  protected readonly ingresos = computed(() =>
    this.reservasValidas().reduce((total, reserva) => total + Number(reserva.monto_pago ?? 0), 0),
  );
  protected readonly pendientes = computed(() =>
    this.reservasValidas().filter(estadiaActiva).length,
  );
  protected readonly conversion = computed(() => {
    const vistas = this.totalVisualizaciones();
    return vistas ? Math.min(100, (this.reservasValidas().length / vistas) * 100) : 0;
  });

  protected readonly serieMensual = computed<SerieEvolucion[]>(() => {
    const fechaActual = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const hoy = new Date(fechaActual + 'T12:00:00Z');
    const periodo = this.periodo();
    const cantidad = periodo === 'meses' ? 6 : periodo === 'semanas' ? 8 : 14;
    const inicio = new Date(hoy);
    if (periodo === 'meses') inicio.setUTCDate(1);
    if (periodo === 'semanas') inicio.setUTCDate(inicio.getUTCDate() - (inicio.getUTCDay() + 6) % 7);
    const intervalos = Array.from({ length: cantidad }, (_, index) => {
      const fecha = new Date(inicio);
      const desplazamiento = index - cantidad + 1;
      if (periodo === 'meses') fecha.setUTCMonth(fecha.getUTCMonth() + desplazamiento);
      else fecha.setUTCDate(fecha.getUTCDate() + desplazamiento * (periodo === 'semanas' ? 7 : 1));
      const key = fecha.toISOString().slice(0, 10);
      const label = periodo === 'meses'
        ? new Intl.DateTimeFormat('es-AR', { month: 'short', year: '2-digit', timeZone: 'UTC' }).format(fecha).replace('.', '')
        : new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(fecha);
      return { key, label, ingresos: 0, reservas: 0 };
    });
    const porFecha = new Map(intervalos.map((item) => [item.key, item]));
    for (const reserva of this.reservasValidas()) {
      if (!reserva.fecha_pago) continue;
      const fechaPago = new Date(reserva.fecha_pago);
      if (!Number.isFinite(fechaPago.getTime())) continue;
      const fechaArgentina = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(fechaPago);
      const fecha = new Date(fechaArgentina + 'T12:00:00Z');
      if (periodo === 'meses') fecha.setUTCDate(1);
      if (periodo === 'semanas') fecha.setUTCDate(fecha.getUTCDate() - (fecha.getUTCDay() + 6) % 7);
      const intervalo = porFecha.get(fecha.toISOString().slice(0, 10));
      if (!intervalo) continue;
      intervalo.reservas += 1;
      intervalo.ingresos += Number(reserva.monto_pago ?? 0);
    }
    return intervalos;
  });

  protected readonly linePoints = computed(() => {
    const max = Math.max(...this.serieMensual().map((item) => item.ingresos), 1);
    return this.serieMensual()
      .map((item, index) => `${20 + index * 560 / (this.serieMensual().length - 1)},${190 - (item.ingresos / max) * 150}`)
      .join(' ');
  });
  protected readonly areaPath = computed(() => `M20 190 L${this.linePoints().replaceAll(' ', ' L')} L580 190 Z`);
  protected readonly totalPeriodo = computed(() => this.serieMensual().reduce((total, item) => total + item.ingresos, 0));
  protected readonly tituloPeriodo = computed(() => ({ dias: 'Últimos 14 días', semanas: 'Últimas 8 semanas', meses: 'Últimos 6 meses' })[this.periodo()]);

  protected estadoLiquidacion(reserva: Reserva): string {
    const estados: Record<string, string> = {
      RETENIDO: 'Pago retenido', EN_REVISION: 'En revisión',
      PENDIENTE_PAGO_PROPIETARIO: 'Pendiente de pago', DEVUELTO_PARCIAL_INQUILINO: 'Devolución parcial · resto pendiente',
    };
    return estados[reserva.estado_liquidacion] ?? reserva.estado_liquidacion;
  }

  protected exportarPdf(): void {
    window.print();
  }

  protected importePago(importe: number, moneda: string | null): string {
    return formatearImporteConMoneda(importe, moneda);
  }

  protected fechaReporte(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
  }

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
      const day = fechaCalendarioLocal(value).getDay();
      const target = days.find((item) => item.day === day);
      if (target) target.value += 1;
    }
    return days;
  });
  protected readonly maxActividad = computed(() => Math.max(...this.actividadSemanal().map((item) => item.value), 1));

  protected readonly rendimientoCompleto = computed<RendimientoPublicacion[]>(() => {
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
      .sort((a, b) => b.visualizaciones - a.visualizaciones || b.reservas - a.reservas);
  });

  protected readonly busquedaRendimiento = signal('');
  protected readonly paginaRendimiento = signal(1);
  protected readonly rendimientoFiltrado = computed(() => {
    const terminos = normalizarTexto(this.busquedaRendimiento()).trim().split(/\s+/).filter(Boolean);
    if (!terminos.length) return this.rendimientoCompleto();
    return this.rendimientoCompleto().filter(({ publicacion }) => {
      const texto = normalizarTexto(publicacion.titulo);
      return terminos.every((termino) => texto.includes(termino));
    });
  });
  protected readonly paginasRendimiento = computed(() => Math.max(1, Math.ceil(this.rendimientoFiltrado().length / 5)));
  protected readonly paginaRendimientoActual = computed(() => Math.min(this.paginaRendimiento(), this.paginasRendimiento()));
  protected readonly rendimiento = computed(() => {
    const pagina = this.paginaRendimientoActual();
    return this.rendimientoFiltrado().slice((pagina - 1) * 5, pagina * 5);
  });

  constructor() {
    activarActualizacionReservas(() => {
      if (this.cargando()) return;
      this.consultaReservas?.unsubscribe();
      this.consultaReservas = this.reservasApi.received().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (reservas) => this.reservas.set(reservas),
        error: () => {},
      });
    });
    const id = Number(this.auth.currentUser()?.sub);
    forkJoin({
      publicaciones: this.publicacionesApi.listarMias(id),
      reservas: this.reservasApi.received(),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ publicaciones, reservas }) => {
        this.publicaciones.set(publicaciones);
        this.reservas.set(reservas);
        this.cargando.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message);
        this.cargando.set(false);
      },
    });
    this.cargarPagos();
  }

  /** Va aparte del resto del panel: si falla, el panel se sigue mostrando. */
  protected cargarPagos(): void {
    this.pagos.set(null);
    this.errorPagos.set(false);
    this.publicacionesApi.listarMisLiquidaciones().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (pagos) => this.pagos.set(pagos),
      error: () => this.errorPagos.set(true),
    });
  }

  protected moneda(value: number): string {
    return formatearMoneda(value, 'ARS', 0);
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

  protected buscarRendimiento(texto: string): void {
    this.busquedaRendimiento.set(texto);
    this.paginaRendimiento.set(1);
  }
}
