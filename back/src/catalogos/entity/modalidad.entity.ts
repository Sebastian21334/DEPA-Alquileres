import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('modalidad')
export class Modalidad {
  @PrimaryGeneratedColumn({ name: 'id_modalidad' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string;

  // Regla de negocio explícita: evita decidir por el texto visible del catálogo.
  // Nullable conserva la compatibilidad con filas previas hasta que un admin las
  // configure; las nuevas modalidades deben informar este valor.
  @Column({ type: 'boolean', nullable: true })
  permite_reservas_por_fecha: boolean | null;
}
