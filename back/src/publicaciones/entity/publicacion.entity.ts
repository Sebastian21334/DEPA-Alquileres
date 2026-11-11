import type { Relation } from 'typeorm';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import { Provincia } from '../../ubicacion/entity/provincia.entity';
import { Ciudad } from '../../ubicacion/entity/ciudad.entity';
import { TipoPropiedad } from '../../catalogos/entity/tipo-propiedad.entity';
import { Modalidad } from '../../catalogos/entity/modalidad.entity';
import { TipoMoneda } from '../../catalogos/entity/tipo-moneda.entity';
import { Imagen } from '../../imagenes/entity/imagen.entity';

@Entity('publicacion')
export class Publicacion {
  // Una publicación es la unidad principal que se ofrece para alquiler.
  @PrimaryGeneratedColumn({ name: 'id_publicacion' })
  id: number;

  @Column({ name: 'titulo', type: 'varchar', length: 255 })
  titulo: string;

  @Column({ name: 'descripcion', type: 'varchar', length: 255 })
  descripcion: string;

  @Column({ name: 'fecha_publicacion', type: 'date' })
  fecha_publicacion: Date;

  @Column({ name: 'precio', type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ name: 'activa', type: 'boolean', default: false })
  activa: boolean;

  // Conserva las relaciones de las reservas existentes.
  @Column({ name: 'eliminada', type: 'boolean', default: false })
  eliminada: boolean;

  @Column({
    name: 'motivo_baja_admin',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  motivo_baja_admin: string | null;

  @Column({ name: 'visualizaciones', type: 'int', default: 0 })
  visualizaciones: number;

  // Datos propios del inmueble, consolidados para consultarlos desde el anuncio.
  @Column({ name: 'direccion', type: 'varchar', length: 255 })
  direccion: string;

  // Coordenadas confirmadas por el anunciante. Son nullable para conservar
  // publicaciones creadas antes de incorporar el selector de mapa.
  @Column({
    name: 'latitud',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  latitud: number | null;

  @Column({
    name: 'longitud',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  longitud: number | null;

  @Column({ name: 'cantidad_ambientes', type: 'int' })
  cantidad_ambientes: number;

  @Column({ name: 'superficie', type: 'decimal', precision: 10, scale: 2 })
  superficie: number;

  // Catálogos y ubicación se guardan como FK para evitar repetir sus nombres.
  @ManyToOne(() => TipoMoneda)
  @JoinColumn({ name: 'id_tipo_moneda' })
  tipoMoneda: Relation<TipoMoneda>;

  @ManyToOne(() => Modalidad)
  @JoinColumn({ name: 'id_modalidad' })
  modalidad: Relation<Modalidad>;

  @ManyToOne(() => Anunciante, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_anunciante' })
  anunciante: Relation<Anunciante>;

  @ManyToOne(() => Provincia)
  @JoinColumn({ name: 'id_provincia' })
  provincia: Relation<Provincia>;

  @ManyToOne(() => Ciudad)
  @JoinColumn({ name: 'id_ciudad' })
  ciudad: Relation<Ciudad>;

  @ManyToOne(() => TipoPropiedad)
  @JoinColumn({ name: 'id_tipo_propiedad' })
  tipoPropiedad: Relation<TipoPropiedad>;

  @OneToMany(() => Imagen, (imagen) => imagen.publicacion)
  imagenes: Relation<Imagen[]>;

}
