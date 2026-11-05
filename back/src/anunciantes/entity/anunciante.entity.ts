import type { Relation } from 'typeorm';
import {
  Entity,
  Column,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Usuario } from '../../usuarios/entity/usuario.entity';
import { TipoAnunciante } from '../../catalogos/entity/tipo-anunciante.entity';

@Entity('anunciante')
export class Anunciante {
  // El anunciante comparte el ID del usuario: es una extensión 1 a 1 de Usuario.
  @PrimaryColumn({ name: 'id_usuario' })
  idUsuario: number;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Relation<Usuario>;

  @Column({ type: 'boolean', default: false })
  // Solo los anunciantes verificados pueden publicar o administrar imágenes.
  verificado: boolean;

  // Único entre las cuentas activas, comparando solo los dígitos (índice
  // uq_anunciante_cuit_cuil_digitos de la migración 20261104). Al dar de baja la
  // cuenta queda en null para que la persona pueda volver a registrarlo (RN-37).
  @Column({ type: 'varchar', length: 15, nullable: true })
  cuit_cuil: string | null;

  // CUIT/CUIL original de una cuenta dada de baja; la sigue identificando en el historial.
  @Column({ type: 'varchar', length: 15, nullable: true })
  cuit_cuil_historico: string | null;

  @Column({ type: 'varchar', length: 20 })
  numero_contacto: string;

  @ManyToOne(() => TipoAnunciante)
  @JoinColumn({ name: 'id_tipo_anunciante' })
  tipoAnunciante: Relation<TipoAnunciante>;

  /** Dígitos del CUIT/CUIL: «20-12345678-9» y «20123456789» son el mismo. */
  static digitosCuit(cuit: string): string {
    return cuit.replace(/\D/g, '');
  }

  /** Habilita a publicar después de aprobar la identidad. */
  verificar(): void {
    this.verificado = true;
  }

  nombreCompleto(): string {
    return this.usuario?.nombreCompleto() ?? '';
  }

  /** Correo vigente de la cuenta; undefined si no tiene (por ejemplo, si se dio de baja). */
  email(): string | undefined {
    return this.usuario?.email ?? undefined;
  }

  /** CUIT/CUIL para mostrar: el vigente o, si la cuenta se dio de baja, el original. */
  cuitParaHistorial(): string | null {
    return this.cuit_cuil ?? this.cuit_cuil_historico ?? null;
  }

  /** Teléfono que el anunciante informó para contacto o, si falta, el de su cuenta. */
  telefonoDeContacto(): string | undefined {
    return this.numero_contacto ?? this.usuario?.telefono;
  }
}
