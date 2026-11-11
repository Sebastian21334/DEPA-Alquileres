import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { AmbitoEstado, EstadoDisputa } from '../../catalogos/estados';
import { PagosRegistroService } from '../../pagos/service/pagos-registro.service';
import {
  OrigenReembolso,
  TipoReembolso,
} from '../../reembolsos/entity/reembolso.entity';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import { ReservasService } from '../../reservas/service/reservas.service';
import { type Disputa, OrigenDisputa } from '../entity/disputa.entity';
import { ResolverDisputaDto } from '../dto/resolver-disputa.dto';
import {
  DISPUTAS_REPOSITORY,
  type IDisputasRepository,
} from '../repository/disputas.repository.interface';

@Injectable()
export class DisputasService {
  constructor(@Inject(DISPUTAS_REPOSITORY) private readonly disputas: IDisputasRepository, private readonly pagos: PagosRegistroService, private readonly reembolsos: ReembolsosService, private readonly reservasService: ReservasService, private readonly catalogos: CatalogosService) {}

  /**
   * Registra el contracargo y congela la liquidación. No cancela la reserva
   * ni libera fechas: primero hay que preservar la evidencia y resolver.
   */
  async registrarContracargo(datos: { idReserva: number; idPago: number; chargebackId: string; importe: number; motivo?: string; }): Promise<Disputa> {
    const existente = await this.disputas.buscarPorContracargo(datos.chargebackId);
    if (existente) return existente;

    const reserva = await this.reservasService.buscarParaContracargo(datos.idReserva);
    const pago = await this.pagos.buscarPorId(datos.idPago);
    const estado = await this.catalogos.obtenerEstado(AmbitoEstado.DISPUTA, EstadoDisputa.ABIERTA);

    const disputa = this.disputas.crear({
      reserva,
      pago,
      origen: OrigenDisputa.CONTRACARGO,
      estado,
      importe: datos.importe,
      moneda: pago.currency,
      motivo:
        datos.motivo?.trim().slice(0, 500) ||
        'Contracargo informado por Mercado Pago',
      chargeback_id: datos.chargebackId,
      referencia_externa: datos.chargebackId,
      evidencia: null,
      fecha_limite_respuesta: null,
      resolucion: null,
      estado_pago_previo: reserva.estado_pago,
      estado_liquidacion_previo: reserva.estado_liquidacion,
      resuelto_por: null,
      resuelto_en: null,
    });

    await this.pagos.marcarContracargo(pago, datos.chargebackId);
    await this.reservasService.congelarPorContracargo(reserva);
    return this.disputas.guardar(disputa);
  }

  async listarAdministracion() {
    const disputas = await this.disputas.listarAdministracion();
    return disputas.map((disputa) => this.respuestaAdministracion(disputa));
  }

  async resolver(id: number, dto: ResolverDisputaDto, idAdmin: number) {
    const disputa = await this.disputas.buscarPorId(id);
    if (!disputa) throw new NotFoundException('Disputa no encontrada');
    if (disputa.estado.codigo === EstadoDisputa.GANADA || disputa.estado.codigo === EstadoDisputa.PERDIDA)
      throw new ConflictException('La disputa ya fue resuelta');

    const estado = await this.catalogos.obtenerEstado(AmbitoEstado.DISPUTA, dto.resultado);
    const { reserva, pago } = disputa;
    if (dto.resultado === EstadoDisputa.GANADA) {
      await this.pagos.restaurarPagoAprobado(pago);
      await this.reservasService.restaurarPorContracargoGanado(
        reserva,
        disputa.estado_liquidacion_previo,
      );
      disputa.resolucion = dto.observacion?.trim() || 'Contracargo ganado';
    } else {
      const importe = Number(disputa.importe);
      const total = importe >= Number(pago.amount) - 0.009;
      const reembolso = await this.reembolsos.crearSolicitud({
        reserva,
        pago,
        tipo: total ? TipoReembolso.CONTRACARGO : TipoReembolso.PARCIAL,
        origen: OrigenReembolso.CONTRACARGO,
        importe,
        motivo: 'Contracargo perdido',
        idSolicitadoPor: idAdmin,
      });
      // El contracargo ya revirtió el dinero en Mercado Pago: se registra,
      // pero no se dispara un segundo reembolso automático.
      await this.reembolsos.registrarManual(
        reembolso.id,
        dto.referencia?.trim() || disputa.chargeback_id || `contracargo-${disputa.id}`,
        idAdmin,
      );
      // El orquestador aplica el estado de la reserva y libera fechas solo
      // cuando el contracargo perdido ocurre antes del inicio.
      await this.reservasService.aplicarReembolsoConfirmado(reembolso.id);
      disputa.resolucion = dto.observacion?.trim() || 'Contracargo perdido';
    }

    disputa.estado = estado;
    disputa.resuelto_por = { id: idAdmin } as never;
    disputa.resuelto_en = new Date();
    return this.respuestaAdministracion(await this.disputas.guardar(disputa));
  }

  private respuestaAdministracion({ estado, ...disputa }: Disputa) {
    return {
      ...disputa,
      estado: estado.codigo,
      reserva: this.reservasService.prepararRespuesta(disputa.reserva),
    };
  }
}
