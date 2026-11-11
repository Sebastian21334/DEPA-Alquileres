import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** Registros inmutables: una actualización agrega otra fila, nunca cambia reservas previas. */
@Entity('cotizacion_dolar')
export class CotizacionDolar {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'compra', type: 'numeric', precision: 18, scale: 6 })
  compra: string;

  @Column({ name: 'venta', type: 'numeric', precision: 18, scale: 6 })
  venta: string;

  @Column({ name: 'tipo', type: 'varchar', length: 20 })
  tipo: string;

  @Column({ name: 'proveedor', type: 'varchar', length: 60 })
  proveedor: string;

  @Column({ name: 'actualizada_fuente_en', type: 'timestamptz' })
  actualizada_fuente_en: Date;

  @CreateDateColumn({ name: 'consultada_en', type: 'timestamptz' })
  consultada_en: Date;
}
