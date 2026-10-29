import { NgTemplateOutlet } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of, switchMap } from 'rxjs';
import { Component, computed, effect, inject, signal } from '@angular/core';
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
  imports: [NgTemplateOutlet, ReactiveFormsModule, RouterLink, SpinnerComponent, CapturaIdentidadComponent, LucideBadgeCheck, LucideClock],
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

  protected readonly empresaForm = this.fb.nonNullable.group({
    razon_social: ['', [Validators.required, Validators.maxLength(150)]],
    matricula_profesional: ['', [Validators.required, Validators.maxLength(50)]],
    colegio_profesional: ['', [Validators.required, Validators.maxLength(150)]],
    domicilio_comercial: ['', [Validators.required, Validators.maxLength(255)]],
    dni_corredor: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(/^\d{7,8}$/)]],
  });
  private readonly tipoSeleccionado = toSignal(this.form.controls.idTipoAnunciante.valueChanges, { initialValue: 0 });
  protected readonly esInmobiliaria = computed(() => {
    const nombre = this.solicitud()?.anunciante.tipoAnunciante?.nombre ??
      this.tipos().find((tipo) => tipo.id === this.tipoSeleccionado())?.nombre ?? '';
    return /inmobiliaria|institucional/i.test(nombre);
  });
  protected readonly matricula = signal<File | null>(null);
  protected readonly constanciaCuit = signal<File | null>(null);

  protected seleccionarConstancia(evento: Event, tipo: 'matricula' | 'cuit') {
    const archivo = (evento.target as HTMLInputElement).files?.[0] ?? null;
    const destino = tipo === 'matricula' ? this.matricula : this.constanciaCuit;
    if (archivo && (archivo.size > 5 * 1024 * 1024 || !['application/pdf', 'image/jpeg', 'image/png'].includes(archivo.type))) {
      destino.set(null);
      this.error.set('Adjuntá una constancia PDF, JPG o PNG de hasta 5 MB.');
      return;
    }
    destino.set(archivo);
    this.error.set('');
  }

  constructor() {
    effect(() => {
      const solicitud = this.solicitud();
      if (solicitud) this.empresaForm.patchValue({
        razon_social: solicitud.razon_social ?? '',
        matricula_profesional: solicitud.matricula_profesional ?? '',
        colegio_profesional: solicitud.colegio_profesional ?? '',
        domicilio_comercial: solicitud.domicilio_comercial ?? '',
        dni_corredor: solicitud.dni_corredor ?? '',
      }, { emitEvent: false });
    });
    this.catalogos.getTiposAnunciante().subscribe({ next: (t) => this.tipos.set(t) });
    this.recargar();
  }

  private recargar(): void {
    this.perfilService.cargarSolicitud(true).subscribe(() => this.cargando.set(false));
  }

  protected enviarDatos(): void {
    if (this.form.invalid || this.enviando() || (this.esInmobiliaria() && this.empresaForm.invalid)) {
      this.empresaForm.markAllAsTouched();
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set('');
    const valor = this.form.getRawValue();
    this.perfilService
      .solicitarAnunciante({ ...valor, ...(this.esInmobiliaria() ? this.empresaForm.getRawValue() : {}), cuit: valor.cuit.trim(), numero_contacto: valor.numero_contacto.trim() })
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
    if (this.esInmobiliaria() && (this.empresaForm.invalid || !this.matricula() || !this.constanciaCuit())) {
      this.enviando.set(false);
      this.empresaForm.markAllAsTouched();
      this.error.set('Completá los datos y adjuntá matrícula y constancia de CUIT.');
      return;
    }
    const preparar: Observable<unknown> = this.esInmobiliaria()
      ? this.perfilService.actualizarDatosInmobiliaria(this.empresaForm.getRawValue())
      : of(null);
    preparar.pipe(switchMap(() => this.perfilService.subirDocumentos({
      ...documentos,
      ...(this.esInmobiliaria() ? { matricula: this.matricula()!, constancia_cuit: this.constanciaCuit()! } : {}),
    }, reenvio))).subscribe({
      next: () => {
        this.enviando.set(false);
        this.exito.set('Prueba de vida completada y documentación enviada. Un administrador revisará tu solicitud.');
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

  protected limpiarErrorCaptura(): void {
    this.error.set('');
  }

  protected fecha(valor: string): string {
    return new Date(valor).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
  }
}
