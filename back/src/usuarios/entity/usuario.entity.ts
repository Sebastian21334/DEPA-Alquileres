import type { Relation } from 'typeorm';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Rol } from '../../catalogos/entity/rol.entity';

export interface DetalleBloqueo {
  id: string;
  motivo: string | null;
  administradorId: number | null;
  fecha: string | null;
  apelacion?: { texto: string; fecha: string };
  respuesta?: { texto: string; fecha: string; administradorId: number };
}

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'apellido', type: 'varchar', length: 100 })
  apellido: string;

  // Único entre las cuentas que lo tienen. Al dar de baja la cuenta queda en
  // null para que la persona pueda registrarse de nuevo con el mismo correo (RN-37).
  @Column({
    name: 'email',
    type: 'varchar',
    length: 150,
    unique: true,
    nullable: true,
  })
  email: string | null;

  // Correo que tenía la cuenta al darse de baja; identifica a la persona en el historial.
  @Column({
    name: 'email_historico',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  email_historico: string | null;

  @Column({ name: 'telefono', type: 'varchar', length: 20 })
  telefono: string;

  @Column({ name: 'contrasenia', select: false })
  contrasenia: string;

  @Column({ name: 'bloqueado', type: 'boolean', default: false })
  bloqueado: boolean;

  @Column({ name: 'bloqueo_detalle', type: 'jsonb', nullable: true, select: false })
  bloqueoDetalle?: DetalleBloqueo | null;

  // Baja lógica: la cuenta se conserva, pero no puede iniciar sesión.
  @Column({ name: 'activa', type: 'boolean', default: true })
  activa: boolean;

  @Column({ name: 'fecha_baja', type: 'timestamptz', nullable: true })
  fecha_baja: Date | null;

  // Relación directa: Muchos usuarios pueden tener un mismo rol
  @ManyToOne(() => Rol, (rol) => rol.usuarios)
  @JoinColumn({ name: 'id_rol' })
  rol: Relation<Rol>;

  @Column({ name: 'email_verificado', type: 'boolean', default: false })
  email_verificado: boolean;

  // Foto de perfil pública (contenedor de imágenes de Azure). Null = se muestra la inicial.
  @Column({ name: 'foto_url', type: 'varchar', length: 500, nullable: true })
  foto_url: string | null;

  // select:false (igual que contrasenia): son credenciales de un solo uso y no
  // deben viajar en ninguna respuesta que solo pidió el usuario "normal", por
  // ejemplo el join publico anunciante.usuario en GET /publicaciones.
  @Column({
    name: 'token_verificacion',
    type: 'varchar',
    nullable: true,
    select: false,
  })
  token_verificacion: string | null;

  @Column({
    name: 'token_recuperacion',
    type: 'varchar',
    nullable: true,
    select: false,
  })
  token_recuperacion: string | null;

  @Column({
    name: 'token_recuperacion_expira',
    type: 'timestamp',
    nullable: true,
    select: false,
  })
  token_recuperacion_expira: Date | null;

}
