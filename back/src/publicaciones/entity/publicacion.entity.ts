import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
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

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'varchar', length: 255 })
  descripcion: string;

  @Column({ type: 'date' })
  fecha_publicacion: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ type: 'boolean', default: false })
  activa: boolean;

  // Datos propios del inmueble, consolidados para consultarlos desde el anuncio.
  @Column({ type: 'varchar', length: 255 })
  direccion: string;

  @Column({ type: 'int' })
  cantidad_ambientes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  superficie: number;

  // Catálogos y ubicación se guardan como FK para evitar repetir sus nombres.
  @ManyToOne(() => TipoMoneda)
  @JoinColumn({ name: 'id_tipo_moneda' })
  tipoMoneda: TipoMoneda;

  @ManyToOne(() => Modalidad)
  @JoinColumn({ name: 'id_modalidad' })
  modalidad: Modalidad;

  @ManyToOne(() => Anunciante)
  @JoinColumn({ name: 'id_anunciante' })
  anunciante: Anunciante;

  @ManyToOne(() => Provincia)
  @JoinColumn({ name: 'id_provincia' })
  provincia: Provincia;

  @ManyToOne(() => Ciudad)
  @JoinColumn({ name: 'id_ciudad' })
  ciudad: Ciudad;

  @ManyToOne(() => TipoPropiedad)
  @JoinColumn({ name: 'id_tipo_propiedad' })
  tipoPropiedad: TipoPropiedad;

  @OneToMany(() => Imagen, (imagen) => imagen.publicacion)
  imagenes: Imagen[]
}