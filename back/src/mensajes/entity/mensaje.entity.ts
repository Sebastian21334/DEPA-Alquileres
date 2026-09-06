import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entity/usuario.entity';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';

@Entity('mensaje')
export class Mensaje {
  // Un mensaje pertenece simultáneamente a una publicación y a dos usuarios.
  @PrimaryGeneratedColumn({ name: 'id_mensaje' })
  id: number;

  @Column({ type: 'varchar', length: 250 })
  texto: string;

  @Column({ type: 'timestamp' })
  fecha: Date;

  // Se separan origen y destino para reconstruir ambos sentidos de una conversación.
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_origen_usuario' })
  origenUsuario: Usuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_destino_usuario' })
  destinoUsuario: Usuario;

  @ManyToOne(() => Publicacion)
  @JoinColumn({ name: 'id_publicacion' })
  publicacion: Publicacion;
}