import { NgTemplateOutlet } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideBadgeCheck, LucideClock } from '@lucide/angular';
import { PerfilService } from '../../core/services/perfil.service';
import { ToastService } from '../../core/services/toast.service';
import { ApiError } from '../../core/interceptors/api-error';
import { CatalogoService } from '../../shared/services/catalogo.service';
import { TipoAnunciante } from '../../shared/models/catalogo.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { CbuAnuncianteComponent } from '../../shared/components/cbu-anunciante/cbu-anunciante.component';
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
  imports: [NgTemplateOutlet, ReactiveFormsModule, RouterLink, SpinnerComponent, CapturaIdentidadComponent, CbuAnuncianteComponent, LucideBadgeCheck, LucideClock],
  templateUrl: './solicitud-anunciante.component.html',
  styleUrl: './solicitud-anunciante.component.scss',
})
export class SolicitudAnuncianteComponent {
  private readonly fb = inject(FormBuilder);
  private readonly perfilService = inject(PerfilService);
  private readonly catalogos = inject(CatalogoService);
  private readonly toast = inject(ToastService);

  protected readonly solicitud = this.perfilService.solicitud;
  protected readonly tipos = signal<TipoAnunciante[]>([]);
  protected readonly cargando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  /** RN-37: el CUIT/CUIL ya pertenece a otra cuenta vigente (409 del backend). */
  protected readonly errorCuit = signal('');
  protected readonly exito = signal('');
  protected readonly capturaAbierta = signal(false);
  protected readonly documentosPendientes = signal<IdentidadCapturada | null>(null);

  /** Paso derivado del estado persistido en el backend. */
  private readonly pasoBase = computed<'datos' | 'documentos' | 'revision' | 'aprobada'>(() => {
    const s = this.solicitud();
    if (!s) return 'datos';
    if (s.estado === 'aprobada') return 'aprobada';
    if (s.estado === 'rechazada' || !s.dni_frente_url || !s.dni_dorso_url || !s.rostro_url) return 'documentos';
    return 'revision';
  });
  /** Permite volver a Datos mientras la solicitud todavía se puede corregir. */
  protected readonly pasoManual = signal<'datos' | 'documentos' | null>(null);
  protected readonly paso = computed(() => this.pasoManual() ?? this.pasoBase());
  protected readonly puedeEditarDatos = computed(() => {
    const s = this.solicitud();
    return !s || s.estado === 'borrador' || s.estado === 'rechazada';
  });

  protected readonly form = this.fb.nonNullable.group({
    idTipoAnunciante: [0, [Validators.required, Validators.min(1)]],
    cuit: ['', [Validators.required, Validators.pattern(/^\d{2}-?\d{8}-?\d$/), Validators.maxLength(15)]],
    cbu: ['', [Validators.required, Validators.pattern(/^\d{22}$/)]],
    titularidad_declarada: [false, Validators.requiredTrue],
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
      if (solicitud) {
        this.form.patchValue({
          idTipoAnunciante: solicitud.anunciante.tipoAnunciante?.id ?? 0,
          cuit: solicitud.anunciante.cuit_cuil ?? '',
          numero_contacto: solicitud.anunciante.numero_contacto ?? '',
        }, { emitEvent: false });
        this.form.controls.cbu.disable({ emitEvent: false });
        this.form.controls.titularidad_declarada.disable({ emitEvent: false });
        this.empresaForm.patchValue({
          razon_social: solicitud.razon_social ?? '',
          matricula_profesional: solicitud.matricula_profesional ?? '',
          colegio_profesional: solicitud.colegio_profesional ?? '',
          domicilio_comercial: solicitud.domicilio_comercial ?? '',
          dni_corredor: solicitud.dni_corredor ?? '',
        }, { emitEvent: false });
      } else {
        this.form.controls.cbu.enable({ emitEvent: false });
        this.form.controls.titularidad_declarada.enable({ emitEvent: false });
      }
      if (!solicitud || !this.puedeEditarDatos()) this.pasoManual.set(null);
    });
    this.catalogos.getTiposAnunciante().subscribe({ next: (t) => this.tipos.set(t) });
    this.recargar();
  }

  private recargar(): void {
    this.perfilService.cargarSolicitud(true).subscribe(() => this.cargando.set(false));
  }

  protected irAPaso(paso: 'datos' | 'documentos'): void {
    if (paso === 'datos' && !this.puedeEditarDatos()) return;
    if (paso === 'documentos' && !this.solicitud()) return;
    this.pasoManual.set(paso);
  }

  protected enviarDatos(): void {
    if (this.form.invalid || this.enviando() || (this.esInmobiliaria() && this.empresaForm.invalid)) {
      this.empresaForm.markAllAsTouched();
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set('');
    this.errorCuit.set('');
    const valor = this.form.getRawValue();
    const datos = {
      idTipoAnunciante: valor.idTipoAnunciante,
      cuit: valor.cuit.trim(),
      numero_contacto: valor.numero_contacto.trim(),
      ...(this.esInmobiliaria() ? this.empresaForm.getRawValue() : {}),
    };
    const existente = !!this.solicitud();
    const peticion = existente
      ? this.perfilService.actualizarDatosSolicitud(datos)
      : this.perfilService.solicitarAnunciante({
          ...datos,
          cbu: valor.cbu,
          titularidad_declarada: valor.titularidad_declarada,
        });
    peticion.subscribe({
      next: () => {
        if (!existente) {
          this.form.controls.cbu.reset();
          this.form.controls.titularidad_declarada.reset();
        }
        this.enviando.set(false);
        this.pasoManual.set(null);
        this.recargar();
      },
      error: (err: Error) => {
        this.enviando.set(false);
        if (err instanceof ApiError && err.status === 409 && /CUIT\/CUIL/.test(err.message)) {
          this.errorCuit.set(err.message);
          this.toast.mostrar('El CUIT/CUIL ingresado ya está registrado en otra cuenta.');
          return;
        }
        this.error.set(err.message);
      },
    });
  }

  protected enviarDocumentos(documentos: IdentidadCapturada): void {
    if (this.enviando()) return;
    this.documentosPendientes.set(documentos);
    this.capturaAbierta.set(false);
    this.enviando.set(true);
    this.error.set('');
    const reenvio = this.solicitud()?.estado === 'rechazada';
    if (this.esInmobiliaria() && (!this.matricula() || !this.constanciaCuit())) {
      this.enviando.set(false);
      this.error.set('Adjuntá matrícula y constancia de CUIT para continuar.');
      return;
    }
    this.perfilService.subirDocumentos({
      ...documentos,
      ...(this.esInmobiliaria() ? { matricula: this.matricula()!, constancia_cuit: this.constanciaCuit()! } : {}),
    }, reenvio).subscribe({
      next: () => {
        this.documentosPendientes.set(null);
        this.enviando.set(false);
        this.pasoManual.set(null);
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

  protected abrirCaptura(): void {
    this.documentosPendientes.set(null);
    this.error.set('');
    this.capturaAbierta.set(true);
  }

  protected fecha(valor: string): string {
    return new Date(valor).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
  }
}
