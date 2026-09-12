import { Component, HostListener, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import {
  LucideBadgeCheck,
  LucideChevronDown,
  LucideHouse,
  LucideLayoutList,
  LucideLogIn,
  LucideLogOut,
  LucideMessageCircle,
  LucideShieldCheck,
  LucideSquarePlus,
  LucideUser,
  LucideUserPlus,
  LucideX,
} from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { ChatService } from '../../../core/services/chat.service';
import { ConversacionResumen } from '../../models/mensaje.model';
import { etiquetaRol } from '../../models/perfil.model';
import { AvatarComponent } from '../avatar/avatar.component';

// Header del sitio: hamburguesa que abre el panel lateral de navegación, avatar
// (lleva a Mi perfil) o "Ingresar" según haya sesión (RF2), logo y botón "Publicar".
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    AvatarComponent,
    LucideBadgeCheck,
    LucideChevronDown,
    LucideHouse,
    LucideLayoutList,
    LucideLogIn,
    LucideLogOut,
    LucideMessageCircle,
    LucideShieldCheck,
    LucideSquarePlus,
    LucideUser,
    LucideUserPlus,
    LucideX,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  protected readonly perfil = inject(PerfilService);
  private readonly chat = inject(ChatService);
  private readonly router = inject(Router);

  protected readonly etiquetaRol = etiquetaRol;
  protected readonly menuAbierto = signal(false);
  protected readonly chatsAbiertos = signal(false);
  protected readonly cargandoChats = signal(false);
  protected readonly errorChats = signal('');
  protected readonly conversaciones = signal<ConversacionResumen[]>([]);
  protected readonly scrolled = signal(false);
  /** Nombre visible en el header; mientras carga /usuarios/me se usa el email del JWT. */
  protected readonly nombreVisible = computed(() => {
    const u = this.perfil.usuario();
    return u ? `${u.nombre} ${u.apellido}`.trim() : (this.auth.currentUser()?.email ?? '');
  });

  @HostListener('window:scroll')
  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  constructor() {
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    // Al iniciar/cerrar sesión se refresca el estado de anunciante que decide
    // qué accesos se ven. Solo en el navegador: en SSR no hay JWT.
    effect(() => {
      const usuario = this.auth.currentUser();
      if (!isBrowser) return;
      if (usuario) {
        this.perfil.cargarSolicitud().subscribe();
        this.perfil.getPerfil().subscribe({ error: () => undefined });
      } else {
        this.perfil.limpiar();
      }
    });

    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.cerrarMenu());
  }

  @HostListener('document:keydown.escape')
  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
    this.chatsAbiertos.set(false);
  }

  protected abrirMenu(): void {
    this.menuAbierto.set(true);
  }

  protected alternarChats(): void {
    const abrir = !this.chatsAbiertos();
    this.chatsAbiertos.set(abrir);
    if (!abrir) return;

    this.cargandoChats.set(true);
    this.errorChats.set('');
    this.chat.listarConversaciones().subscribe({
      next: (lista) => {
        this.conversaciones.set(lista);
        this.cargandoChats.set(false);
      },
      error: (err: Error) => {
        this.errorChats.set(err.message);
        this.cargandoChats.set(false);
      },
    });
  }

  protected otro(conv: ConversacionResumen) {
    const m = conv.ultimoMensaje;
    return m.origenUsuario.id === conv.idOtroUsuario ? m.origenUsuario : m.destinoUsuario;
  }

  protected nombreOtro(conv: ConversacionResumen): string {
    const otro = this.otro(conv);
    return `${otro.nombre} ${otro.apellido}`.trim();
  }

  protected abrirChat(conv: ConversacionResumen): void {
    this.chat.abrir({
      idPublicacion: conv.idPublicacion,
      idOtroUsuario: conv.idOtroUsuario,
      titulo: conv.ultimoMensaje.publicacion.titulo,
      nombreOtro: this.nombreOtro(conv),
      fotoOtro: this.otro(conv).foto_url ?? null,
    });
    this.cerrarMenu();
  }

  protected logout(): void {
    this.auth.logout();
    this.perfil.limpiar();
    this.chat.cerrarTodos();
    this.cerrarMenu();
    this.router.navigateByUrl('/');
  }
}
