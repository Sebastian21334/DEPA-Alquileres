import type { Relation } from 'typeorm';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';

export enum EstadoVerificacion {
  // El usuario guardó sus datos, pero todavía no presentó la prueba de vida.
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
  static readonly CAMPOS_PRUEBA_PRIVADOS = [
    'prueba_vida_desafio',
    'prueba_vida_revision',
    'prueba_vida_rostro_hash',
    'prueba_vida_vence_en',
    'prueba_vida_consumida_en',
  ];

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

  @Column({ type: 'uuid', nullable: true, select: false })
  prueba_vida_desafio: string | null;

  @Column({ type: 'int', nullable: true, select: false })
  prueba_vida_revision: number | null;

  @Column({ type: 'varchar', length: 64, nullable: true, select: false })
  prueba_vida_rostro_hash: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  prueba_vida_validada_en: Date | null;

  @Column({ type: 'timestamptz', nullable: true, select: false })
  prueba_vida_vence_en: Date | null;

  @Column({ type: 'timestamptz', nullable: true, select: false })
  prueba_vida_consumida_en: Date | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creada_en: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  actualizada_en: Date;

  @ManyToOne(() => Anunciante, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_anunciante' })
  anunciante: Relation<Anunciante>;

  @Column({ type: 'varchar', length: 150, nullable: true })
  razon_social: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  matricula_profesional: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  colegio_profesional: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  domicilio_comercial: string | null;

  @Column({ type: 'varchar', length: 15, nullable: true })
  dni_corredor: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  matricula_url: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  constancia_cuit_url: string | null;

  tieneDatosInmobiliaria(): boolean {
    return !!(
      this.razon_social?.trim() &&
      this.matricula_profesional?.trim() &&
      this.colegio_profesional?.trim() &&
      this.domicilio_comercial?.trim() &&
      this.dni_corredor?.trim()
    );
  }

  tieneDocumentacionInmobiliaria(): boolean {
    return (
      this.tieneDatosInmobiliaria() &&
      !!this.matricula_url &&
      !!this.constancia_cuit_url
    );
  }

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

  puedeRecibirDocumentos(reenvio: boolean): boolean {
    return reenvio
      ? this.estaRechazada()
      : this.estado === EstadoVerificacion.BORRADOR;
  }

  revisionParaPresentacion(): number {
    return this.numero_revision + (this.estaRechazada() ? 1 : 0);
  }

  iniciarPruebaVida(desafio: string): void {
    this.prueba_vida_desafio = desafio;
    this.prueba_vida_revision = this.revisionParaPresentacion();
    this.prueba_vida_rostro_hash = null;
    this.prueba_vida_validada_en = null;
    this.prueba_vida_vence_en = null;
    this.prueba_vida_consumida_en = null;
  }

  desafioPruebaVidaVigente(desafio: string, revision: number): boolean {
    return (
      (this.estado === EstadoVerificacion.BORRADOR || this.estaRechazada()) &&
      this.prueba_vida_desafio === desafio &&
      this.prueba_vida_revision === revision &&
      this.revisionParaPresentacion() === revision &&
      !this.prueba_vida_validada_en &&
      !this.prueba_vida_consumida_en
    );
  }

  validarPruebaVida(hash: string, ahora = new Date()): void {
    this.prueba_vida_rostro_hash = hash;
    this.prueba_vida_validada_en = ahora;
    this.prueba_vida_vence_en = new Date(ahora.getTime() + 5 * 60 * 1000);
  }

  autorizacionPruebaVidaVigente(
    desafio: string,
    revision: number,
    hash: string,
    ahora = new Date(),
  ): boolean {
    return (
      this.prueba_vida_desafio === desafio &&
      this.prueba_vida_revision === revision &&
      this.revisionParaPresentacion() === revision &&
      this.prueba_vida_rostro_hash === hash &&
      !!this.prueba_vida_validada_en &&
      !!this.prueba_vida_vence_en &&
      this.prueba_vida_vence_en > ahora &&
      !this.prueba_vida_consumida_en
    );
  }

  tienePruebaVidaPresentada(): boolean {
    return (
      !!this.prueba_vida_validada_en &&
      !!this.prueba_vida_consumida_en &&
      this.prueba_vida_revision === this.numero_revision
    );
  }

  toJSON(): object {
    return Object.fromEntries(
      Object.entries(this).filter(
        ([campo]) =>
          !SolicitudVerificacion.CAMPOS_PRUEBA_PRIVADOS.includes(campo),
      ),
    );
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
