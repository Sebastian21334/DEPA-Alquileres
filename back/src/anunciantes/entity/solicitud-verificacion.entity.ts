import type { Relation } from 'typeorm';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Anunciante } from './anunciante.entity';

export enum EstadoVerificacion {
  // El usuario guardó sus datos, pero todavía no superó la verificación facial.
  BORRADOR = 'borrador',
  // La documentación todavía no fue enviada o está lista para revisión.
  PENDIENTE = 'pendiente',
  // Un administrador aprobó los documentos y habilitó al anunciante.
  APROBADA = 'aprobada',
  // Un administrador rechazó la documentación e indicó el motivo.
  RECHAZADA = 'rechazada',
  // El anunciante corrigió la documentación y la volvió a enviar.
  REENVIADA = 'reenviada',
}

// Representa la solicitud vigente de identidad de un anunciante.
@Entity('solicitud_verificacion')
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
  @Column({
    type: 'enum',
    enum: EstadoVerificacion,
    default: EstadoVerificacion.BORRADOR,
  })
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
  anunciante: Relation<Anunciante>;

  estaAprobada(): boolean {
    return this.estado === EstadoVerificacion.APROBADA;
  }

  estaRechazada(): boolean {
    return this.estado === EstadoVerificacion.RECHAZADA;
  }

  /** Esperando la decisión de un administrador (primera vez o reenvío). */
  estaPendienteDeRevision(): boolean {
    return [
      EstadoVerificacion.PENDIENTE,
      EstadoVerificacion.REENVIADA,
    ].includes(this.estado);
  }

  tieneDocumentacionCompleta(): boolean {
    return !!(this.dni_frente_url && this.dni_dorso_url && this.rostro_url);
  }

  /**
   * Adjunta los documentos ya verificados y la deja lista para revisión. Un
   * reenvío representa una nueva revisión independiente en el historial.
   */
  presentarDocumentos(
    urls: { dniFrente: string; dniDorso: string; rostro: string },
    reenvio: boolean,
  ): void {
    this.dni_frente_url = urls.dniFrente;
    this.dni_dorso_url = urls.dniDorso;
    this.rostro_url = urls.rostro;
    if (reenvio) this.numero_revision += 1;
    this.estado = reenvio
      ? EstadoVerificacion.REENVIADA
      : EstadoVerificacion.PENDIENTE;
    this.motivo_rechazo = null;
    this.actualizada_en = new Date();
  }

  aprobar(): void {
    this.estado = EstadoVerificacion.APROBADA;
    this.motivo_rechazo = null;
    this.actualizada_en = new Date();
  }

  /** Conserva la solicitud con el motivo para que el anunciante pueda corregirla. */
  rechazar(motivo: string): void {
    this.estado = EstadoVerificacion.RECHAZADA;
    this.motivo_rechazo = motivo.trim();
    this.actualizada_en = new Date();
  }

  nombreSolicitante(): string {
    return this.anunciante?.nombreCompleto() ?? '';
  }

  emailSolicitante(): string | undefined {
    return this.anunciante?.email();
  }
}
