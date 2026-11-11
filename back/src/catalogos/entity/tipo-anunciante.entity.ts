import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipo_anunciante')
export class TipoAnunciante {
  @PrimaryGeneratedColumn({ name: 'id_tipo_anunciante' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'descripcion', type: 'varchar', length: 250, nullable: true })
  descripcion: string;

}
