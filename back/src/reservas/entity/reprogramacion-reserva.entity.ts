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
import type { ReprogramacionEmailDetalle } from '../../mail/mail.interface';

/** El aviso se guarda junto con el cambio; un fallo del correo permite reintentarlo. */
@Entity('reprogramacion_reserva')
export class ReprogramacionReserva {
  @PrimaryGeneratedColumn({ name: 'id_reprogramacion' })
  id: number;

  @ManyToOne(() => Reserva, (reserva) => reserva.reprogramaciones, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'id_reserva',
    foreignKeyConstraintName: 'FK_reprogramacion_reserva',
  })
  reserva: Relation<Reserva>;

  @Column({ type: 'date' })
  fecha_inicio_anterior: string;

  @Column({ type: 'date' })
  fecha_fin_anterior: string;

  @Column({ type: 'date' })
  fecha_inicio_nueva: string;

  @Column({ type: 'date' })
  fecha_fin_nueva: string;

  @CreateDateColumn({ type: 'timestamp' })
  creada_en: Date;

  @Column({ type: 'timestamp', nullable: true })
  notificada_en: Date | null;

  @Column({ type: 'varchar', length: 150, nullable: true, select: false })
  destinatario: string | null;

  @Column({ type: 'jsonb', select: false })
  detalle: ReprogramacionEmailDetalle;
}
