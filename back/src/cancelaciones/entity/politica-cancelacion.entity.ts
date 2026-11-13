import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('politica_cancelacion')
export class PoliticaCancelacion {
  @PrimaryColumn({ name: 'vigente_desde', type: 'date' })
  vigenteDesde: string;

  @Column({ name: 'dias_devolucion_total', type: 'integer' })
  diasDevolucionTotal: number;

  @Column({ name: 'dias_devolucion_parcial', type: 'integer' })
  diasDevolucionParcial: number;

  @Column({ name: 'porcentaje_total', type: 'integer' })
  porcentajeTotal: number;

  @Column({ name: 'porcentaje_parcial', type: 'integer' })
  porcentajeParcial: number;

  @Column({ name: 'porcentaje_fuera_de_plazo', type: 'integer' })
  porcentajeFueraDePlazo: number;

  @Column({ name: 'porcentaje_otros_actores', type: 'integer' })
  porcentajeOtrosActores: number;
}
