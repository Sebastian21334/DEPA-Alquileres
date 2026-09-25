import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideBadgeCheck, LucideClock } from '@lucide/angular';
import { PerfilService } from '../../core/services/perfil.service';
import { CatalogoService } from '../../shared/services/catalogo.service';
import { TipoAnunciante } from '../../shared/models/catalogo.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import {
  CapturaIdentidadComponent,
  IdentidadCapturada,
} from './captura-identidad/captura-identidad.component';

// Alta como anunciante en dos pasos, alineada con back/src/anunciantes:
// 1) POST /anunciantes/solicitar (tipo, CUIT/CUIL, contacto)
// 2) POST /anunciantes/mi-solicitud/documentos (o /reenviar si fue rechazada)
// y luego queda esperando la revisión de un administrador.
@Component({
  selector: 'app-solicitud-anunciante',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SpinnerComponent, CapturaIdentidadComponent, LucideBadgeCheck, LucideClock],
  templateUrl: './solicitud-anunciante.component.html',
  styleUrl: './solicitud-anunciante.component.scss',
})
export class SolicitudAnuncianteComponent {
  private readonly fb = inject(FormBuilder);
  private readonly perfilService = inject(PerfilService);
  private readonly catalogos = inject(CatalogoService);

  protected readonly solicitud = this.perfilService.solicitud;
  protected readonly tipos = signal<TipoAnunciante[]>([]);
  protected readonly cargando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly exito = signal('');

  /** Paso actual del flujo según el estado persistido en el backend. */
  protected readonly paso = computed<'datos' | 'documentos' | 'revision' | 'aprobada'>(() => {
    const s = this.solicitud();
    if (!s) return 'datos';
    if (s.estado === 'aprobada') return 'aprobada';
    if (s.estado === 'rechazada' || !s.dni_frente_url || !s.dni_dorso_url || !s.rostro_url) return 'documentos';
    return 'revision';
  });

  protected readonly form = this.fb.nonNullable.group({
    idTipoAnunciante: [0, [Validators.required, Validators.min(1)]],
    cuit: ['', [Validators.required, Validators.pattern(/^\d{2}-?\d{8}-?\d$/), Validators.maxLength(15)]],
    numero_contacto: ['', [Validators.required, Validators.maxLength(20)]],
  });

  constructor() {
    this.catalogos.getTiposAnunciante().subscribe({ next: (t) => this.tipos.set(t) });
    this.recargar();
  }

  private recargar(): void {
    this.perfilService.cargarSolicitud(true).subscribe(() => this.cargando.set(false));
  }

  protected enviarDatos(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set('');
    const valor = this.form.getRawValue();
    this.perfilService
      .solicitarAnunciante({ ...valor, cuit: valor.cuit.trim(), numero_contacto: valor.numero_contacto.trim() })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.recargar();
        },
        error: (err: Error) => {
          this.enviando.set(false);
          this.error.set(err.message);
        },
      });
  }

  protected enviarDocumentos(documentos: IdentidadCapturada): void {
    if (this.enviando()) return;

    this.enviando.set(true);
    this.error.set('');
    const reenvio = this.solicitud()?.estado === 'rechazada';
    this.perfilService.subirDocumentos(documentos, reenvio).subscribe({
      next: () => {
        this.enviando.set(false);
        this.exito.set('¡Identidad validada y documentación enviada! Un administrador la va a revisar a la brevedad.');
        this.recargar();
      },
      error: (err: Error) => {
        this.enviando.set(false);
        this.error.set(err.message);
      },
    });
  }

  protected mostrarErrorCaptura(mensaje: string): void {
    this.error.set(mensaje);
  }

  protected fecha(valor: string): string {
    return new Date(valor).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
  }
}
