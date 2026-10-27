import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** Registros inmutables: una actualización agrega otra fila, nunca cambia reservas previas. */
@Entity('cotizacion_dolar')
export class CotizacionDolar {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'numeric', precision: 18, scale: 6 }) compra: string;
  @Column({ type: 'numeric', precision: 18, scale: 6 }) venta: string;
  @Column({ type: 'varchar', length: 20 }) tipo: string;
  @Column({ type: 'varchar', length: 60 }) proveedor: string;
  @Column({ type: 'timestamptz' }) actualizada_fuente_en: Date;
  @CreateDateColumn({ type: 'timestamptz' }) consultada_en: Date;
}
