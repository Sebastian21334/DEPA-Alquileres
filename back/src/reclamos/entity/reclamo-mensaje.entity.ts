import { codigosCatalogo } from '../../catalogos/codigos-catalogo';
import type { Relation } from 'typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reclamo } from './reclamo.entity';
import { Usuario } from '../../usuarios/entity/usuario.entity';

export const VisibilidadMensajeReclamo = codigosCatalogo('RECLAMO_VISIBILIDAD');
export type VisibilidadMensajeReclamo = keyof typeof VisibilidadMensajeReclamo;

@Entity('reclamo_mensaje')
export class ReclamoMensaje {
  @PrimaryGeneratedColumn({ name: 'id_mensaje_reclamo' })
  id: number;

  @ManyToOne(() => Reclamo, (reclamo) => reclamo.mensajes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'id_reclamo',
    foreignKeyConstraintName: 'FK_reclamo_mensaje',
  })
  reclamo: Relation<Reclamo>;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_autor' })
  autor: Relation<Usuario>;

  @Column({ name: 'texto', type: 'varchar', length: 1000 })
  texto: string;

  @Column({
    name: 'visible_para',
    type: 'varchar', length: 40,
    default: VisibilidadMensajeReclamo.TODOS,
  })
  visible_para: VisibilidadMensajeReclamo;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creado_en: Date;
}
