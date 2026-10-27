import type { Relation } from 'typeorm';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';
import { Reserva } from '../../reservas/entity/reserva.entity';

@Entity('fecha')
@Unique('UQ_fecha_publicacion_dia', ['publicacion', 'fecha'])
export class Fecha {
  // Se almacena una fila por día para poder consultar y bloquear rangos fácilmente.
  @PrimaryGeneratedColumn({ name: 'id_fecha' })
  id: number;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'boolean', default: true })
  // False significa que el día ya no puede ser elegido para otra reserva.
  disponible: boolean;

  // -- Relaciones --
  @ManyToOne(() => Publicacion, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_publicacion' })
  publicacion: Relation<Publicacion>;

  @ManyToOne(() => Reserva, { nullable: true })
  @JoinColumn({ name: 'id_reserva' })
  reserva: Relation<Reserva | null>;
}
