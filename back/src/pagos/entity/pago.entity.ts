import type { Relation } from 'typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reserva } from '../../reservas/entity/reserva.entity';

@Entity('pago')
export class Pago {
  @PrimaryGeneratedColumn({ name: 'id_pago' })
  id: number;

  @OneToOne(() => Reserva, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_reserva' })
  reserva: Relation<Reserva>;

  @Column({
    name: 'external_reference',
    type: 'varchar',
    length: 100,
    unique: true,
  })
  external_reference: string;

  @Column({
    name: 'preference_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  preference_id: string | null;

  @Column({
    name: 'payment_id',
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
  })
  payment_id: string | null;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({
    name: 'status_detail',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  status_detail: string | null;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'currency', type: 'varchar', length: 3, default: 'ARS' })
  currency: string;

  // Medio confirmado por Mercado Pago; no depende de un catálogo local.
  @Column({
    name: 'payment_method_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  payment_method_id: string | null;

  @Column({
    name: 'idempotency_key',
    type: 'varchar',
    length: 36,
    unique: true,
  })
  idempotency_key: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approved_at: Date | null;

  // Agregado de los reembolsos aprobados. La fuente de verdad es la tabla reembolso.
  @Column({
    name: 'amount_refunded',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  amount_refunded: number;

  @Column({ name: 'refunded_at', type: 'timestamp', nullable: true })
  refunded_at: Date | null;

  @Column({
    name: 'chargeback_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  chargeback_id: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;

}
