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

  estaReservada(): boolean {
    return !!this.reserva;
  }

  /** Se puede elegir para una reserva nueva. */
  estaLibre(): boolean {
    return this.disponible && !this.estaReservada();
  }

  /** Libre, o ya ocupada por esa misma reserva (al reprogramarla). */
  puedeOcuparla(idReserva: number): boolean {
    return this.reserva ? this.reserva.id === idReserva : this.disponible;
  }

  ocuparPor(idReserva: number): void {
    this.disponible = false;
    // Solo con el ID: TypeORM resuelve la FK sin cargar la reserva completa.
    this.reserva = Object.assign(new Reserva(), { id: idReserva });
  }

  liberar(): void {
    this.disponible = true;
    this.reserva = null;
  }

  /** El anunciante habilita o bloquea el día a mano (sin reserva de por medio). */
  cambiarDisponibilidad(disponible: boolean): void {
    this.disponible = disponible;
  }
}
