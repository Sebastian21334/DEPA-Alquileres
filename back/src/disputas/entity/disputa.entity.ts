import type { Relation } from 'typeorm';
import {
  Check,
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
import { Estado } from '../../catalogos/entity/estado.entity';

export enum OrigenDisputa {
  CONTRACARGO = 'CONTRACARGO',
}

/** Expediente de un contracargo informado por Mercado Pago. */
@Entity('disputa')
@Check('ck_disputa_estado_ambito', `"ambito_estado" = '${"DISPUTA"}'`)
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

  @Column({ name: 'origen', type: 'enum', enum: OrigenDisputa })
  origen: OrigenDisputa;

  @Column({
    name: 'ambito_estado',
    type: 'varchar',
    length: 40,
    select: false,
    insert: false,
    update: false,
  })
  readonly ambitoEstado: "DISPUTA";

  @ManyToOne(() => Estado, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn([
    { name: 'ambito_estado', referencedColumnName: 'codigoAmbito', foreignKeyConstraintName: 'fk_disputa_estado' },
    { name: 'estado', referencedColumnName: 'codigo' },
  ])
  estado: Relation<Estado>;

  @Column({ name: 'importe', type: 'decimal', precision: 10, scale: 2 })
  importe: number;

  @Column({ name: 'moneda', type: 'varchar', length: 3, default: 'ARS' })
  moneda: string;

  @Column({ name: 'motivo', type: 'varchar', length: 500, nullable: true })
  motivo: string | null;

  @Column({
    name: 'chargeback_id',
    type: 'varchar',
    length: 150,
    nullable: true,
    unique: true,
  })
  chargeback_id: string | null;

  @Column({
    name: 'referencia_externa',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  referencia_externa: string | null;

  @Column({ name: 'evidencia', type: 'jsonb', nullable: true })
  evidencia: unknown | null;

  @Column({ name: 'fecha_limite_respuesta', type: 'timestamp', nullable: true })
  fecha_limite_respuesta: Date | null;

  @Column({ name: 'resolucion', type: 'varchar', length: 500, nullable: true })
  resolucion: string | null;

  @Column({
    name: 'estado_pago_previo',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  estado_pago_previo: string | null;

  @Column({
    name: 'estado_liquidacion_previo',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  estado_liquidacion_previo: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_resuelto_por' })
  resuelto_por: Relation<Usuario | null>;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creado_en: Date;

  @Column({ name: 'resuelto_en', type: 'timestamp', nullable: true })
  resuelto_en: Date | null;
}
