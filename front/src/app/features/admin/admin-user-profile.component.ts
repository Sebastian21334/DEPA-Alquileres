import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { VolverDirective } from '../../shared/directives/volver.directive';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-admin-user-profile',
  imports: [AvatarComponent, VolverDirective],
  // Mismo estilo que Mi perfil (cabecera y datos), con los datos que el admin ya veía.
  template: `
    <main class="acct-page">
      <div class="acct-wrap acct-wrap--narrow">
        <a class="volver" appVolver="/admin" fragmentoVolver="reclamos">← Volver</a>
        @if (estado(); as vista) {
          @if (vista.perfil; as perfil) {
            <h1 class="profile-title">Perfil de usuario</h1>
            <article class="acct-card profile-card">
              <header class="profile-hero">
                <app-avatar class="profile-hero__avatar" [foto]="perfil.foto_url" [nombre]="perfil.nombre + ' ' + perfil.apellido" [usarDosIniciales]="true" />
                <div class="profile-hero__info">
                  <p class="profile-hero__id">Usuario #{{ perfil.id }}</p>
                  <h2>{{ perfil.nombre }} {{ perfil.apellido }}</h2>
                  <div class="profile-hero__badges">
                    <span class="acct-badge acct-badge--info">{{ perfil.rol?.nombre || 'Sin rol' }}</span>
                    @if (!perfil.activa) {
                      <span class="acct-badge acct-badge--warn">Dada de baja</span>
                    } @else if (perfil.bloqueado) {
                      <span class="acct-badge acct-badge--error">Cuenta bloqueada</span>
                    }
                  </div>
                </div>
              </header>
              <section class="profile-section" aria-labelledby="datos-usuario">
                <div class="card-head"><h2 id="datos-usuario">Datos personales</h2></div>
                <dl class="data-list">
                  <div><dt>Nombre</dt><dd>{{ perfil.nombre }}</dd></div>
                  <div><dt>Apellido</dt><dd>{{ perfil.apellido }}</dd></div>
                  <div><dt>Correo</dt><dd>{{ perfil.email || 'Sin correo registrado' }}</dd></div>
                  <div><dt>Teléfono</dt><dd>{{ perfil.telefono || 'Sin teléfono registrado' }}</dd></div>
                  <div><dt>Estado de la cuenta</dt><dd>{{ !perfil.activa ? 'Dada de baja' : perfil.bloqueado ? 'Bloqueada' : 'Activa' }}</dd></div>
                </dl>
              </section>
            </article>
          } @else {
            <div class="acct-state"><p role="status">{{ vista.mensaje }}</p></div>
          }
        }
      </div>
    </main>
  `,
  styleUrl: './admin-user-profile.component.scss',
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
