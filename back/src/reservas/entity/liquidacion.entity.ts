import type { Relation } from 'typeorm';
import { Estado } from '../../catalogos/entity/estado.entity';
import { AmbitoEstado, EstadoLiquidacionReserva } from '../../catalogos/estados';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  ForeignKey,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reserva } from './reserva.entity';
import { Usuario } from '../../usuarios/entity/usuario.entity';

/**
 * Registro completo y auditable de la liquidación de una reserva.
 * `reserva.estado_liquidacion` se conserva como caché de compatibilidad.
 */
@Entity('liquidacion')
@Check('ck_liquidacion_estado_ambito', `"ambito_estado" = '${AmbitoEstado.LIQUIDACION_RESERVA}'`)
@ForeignKey(() => Estado, ['ambito_estado', 'estado'], ['codigoAmbito', 'codigo'], {
  name: 'fk_liquidacion_estado',
  onDelete: 'RESTRICT',
})
export class Liquidacion {
  @PrimaryGeneratedColumn({ name: 'id_liquidacion' })
  id: number;

  @OneToOne(() => Reserva, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'id_reserva',
    foreignKeyConstraintName: 'FK_liquidacion_reserva',
  })
  reserva: Relation<Reserva>;

  @Column({
    name: 'estado',
    type: 'varchar',
    length: 40,
    default: EstadoLiquidacionReserva.NO_APLICA,
  })
  estado: EstadoLiquidacionReserva;

  @Column({
    name: 'ambito_estado',
    type: 'varchar',
    length: 40,
    select: false,
    insert: false,
    update: false,
  })
  readonly ambito_estado: typeof AmbitoEstado.LIQUIDACION_RESERVA;

  @Column({
    name: 'importe',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  importe: number | null;

  @Column({ name: 'moneda', type: 'varchar', length: 3, nullable: true })
  moneda: string | null;

  @Column({
    name: 'referencia',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  referencia: string | null;

  @Column({
    name: 'observacion',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  observacion: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'id_admin_resolucion',
    foreignKeyConstraintName: 'FK_liquidacion_admin',
  })
  admin_resolucion: Relation<Usuario | null>;

  @Column({ name: 'fecha_resolucion', type: 'timestamp', nullable: true })
  fecha_resolucion: Date | null;

  @Column({ name: 'fecha_pago_propietario', type: 'timestamp', nullable: true })
  fecha_pago_propietario: Date | null;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamp' })
  actualizado_en: Date;
}
