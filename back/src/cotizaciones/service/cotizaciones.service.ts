import {
  BadRequestException,
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
import { PROVEEDOR_DOLAR } from '../proveedor/proveedor-dolar.interface';
import type { IProveedorDolar } from '../proveedor/proveedor-dolar.interface';
import type { HistorialCotizacionesDto } from '../dto/historial-cotizaciones.dto';
import type { CotizacionDolar } from '../entity/cotizacion-dolar.entity';
import type { ConsultaCotizacion } from '../entity/consulta-cotizacion.entity';

interface EstadoDolar {
  cotizacion: CotizacionDolar | null;
  consulta: ConsultaCotizacion | null;
}

const TOLERANCIA_FUTURO_MS = 5 * 60 * 1000;

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
  constructor(@Inject(COTIZACION_REPOSITORY) private readonly repo: ICotizacionRepository, @Inject(PROVEEDOR_DOLAR) private readonly proveedor: IProveedorDolar, config: ConfigService) {
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
  private fuenteVigente(actualizadaEn: Date, ahora: number): boolean {
    const edad = ahora - new Date(actualizadaEn).getTime();
    return edad >= -TOLERANCIA_FUTURO_MS && edad <= this.maxAntiguedad;
  }

  private dentroDeVentana(fecha: Date, ahora: number, limite: number): boolean {
    const edad = ahora - new Date(fecha).getTime();
    return edad >= -TOLERANCIA_FUTURO_MS && edad < limite;
  }

  private importesValidos(compra: number, venta: number): boolean {
    return (
      Number.isFinite(compra) &&
      Number.isFinite(venta) &&
      compra > 0 &&
      venta >= compra &&
      venta <= 100_000_000
    );
  }

  private estaVigente(estado: EstadoDolar, ahora: number): estado is { cotizacion: CotizacionDolar; consulta: ConsultaCotizacion } {
    const { cotizacion, consulta } = estado;
    return (
      !!consulta?.exitosa &&
      !!cotizacion &&
      this.importesValidos(Number(cotizacion.compra), Number(cotizacion.venta)) &&
      this.fuenteVigente(cotizacion.actualizada_fuente_en, ahora) &&
      this.dentroDeVentana(cotizacion.consultada_en, ahora, this.intervalo) &&
      this.dentroDeVentana(consulta.realizada_en, ahora, this.intervalo)
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
    const ahora = Date.now();
    return estado.consulta.exitosa
      ? this.estaVigente(estado, ahora)
      : this.dentroDeVentana(estado.consulta.realizada_en, ahora, this.reintento);
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
        const compra = datos.compra.toFixed(6);
        const venta = datos.venta.toFixed(6);
        if (
          !this.importesValidos(datos.compra, datos.venta) ||
          !this.importesValidos(Number(compra), Number(venta)) ||
          !this.fuenteVigente(datos.actualizadaEn, Date.now()) ||
          (actual.cotizacion &&
            datos.actualizadaEn.getTime() <
              new Date(actual.cotizacion.actualizada_fuente_en).getTime())
        ) {
          throw new Error(
            'La fuente devolvió una cotización inválida o demasiado antigua',
          );
        }
        await repo.guardar({
          compra,
          venta,
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
    if (!this.estaVigente(estado, Date.now())) {
      throw new ServiceUnavailableException(
        'No hay una cotización del dólar verificada y vigente. Las reservas en pesos continúan disponibles.',
      );
    }
    return estado.cotizacion;
  }
  async verificarAdministracion() {
    await this.actualizarSiCorresponde();
    return this.administracion({ pagina: 1 });
  }

  async administracion({ desde, hasta, pagina }: HistorialCotizacionesDto) {
    if (desde && hasta && desde > hasta) {
      throw new BadRequestException('El rango de fechas no es válido');
    }
    const inicio = desde ? new Date(`${desde}T00:00:00-03:00`) : undefined;
    const finExclusivo = hasta
      ? new Date(new Date(`${hasta}T00:00:00-03:00`).getTime() + 86_400_000)
      : undefined;
    const [estado, historial, consultas] = await Promise.all([
      this.estado(this.repo),
      this.repo.historial(inicio, finExclusivo, pagina),
      this.repo.consultas(),
    ]);
    const ahora = Date.now();
    const vigente = this.estaVigente(estado, ahora);
    return {
      ...estado,
      ...historial,
      consultas,
      pagina,
      por_pagina: 25,
      vigente,
      proxima_revision_en: estado.consulta
        ? new Date(
            estado.consulta.exitosa && !vigente
              ? ahora
              : new Date(estado.consulta.realizada_en).getTime() +
                (estado.consulta.exitosa ? this.intervalo : this.reintento),
          )
        : null,
      max_antiguedad_fuente_horas: this.maxAntiguedad / 3600000,
    };
  }
}
