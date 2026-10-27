import {
  BadRequestException,
  ConflictException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHmac } from 'node:crypto';
import { CotizacionesService } from '../../cotizaciones/service/cotizaciones.service';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { DisponibilidadService } from '../../disponibilidad/service/disponibilidad.service';
import { admiteReservaPorFecha } from '../../catalogos/service/modalidad.utils';
import {
  decimalEntero,
  importeTexto,
  monedaPublicacion,
} from '../../common/utils/importes';
import type { CondicionesCobro } from '../../reservas/interfaces/condiciones-cobro.interface';
import type { CrearReservaDto } from '../../reservas/dto/crear-reserva.dto';

interface PresupuestoFirmado extends CondicionesCobro {
  usuario: number;
  publicacion: number;
  inicio: string;
  fin: string;
  purpose: 'presupuesto_reserva';
}

@Injectable()
export class PresupuestosService {
  private readonly secreto: string;
  constructor(
    private readonly cotizaciones: CotizacionesService,
    private readonly publicaciones: PublicacionesService,
    private readonly disponibilidad: DisponibilidadService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    // Clave separada: un presupuesto jamás puede utilizarse como token de inicio de sesión.
    this.secreto = createHmac('sha256', config.getOrThrow<string>('JWT_SECRET'))
      .update('depa:presupuesto:v1')
      .digest('hex');
  }
  async cotizar(dto: CrearReservaDto, idUsuario: number) {
    if ((this.config.get<string>('MP_CURRENCY_ID') ?? 'ARS') !== 'ARS') {
      throw new ServiceUnavailableException(
        'Esta integración requiere configurar los cobros de Mercado Pago en ARS',
      );
    }
    const inicio = new Date(dto.fecha_inicio),
      fin = new Date(dto.fecha_fin);
    const hoy = new Date();
    const hoyTexto = [
      hoy.getFullYear(),
      String(hoy.getMonth() + 1).padStart(2, '0'),
      String(hoy.getDate()).padStart(2, '0'),
    ].join('-');
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(dto.fecha_inicio) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dto.fecha_fin) ||
      !Number.isFinite(inicio.getTime()) ||
      !Number.isFinite(fin.getTime()) ||
      inicio.toISOString().slice(0, 10) !== dto.fecha_inicio ||
      fin.toISOString().slice(0, 10) !== dto.fecha_fin ||
      inicio > fin ||
      dto.fecha_inicio < hoyTexto
    )
      throw new BadRequestException('Las fechas de la reserva no son válidas');
    const publicacion = await this.publicaciones.buscarPorId(
      dto.id_publicacion,
    );
    if (!publicacion.activa || !admiteReservaPorFecha(publicacion.modalidad))
      throw new BadRequestException('Esta publicación no admite reservas');
    if (publicacion.anunciante?.idUsuario === idUsuario)
      throw new BadRequestException('No podés reservar tu propia publicación');
    const dias = Math.floor((fin.getTime() - inicio.getTime()) / 86400000) + 1;
    let moneda: 'ARS' | 'USD', unitario: bigint, origen: string;
    try {
      moneda = monedaPublicacion(publicacion.tipoMoneda?.nombre);
      unitario = decimalEntero(publicacion.precio, 2);
      if (unitario <= 0n) throw new Error('La tarifa debe ser mayor a cero');
      origen = importeTexto(unitario * BigInt(dias));
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Precio inválido',
      );
    }
    if (
      !(await this.disponibilidad.verificarDisponibilidad(
        publicacion.id,
        inicio,
        fin,
      ))
    )
      throw new ConflictException('El rango de fechas no está disponible');
    // La consulta externa termina antes de bloquear el calendario o crear una reserva.
    const cotizacion =
      moneda === 'USD' ? await this.cotizaciones.obtenerVigente() : null;
    let cobro: string;
    try {
      const centavos = unitario * BigInt(dias);
      cobro = importeTexto(
        cotizacion
          ? (centavos * decimalEntero(cotizacion.venta, 6) + 500000n) / 1000000n
          : centavos,
      );
      if (decimalEntero(cobro, 2) <= 0n)
        throw new Error('El importe a cobrar debe ser mayor a cero');
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'No se pudo calcular el cobro',
      );
    }
    const emitida = new Date();
    const vence = new Date((Math.floor(emitida.getTime() / 1000) + 900) * 1000);
    const condiciones: PresupuestoFirmado = {
      purpose: 'presupuesto_reserva',
      usuario: idUsuario,
      publicacion: publicacion.id,
      inicio: dto.fecha_inicio,
      fin: dto.fecha_fin,
      precio_unitario_origen: importeTexto(unitario),
      moneda_origen: moneda,
      total_origen: origen,
      total_cobro: cobro,
      cotizacion_id: cotizacion?.id ?? null,
      emitida_en: emitida.toISOString(),
      vence_en: vence.toISOString(),
    };
    const token = await this.jwt.signAsync(condiciones, {
      secret: this.secreto,
      audience: 'depa-checkout',
      algorithm: 'HS256',
      expiresIn: 900,
    });
    return {
      token,
      ...condiciones,
      moneda_cobro: 'ARS' as const,
      cantidad_dias: dias,
      cotizacion,
    };
  }
  async validar(
    token: string,
    dto: CrearReservaDto,
    usuario: number,
  ): Promise<CondicionesCobro> {
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
