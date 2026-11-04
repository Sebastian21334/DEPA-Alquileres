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

export enum EstadoDisputa {
  ABIERTA = 'ABIERTA',
  EN_REVISION = 'EN_REVISION',
  GANADA = 'GANADA',
  PERDIDA = 'PERDIDA',
  CERRADA = 'CERRADA',
}

export enum OrigenDisputa {
  CONTRACARGO = 'CONTRACARGO',
}

/** Expediente de un contracargo informado por Mercado Pago. */
@Entity('disputa')
export class Disputa {
  @PrimaryGeneratedColumn({ name: 'id_disputa' })
  id: number;

  @ManyToOne(() => Reserva, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'id_reserva',
    foreignKeyConstraintName: 'FK_disputa_reserva',
  })
  reserva: Relation<Reserva>;

  @ManyToOne(() => Pago, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'id_pago',
    foreignKeyConstraintName: 'FK_disputa_pago',
  })
  pago: Relation<Pago>;

  @Column({ type: 'enum', enum: OrigenDisputa })
  origen: OrigenDisputa;

  @Column({
    type: 'enum',
    enum: EstadoDisputa,
    default: EstadoDisputa.ABIERTA,
  })
  estado: EstadoDisputa;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  importe: number;

  @Column({ type: 'varchar', length: 3, default: 'ARS' })
  moneda: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  motivo: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true, unique: true })
  chargeback_id: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  referencia_externa: string | null;

  @Column({ type: 'jsonb', nullable: true })
  evidencia: unknown | null;

  @Column({ type: 'timestamp', nullable: true })
  fecha_limite_respuesta: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  resolucion: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  estado_pago_previo: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  estado_liquidacion_previo: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_resuelto_por' })
  resuelto_por: Relation<Usuario | null>;

  @CreateDateColumn({ type: 'timestamp' })
  creado_en: Date;

  @Column({ type: 'timestamp', nullable: true })
  resuelto_en: Date | null;
}
