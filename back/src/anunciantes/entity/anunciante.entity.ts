import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Usuario } from '../../usuarios/entity/usuario.entity';
import { TipoAnunciante } from '../../catalogos/entity/tipo-anunciante.entity';

@Entity('anunciante')
export class Anunciante {
  // El anunciante comparte el ID del usuario: es una extensión 1 a 1 de Usuario.
  @PrimaryColumn({ name: 'id_usuario' })
  idUsuario: number;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({ type: 'boolean', default: false })
  // Solo los anunciantes verificados pueden publicar o administrar imágenes.
  verificado: boolean;

  @Column({ type: 'varchar', length: 15, nullable: true })
  cuit_cuil: string;

  @Column({ type: 'varchar', length: 20 })
  numero_contacto: string;

  @ManyToOne(() => TipoAnunciante)
  @JoinColumn({ name: 'id_tipo_anunciante' })
  tipoAnunciante: TipoAnunciante;
}