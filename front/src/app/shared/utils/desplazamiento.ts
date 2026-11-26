import { afterNextRender, type Injector } from '@angular/core';

/**
 * Lleva a la vista un elemento que aparece recién al cargar los datos, por ejemplo el destino de un aviso por correo.
 * Espera al render y a una tarea más: el router vuelve al inicio de la página después del primer render de la ruta
 * y, si los datos llegan antes, pisaría este desplazamiento.
 */
export function llevarALaVista(id: string, injector: Injector): void {
  afterNextRender(() => setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' })), { injector });
}
