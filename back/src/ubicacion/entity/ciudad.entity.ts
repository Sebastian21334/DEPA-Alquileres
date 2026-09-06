import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Provincia } from './provincia.entity';

@Entity('ciudad')
export class Ciudad {
  // Una ciudad siempre queda asociada a una provincia mediante id_provincia.
  @PrimaryGeneratedColumn({ name: 'id_ciudad' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  // Relación: Muchas ciudades pertenecen a una provincia
  @ManyToOne(() => Provincia, (provincia) => provincia.ciudades)
  @JoinColumn({ name: 'id_provincia' })
  provincia: Provincia;
}