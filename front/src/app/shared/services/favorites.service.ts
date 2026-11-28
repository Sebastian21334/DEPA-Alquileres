import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { EMPTY, Observable, defer, filter, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { Publicacion } from '../models/publicacion.model';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/favoritos`;
  private readonly tokenActual = computed(() => this.auth.currentUser() ? this.auth.token : null);
  private readonly estado = signal<{ token: string; ids: ReadonlySet<number> } | null>(null);
  private revision = 0;

  constructor() {
    effect((onCleanup) => {
      const token = this.tokenActual();
      this.estado.set(null);
      if (!token) return;
      const consulta = this.list().subscribe({ error: () => {} });
      onCleanup(() => consulta.unsubscribe());
    });
  }

  isFavorite(idPublicacion: number): boolean {
    return this.idsVigentes()?.has(idPublicacion) ?? false;
  }

  list(): Observable<Publicacion[]> {
    return defer(() => {
      const token = this.auth.token;
      if (!token || !this.auth.currentUser()) return EMPTY;
      const revision = this.revision;
      return this.http.get<Publicacion[]>(this.baseUrl).pipe(
        filter(() => this.perteneceALaSesion(token)),
        tap((items) => {
          if (this.revision === revision) this.estado.set({ token, ids: new Set(items.map(({ id }) => id)) });
        }),
      );
    });
  }

  toggle(idPublicacion: number): Observable<{ idPublicacion: number; favorito: boolean }> {
    return defer(() => {
      const token = this.auth.token;
      if (!token || !this.auth.currentUser()) return EMPTY;
      const url = `${this.baseUrl}/${idPublicacion}`;
      const request = this.isFavorite(idPublicacion)
        ? this.http.delete<{ idPublicacion: number; favorito: boolean }>(url)
        : this.http.post<{ idPublicacion: number; favorito: boolean }>(url, {});

      return request.pipe(
        filter(() => this.perteneceALaSesion(token)),
        tap(({ favorito }) => {
          const ids = new Set(this.idsVigentes());
          if (favorito) ids.add(idPublicacion);
          else ids.delete(idPublicacion);
          this.revision++;
          this.estado.set({ token, ids });
        }),
      );
    });
  }

  private idsVigentes(): ReadonlySet<number> | undefined {
    const estado = this.estado();
    return estado && this.perteneceALaSesion(estado.token) ? estado.ids : undefined;
  }

  private perteneceALaSesion(token: string): boolean {
    return !!this.auth.currentUser() && token === this.auth.token;
  }
}
