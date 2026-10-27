import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { COTIZACION_REPOSITORY } from '../repository/cotizacion.repository.interface';
import type { ICotizacionRepository } from '../repository/cotizacion.repository.interface';
import { PROVEEDOR_DOLAR } from '../repository/proveedor-dolar.interface';
import type { IProveedorDolar } from '../repository/proveedor-dolar.interface';
import type { CotizacionDolar } from '../entity/cotizacion-dolar.entity';
import type { ConsultaCotizacion } from '../entity/consulta-cotizacion.entity';

interface EstadoDolar {
  cotizacion: CotizacionDolar | null;
  consulta: ConsultaCotizacion | null;
}

@Injectable()
export class CotizacionesService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(CotizacionesService.name);
  private timer?: ReturnType<typeof setInterval>;
  private actualizacion?: Promise<EstadoDolar>;
  private readonly intervalo = 3 * 60 * 60 * 1000;
  private readonly reintento = 5 * 60 * 1000;
  private readonly maxAntiguedad: number;
  constructor(
    @Inject(COTIZACION_REPOSITORY) private readonly repo: ICotizacionRepository,
    @Inject(PROVEEDOR_DOLAR) private readonly proveedor: IProveedorDolar,
    config: ConfigService,
  ) {
    const horas = Number(
      config.get<string>('DOLAR_MAX_ANTIGUEDAD_FUENTE_HORAS') ?? 96,
    );
    if (!Number.isFinite(horas) || horas < 3 || horas > 168)
      throw new Error(
        'DOLAR_MAX_ANTIGUEDAD_FUENTE_HORAS debe estar entre 3 y 168',
      );
    this.maxAntiguedad = horas * 60 * 60 * 1000;
  }
  onApplicationBootstrap() {
    const revisar = () => {
      void this.actualizarSiCorresponde().catch(() =>
        this.logger.warn(
          'No se pudo revisar el dólar; se reintentará con el backend activo',
        ),
      );
    };
    revisar();
    this.timer = setInterval(revisar, 60000);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  private fuenteVigente(
    cotizacion: CotizacionDolar | null,
  ): cotizacion is CotizacionDolar {
    if (!cotizacion) return false;
    const edad =
      Date.now() - new Date(cotizacion.actualizada_fuente_en).getTime();
    return (
      Number.isFinite(edad) && edad >= -300000 && edad <= this.maxAntiguedad
    );
  }
  private async estado(repo: ICotizacionRepository): Promise<EstadoDolar> {
    // Leer primero el control evita combinar un precio viejo con una consulta
    // recién confirmada por otra instancia. Bajo el bloqueo ambos son estables.
    const consulta = await repo.ultimaConsulta();
    const cotizacion = await repo.ultima();
    return { cotizacion, consulta };
  }
  private esperarRevision(estado: EstadoDolar): boolean {
    if (!estado.consulta) return false;
    const edad = Date.now() - new Date(estado.consulta.realizada_en).getTime();
    return (
      edad >= -300000 &&
      edad < (estado.consulta.exitosa ? this.intervalo : this.reintento) &&
      (!estado.consulta.exitosa || this.fuenteVigente(estado.cotizacion))
    );
  }
  async actualizarSiCorresponde(): Promise<EstadoDolar> {
    // La promesa solo agrupa peticiones simultáneas; la vigencia siempre sale de la BD.
    if (this.actualizacion) return this.actualizacion;
    const previa = await this.estado(this.repo);
    if (this.esperarRevision(previa)) return previa;
    if (this.actualizacion) return this.actualizacion;
    this.actualizacion = this.repo.conBloqueo(async (repo) => {
      const actual = await this.estado(repo);
      if (this.esperarRevision(actual)) return actual;
      try {
        const datos = await this.proveedor.consultar();
        const candidata = {
          actualizada_fuente_en: datos.actualizadaEn,
        } as CotizacionDolar;
        if (
          !Number.isFinite(datos.compra) ||
          !Number.isFinite(datos.venta) ||
          datos.compra <= 0 ||
          datos.venta < datos.compra ||
          datos.venta > 100000000 ||
          !this.fuenteVigente(candidata) ||
          (actual.cotizacion &&
            datos.actualizadaEn.getTime() <
              new Date(actual.cotizacion.actualizada_fuente_en).getTime())
        ) {
          throw new Error(
            'La fuente devolvió una cotización inválida o demasiado antigua',
          );
        }
        await repo.guardar({
          compra: datos.compra.toFixed(6),
          venta: datos.venta.toFixed(6),
          actualizada_fuente_en: datos.actualizadaEn,
          tipo: 'blue',
          proveedor: 'DolarApi / DolarHoy',
        });
        await repo.registrarConsulta(true, null);
      } catch (error) {
        // Persiste el fallo para no insistir en cada reserva tras despertar.
        const mensaje =
          error instanceof Error
            ? error.message
            : 'Error consultando la fuente';
        await repo.registrarConsulta(false, mensaje.slice(0, 300));
      }
      return this.estado(repo);
    });
    try {
      return await this.actualizacion;
    } finally {
      this.actualizacion = undefined;
    }
  }
  async obtenerVigente(): Promise<CotizacionDolar> {
    let estado: EstadoDolar;
    try {
      estado = await this.actualizarSiCorresponde();
    } catch {
      throw new ServiceUnavailableException(
        'No pudimos verificar la cotización del dólar. Intentá nuevamente.',
      );
    }
    if (
      !estado.consulta?.exitosa ||
      !this.fuenteVigente(estado.cotizacion) ||
      Date.now() - new Date(estado.cotizacion.consultada_en).getTime() >=
        this.intervalo ||
      Date.now() - new Date(estado.consulta.realizada_en).getTime() < -300000 ||
      Date.now() - new Date(estado.consulta.realizada_en).getTime() >=
        this.intervalo
    ) {
      throw new ServiceUnavailableException(
        'No hay una cotización del dólar verificada y vigente. Las reservas en pesos continúan disponibles.',
      );
    }
    return estado.cotizacion;
  }
  async administracion(
    desde: Date | undefined,
    hasta: Date | undefined,
    pagina: number,
  ) {
    const [estado, historial, consultas] = await Promise.all([
      this.estado(this.repo),
      this.repo.historial(desde, hasta, pagina),
      this.repo.consultas(),
    ]);
    return {
      ...estado,
      ...historial,
      consultas,
      pagina,
      por_pagina: 25,
      vigente:
        !!estado.consulta?.exitosa &&
        this.fuenteVigente(estado.cotizacion) &&
        Date.now() - new Date(estado.consulta.realizada_en).getTime() <
          this.intervalo,
      proxima_revision_en: estado.consulta
        ? new Date(
            new Date(estado.consulta.realizada_en).getTime() +
              (estado.consulta.exitosa ? this.intervalo : this.reintento),
          )
        : null,
      max_antiguedad_fuente_horas: this.maxAntiguedad / 3600000,
    };
  }
}
