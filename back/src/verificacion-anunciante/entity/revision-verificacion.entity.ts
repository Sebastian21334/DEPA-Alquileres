import type { Relation } from 'typeorm';
import {
  Entity,
  PrimaryGeneratedColumn,
  Check,
  Column,
  ForeignKey,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import { Estado } from '../../catalogos/entity/estado.entity';
import { AmbitoEstado, EstadoVerificacion } from '../../catalogos/estados';
import { Usuario } from '../../usuarios/entity/usuario.entity';

// Guarda cada decisión administrativa para no perder el historial de revisiones.
@Entity('revision_verificacion')
@Check('ck_revision_verificacion_estado_ambito', `"ambito_estado" = '${AmbitoEstado.VERIFICACION_ANUNCIANTE}'`)
@ForeignKey(() => Estado, ['ambitoEstado', 'estado'], ['codigoAmbito', 'codigo'], {
  name: 'fk_revision_verificacion_estado',
  onDelete: 'RESTRICT',
})
export class RevisionVerificacion {
  // Identificador de una decisión individual.
  // Permite relacionar la decisión con el envío de documentos correspondiente.
  // Resultado de esa revisión: aprobación o rechazo, entre otros estados.
  // Solo las revisiones rechazadas necesitan explicar el motivo.
  // Momento exacto en que el administrador realizó la revisión.
  // El historial se conserva mientras exista el anunciante.
  @PrimaryGeneratedColumn({ name: 'id_revision_verificacion' })
  id: number;

  @Column({ name: 'numero_revision', type: 'int' })
  numero_revision: number;

  @Column({ name: 'estado', type: 'varchar', length: 40 })
  estado: EstadoVerificacion;

  @Column({
    name: 'ambito_estado',
    type: 'varchar',
    length: 40,
    select: false,
    insert: false,
    update: false,
  })
  readonly ambitoEstado: typeof AmbitoEstado.VERIFICACION_ANUNCIANTE;

  @Column({ name: 'motivo', type: 'varchar', length: 500, nullable: true })
  motivo: string | null;

  @Column({
    name: 'creada_en',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  creada_en: Date;

  // Las revisiones históricas no inventan un responsable desconocido.
  @Column({ name: 'id_administrador', type: 'int', nullable: true })
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
