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

  @Column({ name: 'verificado', type: 'boolean', default: false })
  // Solo los anunciantes verificados pueden publicar o administrar imágenes.
  verificado: boolean;

  // Único entre las cuentas activas, comparando solo los dígitos (índice
  // uq_anunciante_cuit_cuil_digitos de la migración 20261104). Al dar de baja la
  // cuenta queda en null para que la persona pueda volver a registrarlo (RN-37).
  @Column({ name: 'cuit_cuil', type: 'varchar', length: 15, nullable: true })
  cuit_cuil: string | null;

  // CUIT/CUIL original de una cuenta dada de baja; la sigue identificando en el historial.
  @Column({name: 'cuit_cuil_historico',type: 'varchar',length: 15, nullable: true,
  })
  cuit_cuil_historico: string | null;

  @Column({ name: 'numero_contacto', type: 'varchar', length: 20 })
  numero_contacto: string;

  @ManyToOne(() => TipoAnunciante)
  @JoinColumn({ name: 'id_tipo_anunciante' })
  tipoAnunciante: Relation<TipoAnunciante>;
}
