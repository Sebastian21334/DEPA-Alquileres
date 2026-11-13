import type { Relation } from 'typeorm';
import { Estado } from '../../catalogos/entity/estado.entity';
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

// Representa la solicitud vigente de identidad de un anunciante.
@Entity('solicitud_verificacion')
@Check('ck_solicitud_verificacion_estado_ambito', `"ambito_estado" = '${"VERIFICACION_ANUNCIANTE"}'`)
@ForeignKey(() => Estado, ['ambitoEstado', 'estado'], ['codigoAmbito', 'codigo'], {
  name: 'fk_solicitud_verificacion_estado',
  onDelete: 'RESTRICT',
})
export class SolicitudVerificacion {
  // Identificador independiente de la solicitud, distinto del usuario y del anunciante.
  @PrimaryGeneratedColumn({ name: 'id_solicitud_verificacion' })
  id: number;

  // Estado que determina qué acción puede realizar cada actor del sistema.
  // URLs de los archivos privados almacenados en Azure Blob Storage.
  // Motivo que el administrador debe informar cuando rechaza la documentación.
  // Aumenta cada vez que el anunciante vuelve a enviar documentos.
  // Fechas de auditoría para ordenar solicitudes y conocer su última modificación.
  // Si se elimina el anunciante, su solicitud deja de tener sentido y se elimina en cascada.
  @Column({ name: 'estado', type: 'varchar', length: 40, default: 'borrador' })
  estado: string;

  @Column({
    name: 'ambito_estado',
    type: 'varchar',
    length: 40,
    select: false,
    insert: false,
    update: false,
  })
  readonly ambitoEstado: "VERIFICACION_ANUNCIANTE";

  @Column({
    name: 'dni_frente_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  dni_frente_url: string | null;

  @Column({
    name: 'dni_dorso_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  dni_dorso_url: string | null;

  @Column({ name: 'rostro_url', type: 'varchar', length: 500, nullable: true })
  rostro_url: string | null;

  @Column({
    name: 'motivo_rechazo',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  motivo_rechazo: string | null;

  @Column({ name: 'numero_revision', type: 'int', default: 1 })
  numero_revision: number;

  @Column({
    name: 'prueba_vida_desafio',
    type: 'uuid',
    nullable: true,
    select: false,
  })
  prueba_vida_desafio: string | null;

  @Column({
    name: 'prueba_vida_revision',
    type: 'int',
    nullable: true,
    select: false,
  })
  prueba_vida_revision: number | null;

  @Column({
    name: 'prueba_vida_rostro_hash',
    type: 'varchar',
    length: 64,
    nullable: true,
    select: false,
  })
  prueba_vida_rostro_hash: string | null;

  @Column({
    name: 'prueba_vida_validada_en',
    type: 'timestamptz',
    nullable: true,
  })
  prueba_vida_validada_en: Date | null;

  @Column({
    name: 'prueba_vida_vence_en',
    type: 'timestamptz',
    nullable: true,
    select: false,
  })
  prueba_vida_vence_en: Date | null;

  @Column({
    name: 'prueba_vida_consumida_en',
    type: 'timestamptz',
    nullable: true,
    select: false,
  })
  prueba_vida_consumida_en: Date | null;

  @Column({
    name: 'creada_en',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  creada_en: Date;

  @Column({
    name: 'actualizada_en',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  actualizada_en: Date;

  @ManyToOne(() => Anunciante, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_anunciante' })
  anunciante: Relation<Anunciante>;

  @Column({
    name: 'razon_social',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  razon_social: string | null;

  @Column({
    name: 'matricula_profesional',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  matricula_profesional: string | null;

  @Column({
    name: 'colegio_profesional',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  colegio_profesional: string | null;

  @Column({
    name: 'domicilio_comercial',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  domicilio_comercial: string | null;

  @Column({ name: 'dni_corredor', type: 'varchar', length: 15, nullable: true })
  dni_corredor: string | null;

  @Column({
    name: 'matricula_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  matricula_url: string | null;

  @Column({
    name: 'constancia_cuit_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  constancia_cuit_url: string | null;

}
