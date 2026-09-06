import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';

@Entity('imagen')
export class Imagen {
  // La imagen se persiste como URL porque el archivo vive en Azure Blob Storage.
  @PrimaryGeneratedColumn({ name: 'id_imagen' })
  id: number;

  @Column({ type: 'varchar', length: 250 })
  url: string;

  // La relación inversa permite cargar todas las imágenes de una publicación.
  @ManyToOne(() => Publicacion, (publicacion) => publicacion.imagenes)
  @JoinColumn({ name: 'id_publicacion' })
  publicacion: Publicacion;;
}