import type { Relation } from 'typeorm';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Rol } from '../../catalogos/entity/rol.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  apellido: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  telefono: string;

  @Column({ select: false })
  contrasenia: string;

  @Column({ type: 'boolean', default: false })
  bloqueado: boolean;

  // Relación directa: Muchos usuarios pueden tener un mismo rol
  @ManyToOne(() => Rol, (rol) => rol.usuarios)
  @JoinColumn({ name: 'id_rol' })
  rol: Relation<Rol>;

  @Column({ type: 'boolean', default: false })
  email_verificado: boolean;

  // Foto de perfil pública (contenedor de imágenes de Azure). Null = se muestra la inicial.
  @Column({ type: 'varchar', length: 500, nullable: true })
  foto_url: string | null;

  // select:false (igual que contrasenia): son credenciales de un solo uso y no
  // deben viajar en ninguna respuesta que solo pidió el usuario "normal", por
  // ejemplo el join publico anunciante.usuario en GET /publicaciones.
  @Column({ type: 'varchar', nullable: true, select: false })
  token_verificacion: string | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  token_recuperacion: string | null;

  @Column({ type: 'timestamp', nullable: true, select: false })
  token_recuperacion_expira: Date | null;

  /** Nombre y apellido para mostrar; vacío si la cuenta no los tiene. */
  nombreCompleto(): string {
    return [this.nombre, this.apellido].filter(Boolean).join(' ');
  }

  /** Aplica solo los datos informados. El email ya llega normalizado y validado como único. */
  actualizarDatosPersonales(datos: {
    email?: string;
    nombre?: string;
    apellido?: string;
    telefono?: string;
  }): void {
    if (datos.email !== undefined) this.email = datos.email;
    if (datos.nombre !== undefined) this.nombre = datos.nombre.trim();
    if (datos.apellido !== undefined) this.apellido = datos.apellido.trim();
    if (datos.telefono !== undefined) this.telefono = datos.telefono.trim();
  }

  cambiarBloqueo(bloqueado: boolean): void {
    this.bloqueado = bloqueado;
  }

  /** Reemplaza la foto de perfil y devuelve la anterior para poder borrarla. */
  cambiarFoto(url: string | null): string | null {
    const anterior = this.foto_url;
    this.foto_url = url;
    return anterior;
  }

  tieneRol(rol: Rol): boolean {
    return this.rol?.id === rol.id;
  }

  asignarRol(rol: Rol): void {
    this.rol = rol;
  }

  /** Deja la cuenta pendiente de confirmar el correo con el token enviado. */
  iniciarVerificacionEmail(token: string): void {
    this.token_verificacion = token;
    this.email_verificado = false;
  }

  /** Confirma el correo y consume el token (uso único). */
  confirmarEmail(): void {
    this.email_verificado = true;
    this.token_verificacion = null;
  }

  iniciarRecuperacion(token: string, expira: Date): void {
    this.token_recuperacion = token;
    this.token_recuperacion_expira = expira;
  }

  recuperacionVigente(ahora = new Date()): boolean {
    return (
      !!this.token_recuperacion_expira &&
      this.token_recuperacion_expira >= ahora
    );
  }

  /** Guarda la nueva contraseña ya hasheada y consume el token de recuperación. */
  cambiarContrasenia(hash: string): void {
    this.contrasenia = hash;
    this.token_recuperacion = null;
    this.token_recuperacion_expira = null;
  }
}
