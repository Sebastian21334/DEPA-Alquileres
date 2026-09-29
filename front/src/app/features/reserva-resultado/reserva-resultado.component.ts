import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { Reserva, ReservationService, ResumenReserva } from '../../shared/services/reservation.service';

@Component({
  selector: 'app-reserva-resultado',
  standalone: true,
  imports: [RouterLink, SpinnerComponent],
  templateUrl: './reserva-resultado.component.html',
  styleUrl: './reserva-resultado.component.scss',
})
export class ReservaResultadoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly reservasApi = inject(ReservationService);
  private readonly auth = inject(AuthService);
  private readonly chat = inject(ChatService);

  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly resumen = signal<ResumenReserva | null>(null);
  protected readonly confirmarSalida = signal(false);

  protected readonly reserva = computed(() => this.resumen()?.reserva ?? null);
  protected readonly pago = computed(() => this.resumen()?.pago ?? null);
  protected readonly esInquilino = computed(
    () => this.reserva()?.usuario?.id === Number(this.auth.currentUser()?.sub),
  );
  protected readonly contactoDisponible = computed(() => {
    const reserva = this.reserva();
    return reserva?.estado_pago === 'APROBADO' && !reserva.cancelada && Boolean(this.otroUsuarioId());
  });
  protected readonly whatsappUrl = computed(() => {
    const reserva = this.reserva();
    if (!reserva) return null;
    const telefono = this.esInquilino()
      ? reserva.publicacion?.anunciante?.numero_contacto ?? reserva.publicacion?.anunciante?.usuario?.telefono
      : reserva.usuario_telefono ?? reserva.usuario?.telefono;
    const digits = telefono?.replace(/\D/g, '');
    if (!digits) return null;
    const mensaje = `Hola, te contacto por la reserva #${reserva.id} de ${reserva.publicacion?.titulo ?? 'la propiedad'}.`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(mensaje)}`;
  });

  constructor() {
    const idReserva = this.obtenerIdReserva();
    if (!idReserva) {
      this.error.set('No pudimos identificar la reserva asociada al pago.');
      this.cargando.set(false);
      return;
    }

    const paymentResult = this.route.snapshot.queryParamMap.get('payment');
    const paymentId = this.route.snapshot.queryParamMap.get('payment_id')
      ?? this.route.snapshot.queryParamMap.get('collection_id');

    if (paymentResult === 'success' && paymentId) {
      this.reservasApi.reconcilePayment(paymentId).subscribe({
        next: () => this.cargarResumen(idReserva),
        error: () => this.cargarResumen(idReserva),
      });
      return;
    }

    this.cargarResumen(idReserva);
  }

  protected abrirChat(): void {
    const reserva = this.reserva();
    const idOtroUsuario = this.otroUsuarioId();
    if (!reserva?.publicacion || !idOtroUsuario) return;
    this.chat.abrir({
      idPublicacion: reserva.publicacion.id,
      idOtroUsuario,
      titulo: reserva.publicacion.titulo,
      nombreOtro: this.nombreContacto(),
      fotoOtro: this.esInquilino()
        ? reserva.publicacion.anunciante?.usuario?.foto_url ?? null
        : reserva.usuario?.foto_url ?? null,
    });
  }

  protected abrirConfirmacionWhatsapp(): void {
    if (this.whatsappUrl()) this.confirmarSalida.set(true);
  }

  protected continuarWhatsapp(): void {
    const url = this.whatsappUrl();
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    this.confirmarSalida.set(false);
  }

  protected nombreContacto(): string {
    const reserva = this.reserva();
    if (!reserva) return 'Contacto';
    if (this.esInquilino()) {
      const usuario = reserva.publicacion?.anunciante?.usuario;
      return usuario ? `${usuario.nombre} ${usuario.apellido}`.trim() : 'Anfitrión';
    }
    return [reserva.usuario_nombre ?? reserva.usuario?.nombre, reserva.usuario_apellido ?? reserva.usuario?.apellido]
      .filter(Boolean).join(' ') || 'Huésped';
  }

  protected emailContacto(): string {
    const reserva = this.reserva();
    if (!reserva) return 'No informado';
    return this.esInquilino()
      ? reserva.publicacion?.anunciante?.usuario?.email ?? 'No informado'
      : reserva.usuario_email ?? reserva.usuario?.email ?? 'No informado';
  }

  protected telefonoContacto(): string {
    const reserva = this.reserva();
    if (!reserva) return 'No informado';
    return this.esInquilino()
      ? reserva.publicacion?.anunciante?.numero_contacto ?? reserva.publicacion?.anunciante?.usuario?.telefono ?? 'No informado'
      : reserva.usuario_telefono ?? reserva.usuario?.telefono ?? 'No informado';
  }

  protected tituloEstado(reserva: Reserva): string {
    if (reserva.estado_pago === 'APROBADO') return 'Reserva confirmada';
    if (reserva.estado_pago === 'PENDIENTE') return 'Estamos validando el pago';
    if (reserva.estado_pago === 'REEMBOLSADO') return 'Pago reembolsado';
    if (reserva.estado_pago === 'CANCELADO') return 'Reserva cancelada';
    return 'El pago no fue aprobado';
  }

  protected descripcionEstado(reserva: Reserva): string {
    if (reserva.estado_pago === 'APROBADO') return 'El pago fue acreditado y las fechas quedaron reservadas.';
    if (reserva.estado_pago === 'PENDIENTE') return 'Mercado Pago todavía está procesando la operación. Podés volver a consultar esta pantalla.';
    if (reserva.estado_pago === 'REEMBOLSADO') return 'Mercado Pago informó la devolución de la operación.';
    return 'Las fechas no quedaron confirmadas. Revisá el estado del pago antes de volver a intentarlo.';
  }

  protected estadoPagoMercado(): string {
    const status = this.pago()?.status;
    const labels: Record<string, string> = {
      approved: 'Acreditado',
      pending: 'Pendiente',
      in_process: 'En revisión',
      rejected: 'Rechazado',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado',
      charged_back: 'Contracargo',
    };
    return status ? labels[status] ?? status : 'Sin información';
  }

  protected medioPago(): string {
    const medio = this.pago()?.payment_method_id;
    if (!medio) return 'Mercado Pago';
    const labels: Record<string, string> = { visa: 'Visa', master: 'Mastercard', amex: 'American Express', debvisa: 'Visa Débito', debmaster: 'Mastercard Débito', account_money: 'Dinero en cuenta' };
    return labels[medio] ?? medio;
  }

  protected direccion(reserva: Reserva): string {
    return [reserva.publicacion?.direccion, reserva.publicacion?.ciudad?.nombre, reserva.publicacion?.provincia?.nombre]
      .filter(Boolean).join(', ') || 'Ubicación no informada';
  }

  protected cantidadDias(reserva: Reserva): number {
    if (!reserva.fecha_inicio || !reserva.fecha_fin) return 0;
    return Math.floor((this.fechaLocal(reserva.fecha_fin).getTime() - this.fechaLocal(reserva.fecha_inicio).getTime()) / 86400000) + 1;
  }

  protected fecha(valor: string | null | undefined): string {
    return valor ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(this.fechaLocal(valor)) : '—';
  }

  protected fechaHora(valor: string | null | undefined): string {
    return valor ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(valor)) : '—';
  }

  protected monto(valor: number | undefined, moneda = 'ARS'): string {
    return Number(valor ?? 0).toLocaleString('es-AR', { style: 'currency', currency: moneda });
  }

  private cargarResumen(idReserva: number): void {
    this.reservasApi.summary(idReserva).subscribe({
      next: (resumen) => {
        this.resumen.set(resumen);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No pudimos cargar el resumen de la reserva.');
        this.cargando.set(false);
      },
    });
  }

  private obtenerIdReserva(): number | null {
    const directo = Number(this.route.snapshot.queryParamMap.get('reserva_id'));
    if (Number.isInteger(directo) && directo > 0) return directo;

    const referencia = this.route.snapshot.queryParamMap.get('external_reference');
    const desdeReferencia = Number(referencia?.startsWith('reserva:') ? referencia.slice(8) : NaN);
    if (Number.isInteger(desdeReferencia) && desdeReferencia > 0) return desdeReferencia;

    try {
      const guardado = Number(sessionStorage.getItem('depa:ultima-reserva'));
      return Number.isInteger(guardado) && guardado > 0 ? guardado : null;
    } catch {
      return null;
    }
  }

  private otroUsuarioId(): number | null {
    const reserva = this.reserva();
    if (!reserva) return null;
    return this.esInquilino()
      ? reserva.publicacion?.anunciante?.usuario?.id ?? null
      : reserva.usuario?.id ?? null;
  }

  private fechaLocal(valor: string): Date {
    return new Date(`${valor.slice(0, 10)}T12:00:00`);
  }
}
