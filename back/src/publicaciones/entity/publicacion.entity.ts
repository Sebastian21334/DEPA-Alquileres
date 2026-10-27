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

/** Datos que el anunciante puede modificar; los `undefined` se ignoran. */
export type CambiosPublicacion = Partial<
  Pick<
    Publicacion,
    | 'titulo'
    | 'descripcion'
    | 'precio'
    | 'direccion'
    | 'latitud'
    | 'longitud'
    | 'cantidad_ambientes'
    | 'superficie'
    | 'activa'
    | 'tipoMoneda'
    | 'modalidad'
    | 'tipoPropiedad'
    | 'provincia'
    | 'ciudad'
  >
>;

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

  @Column({ type: 'varchar', length: 500, nullable: true })
  motivo_baja_admin: string | null;

  @Column({ type: 'int', default: 0 })
  visualizaciones: number;

  // Datos propios del inmueble, consolidados para consultarlos desde el anuncio.
  @Column({ type: 'varchar', length: 255 })
  direccion: string;

  // Coordenadas confirmadas por el anunciante. Son nullable para conservar
  // publicaciones creadas antes de incorporar el selector de mapa.
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitud: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitud: number | null;

  @Column({ type: 'int' })
  cantidad_ambientes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
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

  /** Única regla de propiedad: el anunciante comparte el ID de su usuario. */
  perteneceA(idUsuario: number): boolean {
    return this.anunciante?.idUsuario === idUsuario;
  }

  emailDelAnunciante(): string | undefined {
    return this.anunciante?.email();
  }

  nombreDelAnunciante(): string {
    return this.anunciante?.nombreCompleto() ?? '';
  }

  telefonoDelAnunciante(): string | undefined {
    return this.anunciante?.telefonoDeContacto();
  }

  direccionCompleta(): string {
    return [this.direccion, this.ciudad?.nombre, this.provincia?.nombre]
      .filter(Boolean)
      .join(', ');
  }

  nombreMoneda(): string | undefined {
    return this.tipoMoneda?.nombre;
  }

  /** Una baja administrativa no la puede revertir el anunciante. */
  estaDadaDeBajaPorAdministrador(): boolean {
    return !!this.motivo_baja_admin;
  }

  activar(): void {
    this.activa = true;
  }

  darDeBaja(motivo: string): void {
    this.activa = false;
    this.motivo_baja_admin = motivo;
  }

  modificar(cambios: CambiosPublicacion): void {
    const informados = Object.entries(cambios).filter(
      ([, valor]) => valor !== undefined,
    );
    Object.assign(this, Object.fromEntries(informados));
  }
}
