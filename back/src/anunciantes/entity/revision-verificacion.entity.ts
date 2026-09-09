import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Anunciante } from './anunciante.entity';
import { EstadoVerificacion } from './solicitud-verificacion.entity';

@Entity('revision_verificacion')
export class RevisionVerificacion {
  @PrimaryGeneratedColumn({ name: 'id_revision_verificacion' })
  id: number;

  @Column({ type: 'int' })
  numero_revision: number;

  @Column({ type: 'enum', enum: EstadoVerificacion })
  estado: EstadoVerificacion;

  @Column({ type: 'varchar', length: 500, nullable: true })
  motivo: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creada_en: Date;

  @ManyToOne(() => Anunciante, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_anunciante' })
  anunciante: Anunciante;
}