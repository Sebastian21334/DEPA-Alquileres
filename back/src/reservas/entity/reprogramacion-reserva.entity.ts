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

  @Column({ name: 'fecha_inicio_anterior', type: 'date' })
  fecha_inicio_anterior: string;

  @Column({ name: 'fecha_fin_anterior', type: 'date' })
  fecha_fin_anterior: string;

  @Column({ name: 'fecha_inicio_nueva', type: 'date' })
  fecha_inicio_nueva: string;

  @Column({ name: 'fecha_fin_nueva', type: 'date' })
  fecha_fin_nueva: string;

  @CreateDateColumn({ name: 'creada_en', type: 'timestamp' })
  creada_en: Date;

  @Column({ name: 'notificada_en', type: 'timestamp', nullable: true })
  notificada_en: Date | null;

  @Column({
    name: 'destinatario',
    type: 'varchar',
    length: 150,
    nullable: true,
    select: false,
  })
  destinatario: string | null;

  @Column({ name: 'detalle', type: 'jsonb', select: false })
  detalle: ReprogramacionEmailDetalle;
}
