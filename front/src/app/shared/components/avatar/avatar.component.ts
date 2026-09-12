import { Component, computed, input, linkedSignal } from '@angular/core';

/**
 * Avatar de usuario: muestra la foto de perfil si existe y, si no hay foto o no
 * carga, la inicial del nombre. El tamaño, color y borde los define quien lo usa
 * (la clase que se le pone al <app-avatar>), así mantiene el estilo de cada pantalla.
 */
@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    @if (foto() && !fallo()) {
      <img [src]="foto()" [alt]="'Foto de ' + nombre()" (error)="fallo.set(true)" />
    } @else {
      {{ inicial() }}
    }
  `,
  styles: `
    :host { display: grid; place-items: center; overflow: hidden; }
    img { width: 100%; height: 100%; object-fit: cover; display: block; animation: depa-fade-in 0.4s ease both; }
  `,
})
export class AvatarComponent {
  readonly foto = input<string | null | undefined>(null);
  readonly nombre = input<string | null | undefined>('');

  // Se reinicia cuando cambia la foto, para reintentar con una URL nueva.
  protected readonly fallo = linkedSignal({ source: this.foto, computation: () => false });
  protected readonly inicial = computed(() => (this.nombre()?.trim() || '?').charAt(0).toUpperCase());
}
