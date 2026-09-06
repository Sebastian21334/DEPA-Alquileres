import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Ciudad } from './ciudad.entity';

@Entity('provincia')
export class Provincia {
  // Entidad padre de la jerarquía geográfica.
  @PrimaryGeneratedColumn({ name: 'id_provincia' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  // Relación: Una provincia tiene muchas ciudades
  @OneToMany(() => Ciudad, (ciudad) => ciudad.provincia)
  ciudades: Ciudad[];
}