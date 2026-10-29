import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipo_anunciante')
export class TipoAnunciante {
  @PrimaryGeneratedColumn({ name: 'id_tipo_anunciante' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  descripcion: string;

  esInmobiliaria(): boolean {
    return /inmobiliaria|institucional/i.test(this.nombre);
  }
}