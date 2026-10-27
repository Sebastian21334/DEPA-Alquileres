import { timingSafeEqual } from 'node:crypto';
import type { Relation } from 'typeorm';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Usuario } from '../../usuarios/entity/usuario.entity';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';
import { ReprogramacionReserva } from './reprogramacion-reserva.entity';
import { CotizacionDolar } from '../../cotizaciones/entity/cotizacion-dolar.entity';

export enum EstadoPagoReserva {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  CANCELADO = 'CANCELADO',
  REEMBOLSADO = 'REEMBOLSADO',
}

export enum EstadoLiquidacionReserva {
  NO_APLICA = 'NO_APLICA',
  RETENIDO = 'RETENIDO',
  PENDIENTE_PAGO_PROPIETARIO = 'PENDIENTE_PAGO_PROPIETARIO',
  EN_REVISION = 'EN_REVISION',
  PAGADO_PROPIETARIO = 'PAGADO_PROPIETARIO',
  DEVUELTO_INQUILINO = 'DEVUELTO_INQUILINO',
}

@Entity('reserva')
export class Reserva {
  /** Intentos fallidos de código antes de pasar la liquidación a revisión. */
  static readonly MAX_INTENTOS_CODIGO = 5;

  // La reserva registra el pago y vincula al inquilino con una publicación.
  @PrimaryGeneratedColumn({ name: 'id_reserva' })
  id: number;

  @Column({ type: 'boolean', default: false })
  finalizada: boolean;

  @Column({ type: 'boolean', default: false })
  cancelada: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fecha_cancelacion: Date | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto_pago: number;

  // Condiciones aceptadas al reservar; nunca se recalculan al cambiar fechas.
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio_unitario_contratado: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  importe_contratado: number | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  moneda_contratada: string | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  moneda_origen: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  importe_origen: number | null;

  @ManyToOne(() => CotizacionDolar, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'id_cotizacion_dolar',
    foreignKeyConstraintName: 'FK_reserva_cotizacion_dolar',
  })
  cotizacion_dolar: Relation<CotizacionDolar | null>;

  @Column({ type: 'timestamptz', nullable: true })
  cotizacion_aceptada_en: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  presupuesto_emitido_en: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  presupuesto_vence_en: Date | null;

  @OneToMany(() => ReprogramacionReserva, (cambio) => cambio.reserva)
  reprogramaciones: Relation<ReprogramacionReserva[]>;

  @Column({ type: 'timestamp', nullable: true })
  fecha_pago: Date | null;

  @Column({
    type: 'enum',
    enum: EstadoPagoReserva,
    default: EstadoPagoReserva.APROBADO,
  })
  estado_pago: EstadoPagoReserva;

  @Column({ type: 'timestamp', nullable: true })
  pago_vencimiento: Date | null;

  // El código se excluye de todas las consultas normales. Solo puede
  // recuperarlo el inquilino mediante el endpoint protegido específico.
  @Column({ type: 'varchar', length: 8, nullable: true, select: false })
  codigo_alojamiento: string | null;

  @Column({ type: 'timestamp', nullable: true })
  codigo_generado_en: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  codigo_validado_en: Date | null;

  @Column({ type: 'int', default: 0 })
  intentos_codigo: number;

  @Column({
    type: 'enum',
    enum: EstadoLiquidacionReserva,
    default: EstadoLiquidacionReserva.NO_APLICA,
  })
  estado_liquidacion: EstadoLiquidacionReserva;

  @Column({ type: 'timestamp', nullable: true })
  fecha_resolucion_liquidacion: Date | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  referencia_liquidacion: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  observacion_liquidacion: string | null;

  // Se conserva una copia del periodo para mantener el historial aunque
  // posteriormente se elimine la publicación o su calendario.
  @Column({ type: 'date', nullable: true })
  fecha_inicio: string | null;

  @Column({ type: 'date', nullable: true })
  fecha_fin: string | null;

  // Copia historica de los datos del inquilino al momento de reservar.
  // La relacion con Usuario puede quedar NULL si la cuenta se elimina.
  @Column({ type: 'varchar', length: 100, nullable: true })
  usuario_nombre: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  usuario_apellido: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  usuario_email: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  usuario_telefono: string | null;

  // Permiten reintentar correos fallidos sin duplicar los ya entregados.
  @Column({ type: 'boolean', default: false })
  email_confirmacion_inquilino_enviado: boolean;

  @Column({ type: 'boolean', default: false })
  email_nueva_reserva_anunciante_enviado: boolean;

  // Usuario que realiza la reserva (Inquilino)
  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Relation<Usuario | null>;

  // Publicación que se está reservando
  @ManyToOne(() => Publicacion, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_publicacion' })
  publicacion: Relation<Publicacion | null>;

  // --- Participantes ---

  esDelInquilino(idUsuario: number): boolean {
    return this.usuario?.id === idUsuario;
  }

  esDelAnunciante(idUsuario: number): boolean {
    return this.publicacion?.perteneceA(idUsuario) ?? false;
  }

  /** El detalle de una reserva solo corresponde al inquilino o al anunciante dueño. */
  participa(idUsuario: number): boolean {
    return this.esDelInquilino(idUsuario) || this.esDelAnunciante(idUsuario);
  }

  /** Copia histórica del nombre del inquilino; vacía si no se registró. */
  nombreInquilino(): string {
    return [this.usuario_nombre, this.usuario_apellido]
      .filter(Boolean)
      .join(' ');
  }

  emailDelAnunciante(): string | undefined {
    return this.publicacion?.emailDelAnunciante();
  }

  nombreDelAnunciante(): string {
    return this.publicacion?.nombreDelAnunciante() ?? '';
  }

  // --- Pago ---

  pagoAprobado(): boolean {
    return this.estado_pago === EstadoPagoReserva.APROBADO;
  }

  /** Pagada y vigente: habilita el código de alojamiento, los reclamos y la liquidación. */
  estaConfirmada(): boolean {
    return this.pagoAprobado() && !this.cancelada;
  }

  /** Ya no admite cambios del inquilino. */
  estaCerrada(): boolean {
    return this.cancelada || this.finalizada;
  }

  /** Aprueba el pago, emite el código de alojamiento y retiene el dinero hasta la estadía. */
  confirmarPago(fechaPago: Date, codigoAlojamiento: string): void {
    this.estado_pago = EstadoPagoReserva.APROBADO;
    this.fecha_pago = fechaPago;
    this.pago_vencimiento = null;
    this.codigo_alojamiento = codigoAlojamiento;
    this.codigo_generado_en = new Date();
    this.codigo_validado_en = null;
    this.intentos_codigo = 0;
    this.estado_liquidacion = EstadoLiquidacionReserva.RETENIDO;
  }

  /** Cierra la reserva cuyo pago falló, venció o fue devuelto. */
  cerrarSinPago(estado: EstadoPagoReserva): void {
    this.estado_pago = estado;
    this.estado_liquidacion =
      estado === EstadoPagoReserva.REEMBOLSADO
        ? EstadoLiquidacionReserva.DEVUELTO_INQUILINO
        : EstadoLiquidacionReserva.NO_APLICA;
    this.cancelar();
    this.pago_vencimiento = null;
  }

  cancelar(): void {
    this.cancelada = true;
    this.fecha_cancelacion = new Date();
  }

  /** Terminó la estadía. Las fechas no se liberan: quedan como historial. */
  finalizar(): void {
    this.finalizada = true;
  }

  /** Cambia el período conservando el importe contratado. */
  reprogramar(inicio: string, fin: string): void {
    this.fecha_inicio = inicio;
    this.fecha_fin = fin;
  }

  // --- Código de alojamiento ---

  /** Emite el código si falta (reservas aprobadas antes de existir el código). */
  asegurarCodigoAlojamiento(codigo: string): boolean {
    if (this.codigo_alojamiento) return false;
    this.codigo_alojamiento = codigo;
    this.codigo_generado_en = new Date();
    this.estado_liquidacion = EstadoLiquidacionReserva.RETENIDO;
    return true;
  }

  codigoValidado(): boolean {
    return !!this.codigo_validado_en;
  }

  codigoBloqueado(): boolean {
    return this.intentos_codigo >= Reserva.MAX_INTENTOS_CODIGO;
  }

  intentosCodigoRestantes(): number {
    return Math.max(0, Reserva.MAX_INTENTOS_CODIGO - this.intentos_codigo);
  }

  /**
   * Compara el código presentado por el anunciante. Si coincide, libera la
   * liquidación al propietario; si no, suma un intento y al llegar al límite
   * deja la reserva en revisión administrativa.
   */
  registrarIntentoCodigo(codigo: string): boolean {
    const recibido = codigo.trim().toUpperCase();
    const esperado = this.codigo_alojamiento ?? '';
    const coincide =
      recibido.length === esperado.length &&
      timingSafeEqual(Buffer.from(recibido), Buffer.from(esperado));
    if (!coincide) {
      this.intentos_codigo += 1;
      if (this.codigoBloqueado()) {
        this.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
        this.observacion_liquidacion =
          'Código bloqueado después de cinco intentos incorrectos';
      }
      return false;
    }
    this.codigo_validado_en = new Date();
    this.estado_liquidacion =
      EstadoLiquidacionReserva.PENDIENTE_PAGO_PROPIETARIO;
    this.observacion_liquidacion =
      'Código de alojamiento validado por el anunciante';
    return true;
  }

  // --- Liquidación ---

  liquidacionEnRevision(): boolean {
    return this.estado_liquidacion === EstadoLiquidacionReserva.EN_REVISION;
  }

  /** El dinero ya se pagó al propietario o se devolvió al inquilino. */
  liquidacionResuelta(): boolean {
    return [
      EstadoLiquidacionReserva.PAGADO_PROPIETARIO,
      EstadoLiquidacionReserva.DEVUELTO_INQUILINO,
    ].includes(this.estado_liquidacion);
  }

  /** El reclamo del inquilino congela cualquier liquidación pendiente. */
  reportarProblema(motivo: string): void {
    this.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
    this.observacion_liquidacion = `Reclamo del inquilino: ${motivo.trim()}`;
    this.fecha_resolucion_liquidacion = null;
  }

  /** Registra la decisión administrativa; devolver al inquilino también cancela la reserva. */
  resolverLiquidacion(
    estado: EstadoLiquidacionReserva,
    referencia?: string,
    observacion?: string,
  ): void {
    this.estado_liquidacion = estado;
    this.referencia_liquidacion = referencia?.trim() || null;
    this.observacion_liquidacion =
      observacion?.trim() || this.observacion_liquidacion;
    this.fecha_resolucion_liquidacion = this.liquidacionResuelta()
      ? new Date()
      : null;
    if (estado === EstadoLiquidacionReserva.RETENIDO) this.intentos_codigo = 0;
    if (estado === EstadoLiquidacionReserva.DEVUELTO_INQUILINO) {
      this.estado_pago = EstadoPagoReserva.REEMBOLSADO;
      this.cancelar();
    }
  }

  // --- Avisos ---

  marcarAvisoEnviado(destinatario: 'inquilino' | 'anunciante'): void {
    if (destinatario === 'inquilino')
      this.email_confirmacion_inquilino_enviado = true;
    else this.email_nueva_reserva_anunciante_enviado = true;
  }
}
