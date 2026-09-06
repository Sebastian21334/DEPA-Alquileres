import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Usuario } from '../../usuarios/entity/usuario.entity';

@Entity('rol')
export class Rol {
  // Los roles se almacenan como catálogo para autorizar endpoints administrativos.
  @PrimaryGeneratedColumn({ name: 'id_rol' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  descripcion: string;

  // Relación inversa: Un rol puede estar asignado a muchos usuarios
  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios: Usuario[];
}