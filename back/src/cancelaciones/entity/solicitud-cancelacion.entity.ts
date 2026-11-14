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
import { Usuario } from '../../usuarios/entity/usuario.entity';

/** Pedido de cancelación de una reserva pagada, con su decisión administrativa. */
@Entity('solicitud_cancelacion')
@Check('ck_solicitud_cancelacion_estado_ambito', `"ambito_estado" = '${"SOLICITUD_CANCELACION"}'`)
@ForeignKey(() => Estado, ['ambitoEstado', 'estado'], ['codigoAmbito', 'codigo'], {
  name: 'fk_solicitud_cancelacion_estado',
  onDelete: 'RESTRICT',
})
export class SolicitudCancelacion {
  @PrimaryGeneratedColumn({ name: 'id_solicitud_cancelacion' })
  id: number;

  @ManyToOne(() => Reserva, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'id_reserva',
    foreignKeyConstraintName: 'FK_solicitud_cancelacion_reserva',
  })
  reserva: Relation<Reserva>;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'id_solicitante',
    foreignKeyConstraintName: 'FK_solicitud_cancelacion_solicitante',
  })
  solicitante: Relation<Usuario>;

  @Column({ name: 'motivo', type: 'varchar', length: 500 })
  motivo: string;

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
  readonly ambitoEstado: "SOLICITUD_CANCELACION";

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_decidida_por' })
  decidida_por: Relation<Usuario | null>;

  @Column({ name: 'decidida_en', type: 'timestamp', nullable: true })
  decidida_en: Date | null;

  @Column({ name: 'observacion', type: 'varchar', length: 500, nullable: true })
  observacion: string | null;

  @CreateDateColumn({ name: 'creada_en', type: 'timestamp' })
  creada_en: Date;
}
