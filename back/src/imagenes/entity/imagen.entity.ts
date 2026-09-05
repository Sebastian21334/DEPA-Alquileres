import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';

@Entity('imagen')
export class Imagen {
  @PrimaryGeneratedColumn({ name: 'id_imagen' })
  id: number;

  @Column({ type: 'varchar', length: 250 })
  url: string;

  // -- Relaciones --
  @ManyToOne(() => Publicacion, (publicacion) => publicacion.imagenes)
  @JoinColumn({ name: 'id_publicacion' })
  publicacion: Publicacion;;
}