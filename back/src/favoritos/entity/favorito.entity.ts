import { CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entity/usuario.entity';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';

@Entity('favorito')
@Index(['usuario', 'publicacion'], { unique: true })
export class Favorito {
  @PrimaryGeneratedColumn({ name: 'id_favorito' })
  id: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Publicacion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_publicacion' })
  publicacion: Publicacion;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creado_en: Date;
}
