// tipo-moneda.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipo_moneda')
export class TipoMoneda {
  @PrimaryGeneratedColumn({ name: 'id_tipo_moneda' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'descripcion', type: 'varchar', length: 255, nullable: true })
  descripcion: string;
}