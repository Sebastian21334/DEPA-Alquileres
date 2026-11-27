import type { Relation } from 'typeorm';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Resena } from './resena.entity';

@Entity('resena_imagen')
export class ResenaImagen {
  @PrimaryGeneratedColumn({ name: 'id_resena_imagen' })
  id: number;

  @Column({ name: 'url', type: 'varchar', length: 500 })
  url: string;

  @Column({ name: 'orden', type: 'int', default: 0 })
  orden: number;

  @ManyToOne(() => Resena, (resena) => resena.imagenes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_resena' })
  resena: Relation<Resena>;
}
