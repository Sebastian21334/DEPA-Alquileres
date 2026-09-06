import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
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
  rol: Rol;

  @Column({ type: 'boolean', default: false })
  email_verificado: boolean;

  @Column({ type: 'varchar', nullable: true })
  token_verificacion: string | null;

  @Column({ type: 'varchar', nullable: true })
  token_recuperacion: string | null;

  @Column({ type: 'timestamp', nullable: true })
  token_recuperacion_expira: Date | null;

}