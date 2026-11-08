import type { Relation } from 'typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reserva } from './reserva.entity';
import { Usuario } from '../../usuarios/entity/usuario.entity';

export enum EstadoSolicitudCancelacion {
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
  VENCIDA = 'VENCIDA',
}

/** Pedido de cancelación de una reserva pagada, con su decisión administrativa. */
@Entity('solicitud_cancelacion')
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

  @Column({ type: 'varchar', length: 500 })
  motivo: string;

  @Column({
    type: 'enum',
    enum: EstadoSolicitudCancelacion,
    default: EstadoSolicitudCancelacion.PENDIENTE,
  })
  estado: EstadoSolicitudCancelacion;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_decidida_por' })
  decidida_por: Relation<Usuario | null>;

  @Column({ type: 'timestamp', nullable: true })
  decidida_en: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  observacion: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  creada_en: Date;
}
