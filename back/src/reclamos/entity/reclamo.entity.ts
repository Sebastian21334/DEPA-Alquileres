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
import { Reserva } from '../../reservas/entity/reserva.entity';
import { Usuario } from '../../usuarios/entity/usuario.entity';
import { ReclamoEvidencia } from './reclamo-evidencia.entity';
import { ReclamoMensaje } from './reclamo-mensaje.entity';

export enum EstadoReclamo {
  ABIERTO = 'ABIERTO',
  EN_REVISION = 'EN_REVISION',
  RESUELTO_INQUILINO = 'RESUELTO_INQUILINO',
  RESUELTO_ANUNCIANTE = 'RESUELTO_ANUNCIANTE',
  CERRADO = 'CERRADO',
}

export enum CategoriaReclamo {
  LIMPIEZA = 'LIMPIEZA',
  MANTENIMIENTO = 'MANTENIMIENTO',
  INGRESO = 'INGRESO',
  DESCRIPCION = 'DESCRIPCION',
  OTRO = 'OTRO',
}

export enum ResolucionReclamo {
  SIN_DEVOLUCION = 'SIN_DEVOLUCION',
  DEVOLUCION_TOTAL = 'DEVOLUCION_TOTAL',
  DEVOLUCION_PARCIAL = 'DEVOLUCION_PARCIAL',
}

@Entity('reclamo_reserva')
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
    type: 'enum',
    enum: CategoriaReclamo,
    enumName: 'reclamo_categoria_enum',
  })
  categoria: CategoriaReclamo;

  @Column({ type: 'varchar', length: 1000 })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: EstadoReclamo,
    enumName: 'reclamo_estado_enum',
    default: EstadoReclamo.ABIERTO,
  })
  estado: EstadoReclamo;

  @Column({
    type: 'enum',
    enum: ResolucionReclamo,
    enumName: 'reclamo_resolucion_enum',
    nullable: true,
  })
  resolucion: ResolucionReclamo | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  importe_reembolso: number | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_administrador_resolucion' })
  administrador_resolucion: Relation<Usuario | null>;

  @OneToMany(() => ReclamoEvidencia, (evidencia) => evidencia.reclamo)
  evidencias: Relation<ReclamoEvidencia[]>;

  @OneToMany(() => ReclamoMensaje, (mensaje) => mensaje.reclamo)
  mensajes: Relation<ReclamoMensaje[]>;

  @CreateDateColumn({ type: 'timestamp' })
  creado_en: Date;

  @Column({ type: 'timestamp', nullable: true })
  resuelto_en: Date | null;
}
