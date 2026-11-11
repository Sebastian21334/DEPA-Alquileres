import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Respaldo para filas previas a la columna `permite_reservas_por_fecha`.
export const PATRON_RESERVA_POR_FECHA = 'tempor|diari';

@Entity('modalidad')
export class Modalidad {
  @PrimaryGeneratedColumn({ name: 'id_modalidad' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'descripcion', type: 'varchar', length: 255, nullable: true })
  descripcion: string;

  // Regla de negocio explícita: evita decidir por el texto visible del catálogo.
  // Nullable conserva la compatibilidad con filas previas hasta que un admin las
  // configure; las nuevas modalidades deben informar este valor.
  @Column({
    name: 'permite_reservas_por_fecha',
    type: 'boolean',
    nullable: true,
  })
  permite_reservas_por_fecha: boolean | null;
}
