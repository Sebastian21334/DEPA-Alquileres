import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/** Cola privada y transitoria: se elimina cada fila al borrar su archivo. */
@Entity('eliminacion_documento')
export class EliminacionDocumento {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'url', type: 'varchar', length: 500, unique: true })
  url: string;

  @Column({ name: 'intentos', type: 'int', default: 0 })
  intentos: number;

  @Index('IDX_eliminacion_documento_proximo_intento')
  @Column({
    name: 'proximo_intento',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  proximo_intento: Date;
}
