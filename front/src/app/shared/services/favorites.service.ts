import { HttpClient } from '@angular/common/http';
import { Injectable, effect, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { Publicacion } from '../models/publicacion.model';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/favoritos`;
  private readonly ids = signal<ReadonlySet<number>>(new Set());
  private loadedForUser: number | null = null;

  constructor() {
    effect(() => {
      const idUsuario = this.auth.currentUser()?.sub ?? null;
      if (idUsuario === null) {
        this.loadedForUser = null;
        this.ids.set(new Set());
        return;
      }
      if (this.loadedForUser === idUsuario) return;
      this.loadedForUser = idUsuario;
      this.list().subscribe({ error: () => this.ids.set(new Set()) });
    });
  }

  isFavorite(idPublicacion: number): boolean {
    return this.ids().has(idPublicacion);
  }

  list(): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(this.baseUrl).pipe(
      tap((items) => this.ids.set(new Set(items.map((item) => item.id)))),
    );
  }

  toggle(idPublicacion: number): Observable<{ idPublicacion: number; favorito: boolean }> {
    const favorito = this.isFavorite(idPublicacion);
    const request = favorito
      ? this.http.delete<{ idPublicacion: number; favorito: boolean }>(`${this.baseUrl}/${idPublicacion}`)
      : this.http.post<{ idPublicacion: number; favorito: boolean }>(`${this.baseUrl}/${idPublicacion}`, {});

    return request.pipe(
      tap((result) => {
        const next = new Set(this.ids());
        result.favorito ? next.add(idPublicacion) : next.delete(idPublicacion);
        this.ids.set(next);
      }),
    );
  }
}
