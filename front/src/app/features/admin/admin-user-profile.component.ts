import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-admin-user-profile',
  imports: [RouterLink, AvatarComponent],
  template: `
    <main>
      <a routerLink="/admin" fragment="reclamos">← Volver a reclamos</a>
      @if (estado(); as vista) {
        @if (vista.perfil; as perfil) {
          <article>
            <header>
              <app-avatar [foto]="perfil.foto_url" [nombre]="perfil.nombre" />
              <div>
                <p>Perfil de usuario #{{ perfil.id }}</p>
                <h1>{{ perfil.nombre }} {{ perfil.apellido }}</h1>
              </div>
            </header>
            <dl>
              <dt>Rol</dt><dd>{{ perfil.rol?.nombre || 'Sin rol' }}</dd>
              <dt>Correo</dt><dd>{{ perfil.email || 'Sin correo registrado' }}</dd>
              <dt>Teléfono</dt><dd>{{ perfil.telefono || 'Sin teléfono registrado' }}</dd>
              <dt>Estado de la cuenta</dt>
              <dd>{{ !perfil.activa ? 'Dada de baja' : perfil.bloqueado ? 'Bloqueada' : 'Activa' }}</dd>
            </dl>
          </article>
        } @else {
          <p role="status">{{ vista.mensaje }}</p>
        }
      }
    </main>
  `,
  styles: `
    main { width: min(100% - 2rem, 45rem); margin: 2rem auto; color: #101d36; }
    article { margin-top: 1rem; padding: 1.5rem; border: 1px solid #dce4ef; border-radius: .75rem; }
    header { display: flex; align-items: center; gap: 1rem; }
    app-avatar { width: 3.75rem; height: 3.75rem; flex: none; border-radius: 50%; background: #d4dfff; }
    h1, p { margin: 0; overflow-wrap: anywhere; }
    dl { margin: 1.25rem 0 0; }
    dt { font-weight: 700; }
    dd { margin: 0 0 .75rem; overflow-wrap: anywhere; }
    dd:last-child { margin-bottom: 0; }
  `,
})
export class AdminUserProfileComponent {
  private readonly api = inject(AdminService);
  protected readonly estado = toSignal(inject(ActivatedRoute).paramMap.pipe(
    switchMap((params) => {
      const id = Number(params.get('id'));
      if (!Number.isSafeInteger(id) || id < 1) {
        return of({ perfil: null, mensaje: 'El perfil solicitado no es válido.' });
      }
      return this.api.obtenerPerfilUsuario(id).pipe(
        map((perfil) => ({ perfil, mensaje: '' })),
        startWith({ perfil: null, mensaje: 'Cargando perfil…' }),
        catchError(() => of({ perfil: null, mensaje: 'No pudimos cargar el perfil.' })),
      );
    }),
  ));
}
