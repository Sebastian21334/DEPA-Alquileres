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

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 255 })
  nombre_archivo: string;

  @Column({ type: 'varchar', length: 100, default: 'image/jpeg' })
  tipo: string;

  @CreateDateColumn({ type: 'timestamp' })
  creado_en: Date;
}
