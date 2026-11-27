import { contextoCarga } from '../interceptors/carga.interceptor';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PLATFORM_ID, computed, effect, inject, Injectable, signal } from '@angular/core';
import { EMPTY, catchError, exhaustMap, merge, Subject, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

interface ActividadReembolso {
  reembolsoId: number;
  reservaId: number;
  pendiente: boolean;
  mensajeId: number | null;
  texto: string | null;
  fecha: string | null;
}

@Injectable({ providedIn: 'root' })
export class ActividadReembolsosService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly navegador = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly usuario = computed(() => this.auth.currentUser()?.sub);
  private readonly actividad = signal<ActividadReembolso[]>([]);
  private readonly lecturas = signal<Record<number, number>>({});
  private readonly refresco = new Subject<void>();
  readonly pendientes = computed(() => new Set(this.actividad().filter(item => item.pendiente).map(item => item.reservaId)));
  readonly notificaciones = computed(() => this.actividad().filter(item =>
    item.mensajeId !== null && item.mensajeId > (this.lecturas()[item.reembolsoId] ?? 0)));

  constructor() {
    effect(onCleanup => {
      const usuario = this.usuario();
      this.actividad.set([]);
      this.lecturas.set({});
      if (!this.navegador || usuario == null) return;
      try {
        this.lecturas.set(JSON.parse(localStorage.getItem(this.clave(usuario)) ?? '{}') ?? {});
      } catch { /* La lectura funciona en memoria si el navegador bloquea el almacenamiento. */ }
      const consulta = merge(timer(0, 15000), this.refresco).pipe(exhaustMap(() =>
        this.http.get<ActividadReembolso[]>(`${environment.apiUrl}/reembolsos/actividad`, { context: contextoCarga(true) }).pipe(catchError(() => EMPTY)),
      )).subscribe(items => this.actividad.set(items));
      onCleanup(() => consulta.unsubscribe());
    });
  }

  actualizar(): void {
    this.refresco.next();
  }

  marcarLeido(reembolsoId: number, mensajeId: number): void {
    const usuario = this.usuario();
    if (!this.navegador || usuario == null || mensajeId <= (this.lecturas()[reembolsoId] ?? 0)) return;
    this.lecturas.update(actuales => ({ ...actuales, [reembolsoId]: mensajeId }));
    try {
      localStorage.setItem(this.clave(usuario), JSON.stringify(this.lecturas()));
    } catch { /* La lectura sigue registrada durante la sesión. */ }
  }

  private clave(usuario: string | number): string {
    return `depa:lecturas-reembolso:${usuario}`;
  }
}
