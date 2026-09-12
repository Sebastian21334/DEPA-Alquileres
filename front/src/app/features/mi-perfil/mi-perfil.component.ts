import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  LucideBadgeCheck,
  LucideCamera,
  LucideClock,
  LucideMail,
  LucidePencil,
  LucidePhone,
  LucideUser,
} from '@lucide/angular';
import { PerfilService } from '../../core/services/perfil.service';
import { PerfilUsuario, etiquetaRol } from '../../shared/models/perfil.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_FOTO = 5 * 1024 * 1024;

// Perfil del usuario logueado (se accede desde el avatar del header): datos
// personales editables, tipo de usuario y acceso al alta como anunciante.
@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    SpinnerComponent,
    AvatarComponent,
    LucideBadgeCheck,
    LucideCamera,
    LucideClock,
    LucideMail,
    LucidePencil,
    LucidePhone,
    LucideUser,
  ],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.scss',
})
export class MiPerfilComponent {
  private readonly perfilService = inject(PerfilService);
  private readonly fb = inject(FormBuilder);

  protected readonly perfil = signal<PerfilUsuario | null>(null);
  protected readonly solicitud = this.perfilService.solicitud;
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  protected readonly subiendoFoto = signal(false);
  protected readonly errorFoto = signal('');
  protected readonly editando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly errorEdicion = signal('');
  protected readonly guardado = signal(false);

  // Mismas reglas que ActualizarUsuarioDto (back/src/usuarios/dto/actualizar-usuario.dto.ts).
  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    telefono: ['', [Validators.required, Validators.maxLength(20)]],
  });

  protected readonly nombreCompleto = computed(() => {
    const p = this.perfil();
    return p ? `${p.nombre} ${p.apellido}`.trim() : '';
  });

  protected readonly rol = computed(() => etiquetaRol(this.perfil()?.rol?.nombre));

  /** Tipo de usuario tal como se muestra: rol + condición de anunciante. */
  protected readonly tipoUsuario = computed(() => {
    const s = this.solicitud();
    if (s?.estado === 'aprobada') return `${this.rol()} · Anunciante (${s.anunciante?.tipoAnunciante?.nombre ?? 'verificado'})`;
    return this.rol();
  });

  constructor() {
    forkJoin({
      perfil: this.perfilService.getPerfil(),
      solicitud: this.perfilService.cargarSolicitud(true),
    }).subscribe({
      next: ({ perfil }) => {
        this.perfil.set(perfil);
        this.cargando.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.cargando.set(false);
      },
    });
  }

  protected empezarEdicion(): void {
    const p = this.perfil();
    if (!p) return;
    this.form.reset({ nombre: p.nombre, apellido: p.apellido, telefono: p.telefono ?? '' });
    this.errorEdicion.set('');
    this.guardado.set(false);
    this.editando.set(true);
  }

  protected cancelarEdicion(): void {
    this.editando.set(false);
    this.errorEdicion.set('');
  }

  protected guardar(): void {
    const p = this.perfil();
    if (!p || this.guardando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.guardando.set(true);
    this.errorEdicion.set('');
    this.perfilService
      .actualizarPerfil(p.id, { nombre: v.nombre.trim(), apellido: v.apellido.trim(), telefono: v.telefono.trim() })
      .subscribe({
        next: (actualizado) => {
          this.perfil.set(actualizado);
          this.guardando.set(false);
          this.editando.set(false);
          this.guardado.set(true);
        },
        error: (err: Error) => {
          this.errorEdicion.set(err.message);
          this.guardando.set(false);
        },
      });
  }

  protected elegirFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) return;

    // Mismas reglas que POST /usuarios/me/foto, para avisar antes de subir.
    if (!TIPOS_FOTO.includes(archivo.type)) {
      this.errorFoto.set('La foto tiene que ser una imagen JPG, PNG, WEBP o HEIC.');
      return;
    }
    if (archivo.size > MAX_FOTO) {
      this.errorFoto.set('La foto no puede pesar más de 5 MB.');
      return;
    }

    this.errorFoto.set('');
    this.subiendoFoto.set(true);
    this.perfilService.subirFoto(archivo).subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.subiendoFoto.set(false);
      },
      error: (err: Error) => {
        this.errorFoto.set(err.message);
        this.subiendoFoto.set(false);
      },
    });
  }

  protected quitarFoto(): void {
    this.errorFoto.set('');
    this.subiendoFoto.set(true);
    this.perfilService.eliminarFoto().subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.subiendoFoto.set(false);
      },
      error: (err: Error) => {
        this.errorFoto.set(err.message);
        this.subiendoFoto.set(false);
      },
    });
  }

  protected invalido(campo: 'nombre' | 'apellido' | 'telefono'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  protected fecha(valor: string): string {
    return new Date(valor).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
