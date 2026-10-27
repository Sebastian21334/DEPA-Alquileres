import type { Relation } from 'typeorm';
import {
  Entity,
  Column,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Usuario } from '../../usuarios/entity/usuario.entity';
import { TipoAnunciante } from '../../catalogos/entity/tipo-anunciante.entity';

@Entity('anunciante')
export class Anunciante {
  // El anunciante comparte el ID del usuario: es una extensión 1 a 1 de Usuario.
  @PrimaryColumn({ name: 'id_usuario' })
  idUsuario: number;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Relation<Usuario>;

  @Column({ type: 'boolean', default: false })
  // Solo los anunciantes verificados pueden publicar o administrar imágenes.
  verificado: boolean;

  @Column({ type: 'varchar', length: 15, nullable: true })
  cuit_cuil: string;

  @Column({ type: 'varchar', length: 20 })
  numero_contacto: string;

  @ManyToOne(() => TipoAnunciante)
  @JoinColumn({ name: 'id_tipo_anunciante' })
  tipoAnunciante: Relation<TipoAnunciante>;

  /** Habilita a publicar después de aprobar la identidad. */
  verificar(): void {
    this.verificado = true;
  }

  nombreCompleto(): string {
    return this.usuario?.nombreCompleto() ?? '';
  }

  email(): string | undefined {
    return this.usuario?.email;
  }

  /** Teléfono que el anunciante informó para contacto o, si falta, el de su cuenta. */
  telefonoDeContacto(): string | undefined {
    return this.numero_contacto ?? this.usuario?.telefono;
  }
}
