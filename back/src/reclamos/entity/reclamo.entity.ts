import { codigosCatalogo } from '../../catalogos/codigos-catalogo';
import type { Relation } from 'typeorm';
import { Estado } from '../../catalogos/entity/estado.entity';
import {
  Check,
  Column,
  ForeignKey,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reserva } from '../../reservas/entity/reserva.entity';
import { Usuario } from '../../usuarios/entity/usuario.entity';
import { ReclamoEvidencia } from './reclamo-evidencia.entity';
import { ReclamoMensaje } from './reclamo-mensaje.entity';

export const CategoriaReclamo = codigosCatalogo('RECLAMO_CATEGORIA');
export type CategoriaReclamo = keyof typeof CategoriaReclamo;

export const ResolucionReclamo = codigosCatalogo('RECLAMO_RESOLUCION');
export type ResolucionReclamo = keyof typeof ResolucionReclamo;

@Entity('reclamo_reserva')
@Check('ck_reclamo_reserva_estado_ambito', `"ambito_estado" = '${"RECLAMO"}'`)
@ForeignKey(() => Estado, ['ambitoEstado', 'estado'], ['codigoAmbito', 'codigo'], {
  name: 'fk_reclamo_reserva_estado',
  onDelete: 'RESTRICT',
})
export class Reclamo {
  @PrimaryGeneratedColumn({ name: 'id_reclamo' })
  id: number;

  @ManyToOne(() => Reserva, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'id_reserva',
    foreignKeyConstraintName: 'FK_reclamo_reserva',
  })
  reserva: Relation<Reserva>;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_inquilino' })
  inquilino: Relation<Usuario>;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_anunciante' })
  anunciante: Relation<Usuario | null>;

  @Column({
    name: 'categoria',
    type: 'varchar', length: 40,
  })
  categoria: CategoriaReclamo;

  @Column({ name: 'descripcion', type: 'varchar', length: 1000 })
  descripcion: string;

  @Column({ name: 'estado', type: 'varchar', length: 40, default: 'ABIERTO' })
  estado: string;

  @Column({
    name: 'ambito_estado',
    type: 'varchar',
    length: 40,
    select: false,
    insert: false,
    update: false,
  })
  readonly ambitoEstado: "RECLAMO";

  @Column({
    name: 'resolucion',
    type: 'varchar', length: 40,
    nullable: true,
  })
  resolucion: ResolucionReclamo | null;

  @Column({
    name: 'importe_reembolso',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  importe_reembolso: number | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_administrador_resolucion' })
  administrador_resolucion: Relation<Usuario | null>;

  @OneToMany(() => ReclamoEvidencia, (evidencia) => evidencia.reclamo)
  evidencias: Relation<ReclamoEvidencia[]>;

  @OneToMany(() => ReclamoMensaje, (mensaje) => mensaje.reclamo)
  mensajes: Relation<ReclamoMensaje[]>;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creado_en: Date;

  @Column({ name: 'resuelto_en', type: 'timestamp', nullable: true })
  resuelto_en: Date | null;
}
