import type { Relation } from 'typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reserva } from '../../reservas/entity/reserva.entity';
import { Pago } from '../../pagos/entity/pago.entity';
import { Usuario } from '../../usuarios/entity/usuario.entity';

export enum TipoReembolso {
  TOTAL = 'TOTAL',
  PARCIAL = 'PARCIAL',
  CONTRACARGO = 'CONTRACARGO',
}

export enum OrigenReembolso {
  CANCELACION = 'CANCELACION',
  RECLAMO = 'RECLAMO',
  CONTRACARGO = 'CONTRACARGO',
  PAGO_TARDIO = 'PAGO_TARDIO',
  AJUSTE_ADMIN = 'AJUSTE_ADMIN',
}

export enum EstadoReembolso {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  FALLIDO = 'FALLIDO',
  CANCELADO = 'CANCELADO',
}

/** Registro auditable de una devolución total o parcial. */
@Entity('reembolso')
export class Reembolso {
  @PrimaryGeneratedColumn({ name: 'id_reembolso' })
  id: number;

  @ManyToOne(() => Reserva, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'id_reserva',
    foreignKeyConstraintName: 'FK_reembolso_reserva',
  })
  reserva: Relation<Reserva>;

  @ManyToOne(() => Pago, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'id_pago',
    foreignKeyConstraintName: 'FK_reembolso_pago',
  })
  pago: Relation<Pago>;

  @Column({ type: 'enum', enum: TipoReembolso })
  tipo: TipoReembolso;

  @Column({ type: 'enum', enum: OrigenReembolso })
  origen: OrigenReembolso;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  importe: number;

  @Column({ type: 'varchar', length: 3, default: 'ARS' })
  moneda: string;

  @Column({
    type: 'enum',
    enum: EstadoReembolso,
    default: EstadoReembolso.PENDIENTE,
  })
  estado: EstadoReembolso;

  @Column({ type: 'varchar', length: 500 })
  motivo: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  referencia_interna: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true, unique: true })
  referencia_externa: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  id_externo: string | null;

  @Column({ type: 'varchar', length: 36, unique: true })
  idempotency_key: string;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_solicitado_por' })
  solicitado_por: Relation<Usuario | null>;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_resuelto_por' })
  resuelto_por: Relation<Usuario | null>;

  @CreateDateColumn({ type: 'timestamp' })
  creado_en: Date;

  @Column({ type: 'timestamp', nullable: true })
  resuelto_en: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  error_detalle: string | null;

  get esTotal(): boolean {
    return this.tipo === TipoReembolso.TOTAL || this.tipo === TipoReembolso.CONTRACARGO;
  }
}
