import { Component, DestroyRef, computed, effect, inject, input, model, signal } from '@angular/core';
import { LucideImagePlus } from '@lucide/angular';
import { GaleriaImagenesComponent } from '../galeria-imagenes/galeria-imagenes.component';

const FORMATOS: Record<string, string> = { 'image/jpeg': 'JPEG', 'image/png': 'PNG', 'image/webp': 'WEBP', 'image/heic': 'HEIC', 'image/heif': 'HEIF' };
let siguienteId = 0;

/**
 * T05: elige imágenes para un formulario (reclamo del inquilino y pedido de reinicio del código).
 * Descarta solo las que no cumplen y avisa cuáles; las elegidas se ven con la galería de publicaciones, sin portada ni orden.
 * El máximo, los tipos y el tamaño son parámetros: el back vuelve a validar y T49 puede ampliar el límite.
 */
@Component({
  selector: 'app-carga-imagenes',
  imports: [GaleriaImagenesComponent, LucideImagePlus],
  template: `
    <span class="carga__etiqueta" [id]="id + '-etiqueta'">{{ etiqueta() }}@if (archivos().length) { <span class="carga__cuenta"> · {{ archivos().length }} de {{ maximo() }}</span> }</span>
    <label class="carga__zona" [class.carga__zona--arrastrando]="arrastrando()" [class.carga__zona--deshabilitada]="bloqueada()"
      (dragover)="arrastrar($event)" (dragleave)="arrastrando.set(false)" (drop)="soltar($event, entrada)">
      <input #entrada class="carga__entrada" [id]="id" type="file" multiple [accept]="tipos().join(',')" [disabled]="bloqueada()"
        [attr.aria-labelledby]="id + '-etiqueta ' + id + '-accion'" [attr.aria-describedby]="id + '-ayuda'"
        (change)="agregar(entrada.files, entrada)" />
      <svg lucideImagePlus [size]="20" aria-hidden="true"></svg>
      <span class="carga__accion" [id]="id + '-accion'">{{ completa() ? 'Llegaste al máximo de ' + maximo() + ' imágenes' : 'Elegí o arrastrá las imágenes' }}</span>
      <span class="carga__ayuda" [id]="id + '-ayuda'">{{ completa() ? 'Quitá alguna para elegir otra.' : ayuda() }}</span>
    </label>
    @if (avisos().length) {
      <ul class="carga__error carga__avisos" role="alert">
        @for (aviso of avisos(); track $index) { <li>{{ aviso }}</li> }
      </ul>
    }
    @if (fotos().length) {
      <app-galeria-imagenes [fotos]="fotos()" [ordenable]="false" [disabled]="deshabilitado()" (quitar)="quitar($event)" />
    }
  `,
  styleUrl: './carga-imagenes.component.scss',
})
export class CargaImagenesComponent {
  readonly archivos = model<File[]>([]);
  readonly etiqueta = input('Imágenes (opcional)');
  readonly maximo = input(5);
  readonly tipos = input<readonly string[]>(['image/jpeg', 'image/png']);
  readonly maxBytes = input(5 * 1024 * 1024);
  readonly deshabilitado = input(false);
  protected readonly avisos = signal<string[]>([]);
  protected readonly arrastrando = signal(false);
  protected readonly id = `carga-imagenes-${++siguienteId}`;
  private readonly vistasPrevias = new Map<File, string>();

  protected readonly formatos = computed(() => {
    const nombres = this.tipos().map((tipo) => FORMATOS[tipo] ?? tipo);
    return nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} o ${nombres.at(-1)}` : nombres.join('');
  });
  protected readonly tamano = computed(() => `${Math.round(this.maxBytes() / 1024 / 1024)} MB`);
  protected readonly ayuda = computed(() => `${this.formatos()}, hasta ${this.tamano()} cada una, máximo ${this.maximo()}`);
  protected readonly completa = computed(() => this.archivos().length >= this.maximo());
  protected readonly bloqueada = computed(() => this.deshabilitado() || this.completa());
  protected readonly fotos = computed(() => this.archivos().map((archivo) => ({ url: this.vistaPrevia(archivo), nombre: archivo.name })));

  constructor() {
    // Libera las vistas previas de las imágenes que dejaron de estar elegidas («Quitar» o el formulario se vació).
    effect(() => {
      const vigentes = new Set(this.archivos());
      for (const [archivo, url] of this.vistasPrevias) {
        if (vigentes.has(archivo)) continue;
        URL.revokeObjectURL(url);
        this.vistasPrevias.delete(archivo);
      }
    });
    inject(DestroyRef).onDestroy(() => this.vistasPrevias.forEach((url) => URL.revokeObjectURL(url)));
  }

  protected arrastrar(evento: DragEvent): void {
    evento.preventDefault();
    // Con la zona completa no se acepta el archivo, pero tampoco se deja que el navegador lo abra y se pierda el formulario.
    if (this.bloqueada()) {
      if (evento.dataTransfer) evento.dataTransfer.dropEffect = 'none';
      return;
    }
    this.arrastrando.set(true);
  }

  protected soltar(evento: DragEvent, entrada: HTMLInputElement): void {
    evento.preventDefault();
    this.arrastrando.set(false);
    this.agregar(evento.dataTransfer?.files ?? null, entrada);
  }

  protected agregar(lista: FileList | null, entrada: HTMLInputElement): void {
    const elegidas = Array.from(lista ?? []);
    // Sin limpiar el campo, volver a elegir la misma imagen después de quitarla no dispararía el cambio.
    entrada.value = '';
    if (this.bloqueada() || !elegidas.length) return;
    const aceptadas = [...this.archivos()];
    const avisos: string[] = [];
    const sobrantes: string[] = [];
    for (const archivo of elegidas) {
      if (!this.tipos().includes(archivo.type)) avisos.push(`«${archivo.name}» no es una imagen ${this.formatos()}.`);
      else if (archivo.size > this.maxBytes()) avisos.push(`«${archivo.name}» pesa más de ${this.tamano()}.`);
      else if (aceptadas.some((otra) => mismaImagen(otra, archivo))) avisos.push(`«${archivo.name}» ya está elegida.`);
      else if (aceptadas.length >= this.maximo()) sobrantes.push(`«${archivo.name}»`);
      else aceptadas.push(archivo);
    }
    if (sobrantes.length) avisos.push(`Podés adjuntar hasta ${this.maximo()} imágenes; no se agregaron: ${sobrantes.join(', ')}.`);
    this.avisos.set(avisos);
    if (aceptadas.length !== this.archivos().length) this.archivos.set(aceptadas);
  }

  protected quitar(indice: number): void {
    if (this.deshabilitado()) return;
    this.avisos.set([]);
    this.archivos.update((lista) => lista.filter((_, i) => i !== indice));
  }

  private vistaPrevia(archivo: File): string {
    let url = this.vistasPrevias.get(archivo);
    if (!url) {
      url = URL.createObjectURL(archivo);
      this.vistasPrevias.set(archivo, url);
    }
    return url;
  }
}

function mismaImagen(a: File, b: File): boolean {
  return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
}
