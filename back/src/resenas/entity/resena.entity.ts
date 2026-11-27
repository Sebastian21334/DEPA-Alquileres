import type { Relation } from 'typeorm';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entity/usuario.entity';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import { ResenaImagen } from './resena-imagen.entity';
import {
  MAX_CARACTERES_COMENTARIO,
  MAX_CARACTERES_MOTIVO_DENUNCIA,
  MAX_CARACTERES_MOTIVO_MODERACION,
} from '../resenas.constants';

/** Una reseña apunta a una publicación o a un perfil de anunciante, nunca a ambos. */
@Entity('resena')
@Check('ck_resena_un_objetivo', `((id_publicacion IS NOT NULL)::int + (id_anunciante IS NOT NULL)::int) = 1`)
@Check('ck_resena_puntaje', 'puntaje BETWEEN 1 AND 5')
export class Resena {
  @PrimaryGeneratedColumn({ name: 'id_resena' })
  id: number;

  @Column({ name: 'puntaje', type: 'smallint' })
  puntaje: number;

  @Column({ name: 'comentario', type: 'varchar', length: MAX_CARACTERES_COMENTARIO })
  comentario: string;

  @Column({ name: 'fecha', type: 'timestamptz' })
  fecha: Date;

  @Column({ name: 'actualizada_en', type: 'timestamptz', nullable: true })
  actualizada_en: Date | null;

  // Las reseñas ocultas conservan su historial para la auditoría administrativa.
  @Column({ name: 'visible', type: 'boolean', default: true })
  visible: boolean;

  @Column({
    name: 'motivo_moderacion',
    type: 'varchar',
    length: MAX_CARACTERES_MOTIVO_MODERACION,
    nullable: true,
  })
  motivo_moderacion: string | null;

  @Column({ name: 'fecha_moderacion', type: 'timestamptz', nullable: true })
  fecha_moderacion: Date | null;

  // Denuncia de un usuario. No cambia la visibilidad: el admin decide después.
  @Column({ name: 'denunciada', type: 'boolean', default: false })
  denunciada: boolean;

  @Column({
    name: 'motivo_denuncia',
    type: 'varchar',
    length: MAX_CARACTERES_MOTIVO_DENUNCIA,
    nullable: true,
  })
  motivo_denuncia: string | null;

  @Column({ name: 'fecha_denuncia', type: 'timestamptz', nullable: true })
  fecha_denuncia: Date | null;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  autor: Relation<Usuario>;

  @ManyToOne(() => Publicacion, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'id_publicacion' })
  publicacion: Relation<Publicacion | null>;

  @ManyToOne(() => Anunciante, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'id_anunciante', referencedColumnName: 'idUsuario' })
  anunciante: Relation<Anunciante | null>;

  @ManyToOne(() => Usuario, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'moderada_por' })
  moderador: Relation<Usuario | null>;

  @ManyToOne(() => Usuario, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'denunciada_por' })
  denunciante: Relation<Usuario | null>;

  @OneToMany(() => ResenaImagen, (imagen) => imagen.resena)
  imagenes: Relation<ResenaImagen[]>;
}
