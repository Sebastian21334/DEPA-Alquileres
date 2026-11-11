import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('ambito')
export class Ambito {
  @PrimaryColumn({ name: 'codigo', type: 'varchar', length: 40 })
  codigo: string;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;
}
