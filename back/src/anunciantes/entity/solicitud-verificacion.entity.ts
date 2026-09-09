import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Anunciante } from './anunciante.entity';

export enum EstadoVerificacion {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
  REENVIADA = 'reenviada',
}

@Entity('solicitud_verificacion')
export class SolicitudVerificacion {
  @PrimaryGeneratedColumn({ name: 'id_solicitud_verificacion' })
  id: number;

  @Column({ type: 'enum', enum: EstadoVerificacion, default: EstadoVerificacion.PENDIENTE })
  estado: EstadoVerificacion;

  @Column({ type: 'varchar', length: 500, nullable: true })
  dni_frente_url: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  dni_dorso_url: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  rostro_url: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  motivo_rechazo: string | null;

  @Column({ type: 'int', default: 1 })
  numero_revision: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creada_en: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  actualizada_en: Date;

  @ManyToOne(() => Anunciante, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_anunciante' })
  anunciante: Anunciante;
}