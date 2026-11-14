import { codigosCatalogo } from '../../catalogos/codigos-catalogo';
import type { Relation } from 'typeorm';
import { Estado } from '../../catalogos/entity/estado.entity';
import {
  Check,
  Column,
  ForeignKey,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reserva } from '../../reservas/entity/reserva.entity';
import { Pago } from '../../pagos/entity/pago.entity';
import { Usuario } from '../../usuarios/entity/usuario.entity';

export const TipoReembolso = codigosCatalogo('REEMBOLSO_TIPO');
export type TipoReembolso = keyof typeof TipoReembolso;

export const OrigenReembolso = codigosCatalogo('REEMBOLSO_ORIGEN');
export type OrigenReembolso = keyof typeof OrigenReembolso;

/** Registro auditable de una devolución total o parcial. */
@Entity('reembolso')
@Check('ck_reembolso_estado_ambito', `"ambito_estado" = '${"REEMBOLSO"}'`)
@ForeignKey(() => Estado, ['ambitoEstado', 'estado'], ['codigoAmbito', 'codigo'], {
  name: 'fk_reembolso_estado',
  onDelete: 'RESTRICT',
})
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

  @Column({ name: 'tipo', type: 'varchar', length: 40, })
  tipo: TipoReembolso;

  @Column({ name: 'origen', type: 'varchar', length: 40, })
  origen: OrigenReembolso;

  @Column({ name: 'importe', type: 'decimal', precision: 10, scale: 2 })
  importe: number;

  @Column({ name: 'moneda', type: 'varchar', length: 3, default: 'ARS' })
  moneda: string;

  @Column({ name: 'estado', type: 'varchar', length: 40, default: 'PENDIENTE' })
  estado: string;

  @Column({
    name: 'ambito_estado',
    type: 'varchar',
    length: 40,
    select: false,
    insert: false,
    update: false,
  })
  readonly ambitoEstado: "REEMBOLSO";

  @Column({ name: 'motivo', type: 'varchar', length: 500 })
  motivo: string;

  @Column({
    name: 'referencia_interna',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  referencia_interna: string | null;

  @Column({
    name: 'referencia_externa',
    type: 'varchar',
    length: 150,
    nullable: true,
    unique: true,
  })
  referencia_externa: string | null;

  @Column({
    name: 'id_externo',
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
  })
  id_externo: string | null;

  @Column({
    name: 'idempotency_key',
    type: 'varchar',
    length: 36,
    unique: true,
  })
  idempotency_key: string;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_solicitado_por' })
  solicitado_por: Relation<Usuario | null>;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_resuelto_por' })
  resuelto_por: Relation<Usuario | null>;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creado_en: Date;

  @Column({ name: 'resuelto_en', type: 'timestamp', nullable: true })
  resuelto_en: Date | null;

  @Column({ name: 'aplicado_en', type: 'timestamp', nullable: true })
  aplicado_en: Date | null;

  @Column({ name: 'revision_aplicacion', type: 'boolean', default: false })
  revision_aplicacion: boolean;

  @Column({ name: 'conciliar_en', type: 'timestamptz', nullable: true, select: false })
  conciliar_en: Date | null;

  @Column({ name: 'primer_intento_en', type: 'timestamptz', nullable: true, select: false })
  primer_intento_en: Date | null;

  @Column({
    name: 'error_detalle',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  error_detalle: string | null;

}
