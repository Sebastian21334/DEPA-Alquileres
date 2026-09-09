import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entity/usuario.entity';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';
import { MetodoPago } from '../../catalogos/entity/metodo-pago.entity';

@Entity('reserva')
export class Reserva {
  // La reserva registra el pago y vincula al inquilino con una publicación.
  @PrimaryGeneratedColumn({ name: 'id_reserva' })
  id: number;

  @Column({ type: 'boolean', default: false })
  finalizada: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto_pago: number;

  @Column({ type: 'date' })
  fecha_pago: Date;

  // Se conserva una copia del periodo para mantener el historial aunque
  // posteriormente se elimine la publicación o su calendario.
  @Column({ type: 'date', nullable: true })
  fecha_inicio: Date | null;

  @Column({ type: 'date', nullable: true })
  fecha_fin: Date | null;

  // Copia historica de los datos del inquilino al momento de reservar.
  // La relacion con Usuario puede quedar NULL si la cuenta se elimina.
  @Column({ type: 'varchar', length: 100, nullable: true })
  usuario_nombre: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  usuario_apellido: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  usuario_email: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  usuario_telefono: string | null;
  
  // Usuario que realiza la reserva (Inquilino)
  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario | null;

  // Publicación que se está reservando
  @ManyToOne(() => Publicacion, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_publicacion' })
  publicacion: Publicacion | null;

  // Método de pago utilizado (Crédito, Débito, QR)
  @ManyToOne(() => MetodoPago)
  @JoinColumn({ name: 'id_metodo_pago' })
  metodoPago: MetodoPago;
}