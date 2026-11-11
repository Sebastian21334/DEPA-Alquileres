import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('consulta_cotizacion')
export class ConsultaCotizacion {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @CreateDateColumn({ name: 'realizada_en', type: 'timestamptz' })
  realizada_en: Date;

  @Column({ name: 'exitosa', type: 'boolean' })
  exitosa: boolean;

  @Column({ name: 'error', type: 'varchar', length: 300, nullable: true })
  error: string | null;
}
