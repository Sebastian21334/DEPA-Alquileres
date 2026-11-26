import type { Relation } from 'typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reclamo } from './reclamo.entity';
import { ReclamoEvidencia } from './reclamo-evidencia.entity';
import { Usuario } from '../../usuarios/entity/usuario.entity';

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

  // Se escribió desde el panel de Administración; un admin que es parte de la reserva escribe como parte desde su chat.
  @Column({ name: 'como_administracion', type: 'boolean', default: false })
  como_administracion: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creado_en: Date;

  // Imágenes enviadas con este mensaje.
  @OneToMany(() => ReclamoEvidencia, (evidencia) => evidencia.mensaje)
  evidencias?: Relation<ReclamoEvidencia[]>;
}
