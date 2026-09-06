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

  // Las fechas reservadas se mantienen en la entidad Fecha, no en Reserva.
  
  // Usuario que realiza la reserva (Inquilino)
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  // Publicación que se está reservando
  @ManyToOne(() => Publicacion)
  @JoinColumn({ name: 'id_publicacion' })
  publicacion: Publicacion;

  // Método de pago utilizado (Crédito, Débito, QR)
  @ManyToOne(() => MetodoPago)
  @JoinColumn({ name: 'id_metodo_pago' })
  metodoPago: MetodoPago;
}