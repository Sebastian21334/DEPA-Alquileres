import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Respaldo para filas previas a la columna `permite_reservas_por_fecha`.
const PATRON_RESERVA_POR_FECHA = 'tempor|diari';

/**
 * Única regla que decide si una modalidad admite reservas por fecha. La usan
 * calendario, presupuestos y reservas; el front recibe el resultado ya calculado
 * en `admite_reservas_por_fecha`.
 */
export function admiteReservaPorFecha(
  modalidad?: Pick<Modalidad, 'nombre' | 'permite_reservas_por_fecha'> | null,
): boolean {
  if (modalidad?.permite_reservas_por_fecha != null) {
    return modalidad.permite_reservas_por_fecha;
  }
  return new RegExp(PATRON_RESERVA_POR_FECHA, 'i').test(
    modalidad?.nombre ?? '',
  );
}

/** La misma regla expresada en SQL (PostgreSQL) para filtrar consultas por el alias de la modalidad. */
export function sqlAdmiteReservaPorFecha(alias: string): string {
  return `COALESCE(${alias}.permite_reservas_por_fecha, ${alias}.nombre ~* '${PATRON_RESERVA_POR_FECHA}', false)`;
}

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

  // No es columna: se calcula al leer o guardar para que ningún cliente repita la regla.
  admite_reservas_por_fecha: boolean;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  protected calcularAdmiteReservasPorFecha(): void {
    this.admite_reservas_por_fecha = admiteReservaPorFecha(this);
  }
}
