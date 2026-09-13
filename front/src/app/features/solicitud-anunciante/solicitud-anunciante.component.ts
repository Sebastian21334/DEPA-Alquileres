import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideBadgeCheck, LucideClock, LucideFileCheck, LucideUpload, LucideX } from '@lucide/angular';
import { PerfilService } from '../../core/services/perfil.service';
import { CatalogoService } from '../../shared/services/catalogo.service';
import { TipoAnunciante } from '../../shared/models/catalogo.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

type CampoDocumento = 'dni_frente' | 'dni_dorso' | 'rostro';

const IMAGENES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEOS = ['video/mp4', 'video/webm', 'video/quicktime'];
const MB = 1024 * 1024;

// Alta como anunciante en dos pasos, alineada con back/src/anunciantes:
// 1) POST /anunciantes/solicitar (tipo, CUIT/CUIL, contacto)
// 2) POST /anunciantes/mi-solicitud/documentos (o /reenviar si fue rechazada)
// y luego queda esperando la revisión de un administrador.
@Component({
  selector: 'app-solicitud-anunciante',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SpinnerComponent, LucideBadgeCheck, LucideClock, LucideFileCheck, LucideUpload, LucideX],
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
  protected readonly archivos = signal<Partial<Record<CampoDocumento, File>>>({});
  protected readonly vistasPrevias = signal<Partial<Record<CampoDocumento, string>>>({});
  protected readonly erroresArchivo = signal<Partial<Record<CampoDocumento, string>>>({});

  protected readonly documentos: { campo: CampoDocumento; titulo: string; ayuda: string; accept: string }[] = [
    { campo: 'dni_frente', titulo: 'DNI — frente', ayuda: 'Imagen JPG, PNG o WEBP de hasta 5 MB.', accept: IMAGENES.join(',') },
    { campo: 'dni_dorso', titulo: 'DNI — dorso', ayuda: 'Imagen JPG, PNG o WEBP de hasta 5 MB.', accept: IMAGENES.join(',') },
    {
      campo: 'rostro',
      titulo: 'Foto o video de tu rostro',
      ayuda: 'Imagen de hasta 5 MB o video MP4/WEBM/MOV de hasta 20 MB.',
      accept: [...IMAGENES, ...VIDEOS].join(','),
    },
  ];

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

  protected seleccionarArchivo(campo: CampoDocumento, event: Event): void {
    const archivo = (event.target as HTMLInputElement).files?.[0];
    const errores = { ...this.erroresArchivo() };
    const archivos = { ...this.archivos() };
    const vistas = { ...this.vistasPrevias() };
    if (vistas[campo]) URL.revokeObjectURL(vistas[campo]!);
    delete vistas[campo];
    delete errores[campo];
    delete archivos[campo];

    if (archivo) {
      // Mismas reglas que AnunciantesService.subirDocumento, para avisar antes de subir.
      const esVideo = VIDEOS.includes(archivo.type);
      const permitido = IMAGENES.includes(archivo.type) || (campo === 'rostro' && esVideo);
      const limite = esVideo ? 20 * MB : 5 * MB;
      if (!permitido) errores[campo] = 'Formato no permitido.';
      else if (archivo.size > limite) errores[campo] = `Supera el máximo de ${esVideo ? '20' : '5'} MB.`;
      else {
        archivos[campo] = archivo;
        if (IMAGENES.includes(archivo.type)) vistas[campo] = URL.createObjectURL(archivo);
      }
    }

    this.erroresArchivo.set(errores);
    this.archivos.set(archivos);
    this.vistasPrevias.set(vistas);
  }

  protected quitarArchivo(campo: CampoDocumento, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const input = (event.currentTarget as HTMLElement).closest('label')?.querySelector('input[type="file"]') as HTMLInputElement | null;
    if (input) input.value = '';
    const archivos = { ...this.archivos() };
    const vistas = { ...this.vistasPrevias() };
    if (vistas[campo]) URL.revokeObjectURL(vistas[campo]!);
    delete archivos[campo];
    delete vistas[campo];
    this.archivos.set(archivos);
    this.vistasPrevias.set(vistas);
  }

  protected enviarDocumentos(event: Event): void {
    // Este form no usa [formGroup], así que ngSubmit no existe: sin esto el
    // navegador hace el submit nativo y recarga la página sin enviar nada.
    event.preventDefault();
    const { dni_frente, dni_dorso, rostro } = this.archivos();
    if (!dni_frente || !dni_dorso || !rostro) {
      this.error.set('Tenés que adjuntar los tres documentos.');
      return;
    }
    if (this.enviando()) return;

    this.enviando.set(true);
    this.error.set('');
    const reenvio = this.solicitud()?.estado === 'rechazada';
    this.perfilService.subirDocumentos({ dni_frente, dni_dorso, rostro }, reenvio).subscribe({
      next: () => {
        this.enviando.set(false);
        this.archivos.set({});
        Object.values(this.vistasPrevias()).forEach((url) => url && URL.revokeObjectURL(url));
        this.vistasPrevias.set({});
        this.exito.set('¡Documentación enviada! Un administrador la va a revisar a la brevedad.');
        this.recargar();
      },
      error: (err: Error) => {
        this.enviando.set(false);
        this.error.set(err.message);
      },
    });
  }

  protected tamanio(archivo: File): string {
    return `${(archivo.size / MB).toFixed(1)} MB`;
  }

  protected fecha(valor: string): string {
    return new Date(valor).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
  }
}
