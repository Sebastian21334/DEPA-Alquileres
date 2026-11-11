import type { Relation } from 'typeorm';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Ambito } from './ambito.entity';

@Entity('estado')
@Unique('uq_estado_ambito_codigo', ['codigoAmbito', 'codigo'])
export class Estado {
  @PrimaryGeneratedColumn('identity', { name: 'id_estado', type: 'integer' })
  id: number;

  @Column({ name: 'codigo_ambito', type: 'varchar', length: 40 })
  codigoAmbito: string;

  @ManyToOne(() => Ambito, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'codigo_ambito', foreignKeyConstraintName: 'fk_estado_ambito' })
  ambito: Relation<Ambito>;

  @Column({ name: 'codigo', type: 'varchar', length: 40 })
  codigo: string;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;
}
