import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHmac } from 'node:crypto';
import type { CotizacionDolar } from '../../cotizaciones/entity/cotizacion-dolar.entity';
import { CotizacionesService } from '../../cotizaciones/service/cotizaciones.service';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { DisponibilidadService } from '../../disponibilidad/service/disponibilidad.service';
import {
  decimalEntero,
  importeTexto,
} from '../../common/utils/importes';
import { ReservasService, type CondicionesCobro } from '../../reservas/service/reservas.service';
import type { CrearReservaDto } from '../../reservas/dto/crear-reserva.dto';
import { diasInclusivos } from '../../common/utils/fechas';

interface PresupuestoFirmado extends CondicionesCobro {
  usuario: number;
  publicacion: number;
  inicio: string;
  fin: string;
  purpose: 'presupuesto_reserva';
}

const VIGENCIA_PRESUPUESTO_SEGUNDOS = 15 * 60;

@Injectable()
export class PresupuestosService {
  private readonly secreto: string;
  constructor(private readonly cotizaciones: CotizacionesService, private readonly publicaciones: PublicacionesService, private readonly disponibilidad: DisponibilidadService, private readonly jwt: JwtService, config: ConfigService, private readonly reservas: ReservasService) {
    // Clave separada: un presupuesto jamás puede utilizarse como token de inicio de sesión.
    this.secreto = createHmac('sha256', config.getOrThrow<string>('JWT_SECRET'))
      .update('depa:presupuesto:v1')
      .digest('hex');
  }
  /** Valida la reserva y su disponibilidad, calcula el cobro y firma las condiciones ofrecidas al usuario. */
  async cotizar(dto: CrearReservaDto, idUsuario: number) {
    this.reservas.validarMonedaDeCobro();
    const { inicio, fin } = this.reservas.validarRangoReserva(dto);
    const publicacion = await this.publicaciones.buscarPorId(dto.id_publicacion);
    this.publicaciones.validarNuevaReserva(publicacion, idUsuario, 'cotizacion');

    const dias = diasInclusivos(inicio, fin);
    const tarifa = this.publicaciones.calcularTarifaReserva(publicacion, dias, 'cotizacion');
    if (
      !(await this.disponibilidad.verificarDisponibilidad(
        publicacion.id,
        inicio,
        fin,
      ))
    )
      throw new ConflictException('El rango de fechas no está disponible');
    // Se avisa al cotizar, antes de pagar; crearPendiente lo vuelve a controlar dentro de la transacción.
    await this.reservas.validarLimiteCancelaciones(publicacion.id, idUsuario, dto.fecha_inicio, dto.fecha_fin);
    // La consulta externa termina antes de bloquear el calendario o crear una reserva.
    const cotizacion = tarifa.moneda === 'USD' ? await this.cotizaciones.obtenerVigente() : null;
    const cobro = this.calcularCobro(tarifa.centavos, cotizacion);
    const emitida = new Date();
    const vence = new Date((Math.floor(emitida.getTime() / 1000) + VIGENCIA_PRESUPUESTO_SEGUNDOS) * 1000);
    const condiciones: PresupuestoFirmado = {
      purpose: 'presupuesto_reserva',
      usuario: idUsuario,
      publicacion: publicacion.id,
      inicio: dto.fecha_inicio,
      fin: dto.fecha_fin,
      precio_unitario_origen: importeTexto(tarifa.unitario),
      moneda_origen: tarifa.moneda,
      total_origen: tarifa.total,
      total_cobro: cobro,
      cotizacion_id: cotizacion?.id ?? null,
      emitida_en: emitida.toISOString(),
      vence_en: vence.toISOString(),
    };
    const token = await this.jwt.signAsync(condiciones, {
      secret: this.secreto,
      audience: 'depa-checkout',
      algorithm: 'HS256',
      expiresIn: VIGENCIA_PRESUPUESTO_SEGUNDOS,
    });
    return {
      token,
      ...condiciones,
      moneda_cobro: 'ARS' as const,
      cantidad_dias: dias,
      cotizacion,
    };
  }
  /** Rechaza fechas inexistentes, invertidas o anteriores al día actual en Argentina. */
  /** Convierte el total a pesos con precisión entera y redondea a centavos cuando corresponde. */
  private calcularCobro(centavos: bigint, cotizacion: CotizacionDolar | null): string {
    try {
      const total = cotizacion ? (centavos * decimalEntero(cotizacion.venta, 6) + 500000n) / 1000000n : centavos;
      const cobro = importeTexto(total);
      if (total <= 0n) throw new Error('El importe a cobrar debe ser mayor a cero');
      return cobro;
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'No se pudo calcular el cobro');
    }
  }

  /** Verifica la firma, la vigencia y que el presupuesto corresponda al usuario, publicación y fechas solicitadas. */
  async validar(token: string, dto: CrearReservaDto, usuario: number): Promise<CondicionesCobro> {
    let condiciones: PresupuestoFirmado;
    try {
      condiciones = await this.jwt.verifyAsync<PresupuestoFirmado>(token, {
        secret: this.secreto,
        audience: 'depa-checkout',
        algorithms: ['HS256'],
      });
    } catch {
      throw new ConflictException(
        'El presupuesto venció o no es válido. Solicitá una nueva cotización antes de pagar.',
      );
    }
    if (
      condiciones.purpose !== 'presupuesto_reserva' ||
      condiciones.usuario !== usuario ||
      condiciones.publicacion !== dto.id_publicacion ||
      condiciones.inicio !== dto.fecha_inicio ||
      condiciones.fin !== dto.fecha_fin ||
      !['ARS', 'USD'].includes(condiciones.moneda_origen) ||
      new Date(condiciones.vence_en).getTime() <= Date.now()
    ) {
      throw new ConflictException(
        'El presupuesto no corresponde a esta reserva o venció. Volvé a cotizar.',
      );
    }
    return condiciones;
  }
}
