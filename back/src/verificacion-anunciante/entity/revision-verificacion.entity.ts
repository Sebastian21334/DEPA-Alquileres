import type { Relation } from 'typeorm';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import { EstadoVerificacion } from './solicitud-verificacion.entity';
import { Usuario } from '../../usuarios/entity/usuario.entity';

// Guarda cada decisión administrativa para no perder el historial de revisiones.
@Entity('revision_verificacion')
export class RevisionVerificacion {
  // Identificador de una decisión individual.
  // Permite relacionar la decisión con el envío de documentos correspondiente.
  // Resultado de esa revisión: aprobación o rechazo, entre otros estados.
  // Solo las revisiones rechazadas necesitan explicar el motivo.
  // Momento exacto en que el administrador realizó la revisión.
  // El historial se conserva mientras exista el anunciante.
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

  // Las revisiones históricas no inventan un responsable desconocido.
  @Column({ type: 'int', nullable: true })
  id_administrador: number | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'id_administrador',
    foreignKeyConstraintName: 'FK_revision_administrador',
  })
  administrador: Relation<Usuario | null>;

  @ManyToOne(() => Anunciante, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_anunciante' })
  anunciante: Relation<Anunciante>;
}
