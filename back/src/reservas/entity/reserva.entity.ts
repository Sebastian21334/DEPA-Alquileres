import type { Relation } from 'typeorm';
import { Estado } from '../../catalogos/entity/estado.entity';
import { AmbitoEstado, EstadoPagoReserva, EstadoLiquidacionReserva } from '../../catalogos/estados';
import {
  Entity,
  PrimaryGeneratedColumn,
  Check,
  Column,
  ForeignKey,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Usuario } from '../../usuarios/entity/usuario.entity';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';
import { Pago } from '../../pagos/entity/pago.entity';
import { Reembolso } from '../../reembolsos/entity/reembolso.entity';
import { ReprogramacionReserva } from './reprogramacion-reserva.entity';
import { Liquidacion } from './liquidacion.entity';
import { CotizacionDolar } from '../../cotizaciones/entity/cotizacion-dolar.entity';
import type { ActorCancelacion } from '../actor-cancelacion';

@Entity('reserva')
@Check('ck_reserva_estado_pago_ambito', `"ambito_estado_pago" = '${AmbitoEstado.PAGO_RESERVA}'`)
@ForeignKey(() => Estado, ['ambitoEstadoPago', 'estado_pago'], ['codigoAmbito', 'codigo'], {
  name: 'fk_reserva_estado_pago',
  onDelete: 'RESTRICT',
})
@Check('ck_reserva_estado_liquidacion_ambito', `"ambito_estado_liquidacion" = '${AmbitoEstado.LIQUIDACION_RESERVA}'`)
@ForeignKey(() => Estado, ['ambitoEstadoLiquidacion', 'estado_liquidacion'], ['codigoAmbito', 'codigo'], {
  name: 'fk_reserva_estado_liquidacion',
  onDelete: 'RESTRICT',
})
export class Reserva {

  // La reserva registra el pago y vincula al inquilino con una publicación.
  @PrimaryGeneratedColumn({ name: 'id_reserva' })
  id: number;

  @Column({ name: 'finalizada', type: 'boolean', default: false })
  finalizada: boolean;

  @Column({ name: 'cancelada', type: 'boolean', default: false })
  cancelada: boolean;

  @Column({ name: 'fecha_cancelacion', type: 'timestamp', nullable: true })
  fecha_cancelacion: Date | null;

  @Column({
    name: 'motivo_cancelacion',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  motivo_cancelacion: string | null;

  @Column({
    name: 'cancelada_por',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  cancelada_por: ActorCancelacion | null;

  @Column({ name: 'monto_pago', type: 'decimal', precision: 10, scale: 2 })
  monto_pago: number;

  // Condiciones aceptadas al reservar; nunca se recalculan al cambiar fechas.
  @Column({
    name: 'precio_unitario_contratado',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  precio_unitario_contratado: number | null;

  @Column({
    name: 'importe_contratado',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  importe_contratado: number | null;

  @Column({
    name: 'moneda_contratada',
    type: 'varchar',
    length: 3,
    nullable: true,
  })
  moneda_contratada: string | null;

  @Column({ name: 'moneda_origen', type: 'varchar', length: 3, nullable: true })
  moneda_origen: string | null;

  @Column({
    name: 'importe_origen',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  importe_origen: number | null;

  @ManyToOne(() => CotizacionDolar, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'id_cotizacion_dolar',
    foreignKeyConstraintName: 'FK_reserva_cotizacion_dolar',
  })
  cotizacion_dolar: Relation<CotizacionDolar | null>;

  @Column({
    name: 'cotizacion_aceptada_en',
    type: 'timestamptz',
    nullable: true,
  })
  cotizacion_aceptada_en: Date | null;

  @Column({
    name: 'presupuesto_emitido_en',
    type: 'timestamptz',
    nullable: true,
  })
  presupuesto_emitido_en: Date | null;

  @Column({ name: 'presupuesto_vence_en', type: 'timestamptz', nullable: true })
  presupuesto_vence_en: Date | null;

  @OneToMany(() => ReprogramacionReserva, (cambio) => cambio.reserva)
  reprogramaciones: Relation<ReprogramacionReserva[]>;

  @Column({ name: 'fecha_pago', type: 'timestamp', nullable: true })
  fecha_pago: Date | null;

  @Column({ name: 'estado_pago', type: 'varchar', length: 40, default: EstadoPagoReserva.APROBADO })
  estado_pago: EstadoPagoReserva;

  @Column({
    name: 'ambito_estado_pago',
    type: 'varchar',
    length: 40,
    select: false,
    insert: false,
    update: false,
  })
  readonly ambitoEstadoPago: typeof AmbitoEstado.PAGO_RESERVA;

  @Column({ name: 'pago_vencimiento', type: 'timestamp', nullable: true })
  pago_vencimiento: Date | null;

  // El código se excluye de todas las consultas normales. Solo puede
  // recuperarlo el inquilino mediante el endpoint protegido específico.
  @Column({
    name: 'codigo_alojamiento',
    type: 'varchar',
    length: 8,
    nullable: true,
    select: false,
  })
  codigo_alojamiento: string | null;

  @Column({ name: 'codigo_generado_en', type: 'timestamp', nullable: true })
  codigo_generado_en: Date | null;

  @Column({ name: 'codigo_validado_en', type: 'timestamp', nullable: true })
  codigo_validado_en: Date | null;

  @Column({ name: 'intentos_codigo', type: 'int', default: 0 })
  intentos_codigo: number;

  @Column({ name: 'estado_liquidacion', type: 'varchar', length: 40, default: EstadoLiquidacionReserva.NO_APLICA })
  estado_liquidacion: EstadoLiquidacionReserva;

  @Column({
    name: 'ambito_estado_liquidacion',
    type: 'varchar',
    length: 40,
    select: false,
    insert: false,
    update: false,
  })
  readonly ambitoEstadoLiquidacion: typeof AmbitoEstado.LIQUIDACION_RESERVA;

  @Column({
    name: 'fecha_resolucion_liquidacion',
    type: 'timestamp',
    nullable: true,
  })
  fecha_resolucion_liquidacion: Date | null;

  @Column({
    name: 'referencia_liquidacion',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  referencia_liquidacion: string | null;

  @Column({
    name: 'observacion_liquidacion',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  observacion_liquidacion: string | null;

  // Se conserva una copia del periodo para mantener el historial aunque
  // posteriormente se elimine la publicación o su calendario.
  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fecha_inicio: string | null;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fecha_fin: string | null;

  // Copia historica de los datos del inquilino al momento de reservar.
  // La relacion con Usuario puede quedar NULL si la cuenta se elimina.
  @Column({
    name: 'usuario_nombre',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  usuario_nombre: string | null;

  @Column({
    name: 'usuario_apellido',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  usuario_apellido: string | null;

  @Column({
    name: 'usuario_email',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  usuario_email: string | null;

  @Column({
    name: 'usuario_telefono',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  usuario_telefono: string | null;

  // Permiten reintentar correos fallidos sin duplicar los ya entregados.
  @Column({
    name: 'email_confirmacion_inquilino_enviado',
    type: 'boolean',
    default: false,
  })
  email_confirmacion_inquilino_enviado: boolean;

  @Column({
    name: 'email_nueva_reserva_anunciante_enviado',
    type: 'boolean',
    default: false,
  })
  email_nueva_reserva_anunciante_enviado: boolean;

  // Usuario que realiza la reserva (Inquilino)
  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Relation<Usuario | null>;

  // Publicación que se está reservando
  @ManyToOne(() => Publicacion, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_publicacion' })
  publicacion: Relation<Publicacion | null>;

  // Registro auditable de la liquidación; la reserva conserva la caché del estado.
  @OneToOne(() => Liquidacion, (liquidacion) => liquidacion.reserva)
  liquidacion: Relation<Liquidacion | null>;

  // Relaciones de lectura para la auditoría de la liquidación.
  @OneToOne(() => Pago, (pago) => pago.reserva)
  pago: Relation<Pago | null>;

  @OneToMany(() => Reembolso, (reembolso) => reembolso.reserva)
  reembolsos: Relation<Reembolso[]>;
}
