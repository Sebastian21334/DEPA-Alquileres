import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('consulta_cotizacion')
export class ConsultaCotizacion {
  @PrimaryGeneratedColumn() id: number;
  @CreateDateColumn({ type: 'timestamptz' }) realizada_en: Date;
  @Column({ type: 'boolean' }) exitosa: boolean;
  @Column({ type: 'varchar', length: 300, nullable: true }) error:
    string | null;
}
