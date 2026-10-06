import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entity/usuario.entity';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';
import { MetodoPago } from '../../catalogos/entity/metodo-pago.entity';

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
  fecha_inicio: Date | null;

  @Column({ type: 'date', nullable: true })
  fecha_fin: Date | null;

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
  usuario: Usuario | null;

  // Publicación que se está reservando
  @ManyToOne(() => Publicacion, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_publicacion' })
  publicacion: Publicacion | null;

  // Método de pago utilizado (Crédito, Débito, QR)
  @ManyToOne(() => MetodoPago, { nullable: true })
  @JoinColumn({ name: 'id_metodo_pago' })
  metodoPago: MetodoPago | null;
}
