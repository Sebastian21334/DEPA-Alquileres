import type { Relation } from 'typeorm';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';

@Entity('imagen')
export class Imagen {
  // La imagen se persiste como URL porque el archivo vive en Azure Blob Storage.
  @PrimaryGeneratedColumn({ name: 'id_imagen' })
  id: number;

  @Column({ name: 'url', type: 'varchar', length: 250 })
  url: string;

  // La primera imagen por orden es la portada de la publicación.
  @Column({ name: 'orden', type: 'integer', default: 0 })
  orden: number;

  // La relación inversa permite cargar todas las imágenes de una publicación.
  @ManyToOne(() => Publicacion, (publicacion) => publicacion.imagenes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_publicacion' })
  publicacion: Relation<Publicacion>;

}
