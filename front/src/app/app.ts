import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { exhaustMap, filter, map, startWith, timer } from 'rxjs';
import { LucideArrowRight, LucideHouse, LucideLandmark, LucideLockKeyhole } from '@lucide/angular';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ChatDockComponent } from './shared/components/chat-dock/chat-dock.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { PerfilService } from './core/services/perfil.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NavbarComponent, FooterComponent, ChatDockComponent, ToastComponent, LucideArrowRight, LucideHouse, LucideLandmark, LucideLockKeyhole],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);
  protected readonly perfil = inject(PerfilService);
  private readonly auth = inject(AuthService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly ruta = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
      map((url) => url.split(/[?#]/)[0]),
    ),
    { requireSync: true },
  );

  protected readonly esPantallaAuth = computed(() => ['/login', '/registro', '/confirmar-baja', '/reactivar-cuenta'].includes(this.ruta()));
  protected readonly esPantallaCbu = computed(() => this.ruta() === '/mi-perfil/validar-cbu');
  private readonly verificarAcceso = computed(() => this.isBrowser && this.auth.isAuthenticated &&
    !this.esPantallaAuth() && this.ruta() !== '/cuenta-bloqueada');
  protected readonly comprobandoPerfil = computed(() => this.verificarAcceso() && !this.perfil.solicitudConsultada());
  protected readonly cbuObligatorio = computed(() => this.verificarAcceso() &&
    this.perfil.solicitudConsultada() && this.perfil.necesitaCbu() && !this.perfil.cbuEnRevision());
  protected readonly accesoRestringido = computed(() => this.comprobandoPerfil() || this.cbuObligatorio());

  constructor() {
    effect(onCleanup => {
      const usuario = this.auth.currentUser();
      if (!this.isBrowser) return;
      if (!usuario) {
        this.perfil.limpiar();
        return;
      }
      const consulta = untracked(() => this.perfil.cargarSolicitud().subscribe());
      onCleanup(() => consulta.unsubscribe());
    });
    effect(onCleanup => {
      if (!this.isBrowser || !this.auth.currentUser() || !this.perfil.cbuEnRevision()) return;
      const actualizacion = timer(30_000, 30_000).pipe(
        exhaustMap(() => this.perfil.cargarSolicitud(true)),
      ).subscribe();
      onCleanup(() => actualizacion.unsubscribe());
    });
  }

  protected reintentarPerfil(): void {
    this.perfil.cargarSolicitud(true).subscribe();
  }
}
