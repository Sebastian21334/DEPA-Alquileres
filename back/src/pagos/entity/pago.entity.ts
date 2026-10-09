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
  reserva: Reserva;

  @Column({ type: 'varchar', length: 100, unique: true })
  external_reference: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  preference_id: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  payment_id: string | null;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  status_detail: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'ARS' })
  currency: string;

  // Medio confirmado por Mercado Pago; no depende de un catálogo local.
  @Column({ type: 'varchar', length: 100, nullable: true })
  payment_method_id: string | null;

  @Column({ type: 'varchar', length: 36, unique: true })
  idempotency_key: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
