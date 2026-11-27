import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { HistorialVerificacionComponent } from '../../shared/components/historial-verificacion/historial-verificacion.component';
import { VolverDirective } from '../../shared/directives/volver.directive';
import { AdminService, type AdminHistorialAnunciante, type AdminUser } from './admin.service';

type EstadoPerfil =
  | { perfil: null; mensaje: string }
  | {
    perfil: AdminUser & { foto_url: string | null };
    historial: AdminHistorialAnunciante | null;
    cargandoHistorial: boolean;
  };

@Component({
  selector: 'app-admin-user-profile',
  imports: [AvatarComponent, DatePipe, HistorialVerificacionComponent, RouterLink, VolverDirective],
  template: `
    <main class="acct-page">
      <div class="acct-wrap acct-wrap--narrow">
        <a class="volver" appVolver="/admin" [fragmentoVolver]="seccionOrigen()">← Volver</a>
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
                    @if (perfil.rol?.nombre === 'Administrador') {
                      <span class="acct-badge acct-badge--info">Administrador</span>
                    }
                    @if (vista.historial; as historial) {
                      @if (historial.esAnunciante) {
                        <span class="acct-badge acct-badge--info">Anunciante</span>
                      } @else {
                        <span class="acct-badge acct-badge--info">Inquilino</span>
                      }
                    }
                    @if (!perfil.activa) {
                      <span class="acct-badge acct-badge--warn">Dada de baja</span>
                    } @else if (perfil.bloqueado) {
                      <span class="acct-badge acct-badge--error">Cuenta bloqueada</span>
                    }
                  </div>
                  @if (vista.historial?.esAnunciante) {
                    <a class="acct-btn acct-btn--ghost acct-btn--sm public-profile-link" [routerLink]="['/perfil', perfil.id]">Ver perfil público</a>
                  }
                </div>
              </header>
              <section class="profile-section" aria-labelledby="datos-usuario">
                <div class="card-head"><h2 id="datos-usuario">Datos personales</h2></div>
                <dl class="data-list">
                  <div><dt>Nombre</dt><dd>{{ perfil.nombre }}</dd></div>
                  <div><dt>Apellido</dt><dd>{{ perfil.apellido }}</dd></div>
                  <div><dt>Correo</dt><dd>{{ perfil.email || 'Sin correo registrado' }}</dd></div>
                  <div><dt>Teléfono</dt><dd>{{ perfil.telefono || 'Sin teléfono registrado' }}</dd></div>
                  <div><dt>Permisos de administrador</dt><dd>{{ perfil.rol?.nombre === 'Administrador' ? 'Sí' : 'No' }}</dd></div>
                  <div><dt>Estado de la cuenta</dt><dd>{{ !perfil.activa ? 'Dada de baja' : perfil.bloqueado ? 'Bloqueada' : 'Activa' }}</dd></div>
                </dl>
              </section>
            </article>
            @if (vista.historial?.solicitud; as solicitud) {
              <section class="acct-card profile-card" aria-labelledby="historial-anunciante">
                <div class="card-head"><h2 id="historial-anunciante">Historial de anunciante</h2></div>
                <dl class="data-list">
                  <div><dt>Solicitud</dt><dd>#{{ solicitud.id }}</dd></div>
                  <div><dt>Estado actual</dt><dd class="estado-solicitud">{{ solicitud.estado }}</dd></div>
                  <div><dt>Número de revisión</dt><dd>{{ solicitud.numero_revision }}</dd></div>
                  <div><dt>Fecha de creación</dt><dd>{{ solicitud.creada_en | date: 'dd/MM/yyyy HH:mm' : '-0300' }}</dd></div>
                  <div><dt>Última actualización</dt><dd>{{ solicitud.actualizada_en | date: 'dd/MM/yyyy HH:mm' : '-0300' }}</dd></div>
                </dl>
                @if (solicitud.revisiones.length) {
                  <h3 class="history-title">Revisiones anteriores</h3>
                  <app-historial-verificacion [revisiones]="solicitud.revisiones" />
                } @else {
                  <p class="history-status">La solicitud todavía no tiene revisiones registradas.</p>
                }
              </section>
            } @else if (vista.cargandoHistorial || !vista.historial || vista.historial.esAnunciante) {
              <section class="acct-card profile-card" aria-labelledby="historial-anunciante">
                <div class="card-head"><h2 id="historial-anunciante">Historial de anunciante</h2></div>
                <p class="history-status" role="status">
                  @if (vista.cargandoHistorial) {
                    Cargando historial.
                  } @else if (!vista.historial) {
                    No pudimos cargar el historial de anunciante.
                  } @else {
                    No hay solicitudes de anunciante registradas.
                  }
                </p>
              </section>
            }
          } @else if (vista.perfil === null) {
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
  private readonly route = inject(ActivatedRoute);
  private readonly origen = toSignal(this.route.queryParamMap);
  protected readonly seccionOrigen = computed(() => this.origen()?.get('desde') === 'usuarios' ? 'usuarios' : 'reclamos');

  protected readonly estado = toSignal<EstadoPerfil>(this.route.paramMap.pipe(
    switchMap((params) => {
      const id = Number(params.get('id'));
      if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) {
        return of<EstadoPerfil>({ perfil: null, mensaje: 'El perfil solicitado no es válido.' });
      }
      return this.api.obtenerPerfilUsuario(id).pipe(
        switchMap((perfil) => this.api.obtenerHistorialAnunciante(id).pipe(
          map((historial) => ({ perfil, historial, cargandoHistorial: false })),
          startWith({ perfil, historial: null, cargandoHistorial: true }),
          catchError(() => of({ perfil, historial: null, cargandoHistorial: false })),
        )),
        startWith<EstadoPerfil>({ perfil: null, mensaje: 'Cargando perfil.' }),
        catchError(() => of<EstadoPerfil>({ perfil: null, mensaje: 'No pudimos cargar el perfil.' })),
      );
    }),
  ));
}
