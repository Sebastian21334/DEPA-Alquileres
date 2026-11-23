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
import { ReclamoMensaje } from './reclamo-mensaje.entity';
import { Usuario } from '../../usuarios/entity/usuario.entity';

@Entity('reclamo_evidencia')
export class ReclamoEvidencia {
  @PrimaryGeneratedColumn({ name: 'id_evidencia' })
  id: number;

  @ManyToOne(() => Reclamo, (reclamo) => reclamo.evidencias, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'id_reclamo',
    foreignKeyConstraintName: 'FK_reclamo_evidencia',
  })
  reclamo: Relation<Reclamo>;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Relation<Usuario | null>;

  // T49: mensaje del chat con el que se envió; null si es de la descripción del reclamo.
  @ManyToOne(() => ReclamoMensaje, (mensaje) => mensaje.evidencias, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_mensaje', foreignKeyConstraintName: 'FK_reclamo_evidencia_mensaje' })
  mensaje: Relation<ReclamoMensaje | null>;

  @Column({ name: 'url', type: 'varchar', length: 500 })
  url: string;

  @Column({ name: 'nombre_archivo', type: 'varchar', length: 255 })
  nombre_archivo: string;

  @Column({ name: 'tipo', type: 'varchar', length: 100, default: 'image/jpeg' })
  tipo: string;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creado_en: Date;
}
