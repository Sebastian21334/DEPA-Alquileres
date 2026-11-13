import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import type { EntityManager } from 'typeorm';
import { PagosService, type DatosPagoExterno } from '../../pagos/service/pagos.service';
import {
  OrigenReembolso,
  type Reembolso,
  TipoReembolso,
} from '../../reembolsos/entity/reembolso.entity';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import { ReservasService } from '../../reservas/service/reservas.service';
import { referenciaUsuario } from '../../usuarios/usuario-referencia';
import { type Disputa, OrigenDisputa } from '../entity/disputa.entity';
import { ResolverDisputaDto } from '../dto/resolver-disputa.dto';
import {
  DISPUTAS_REPOSITORY,
  type IDisputasRepository,
} from '../repository/disputas.repository.interface';

@Injectable()
export class DisputasService {
  constructor(@Inject(DISPUTAS_REPOSITORY) private readonly disputas: IDisputasRepository, private readonly pagos: PagosService, private readonly reembolsos: ReembolsosService, private readonly reservasService: ReservasService, private readonly catalogos: CatalogosService) {}

  /**
   * Registra el contracargo y congela la liquidación. No cancela la reserva
   * ni libera fechas: primero hay que preservar la evidencia y resolver.
   */
  async registrarContracargo(datos: { idReserva: number; idPago: number; chargebackId: string; importe: number; motivo?: string; pagoExterno?: DatosPagoExterno }): Promise<Disputa> {
    const estado = await this.catalogos.obtenerEstado('DISPUTA', 'ABIERTA');
    return this.disputas.conTransaccion(async (disputas, transaccion) => {
      const reserva = await this.reservasService.obtenerReserva(datos.idReserva, transaccion);
      const existente = await disputas.buscarPorContracargo(datos.chargebackId);
      if (existente) return existente;

      const pago = await this.pagos.buscarPorId(datos.idPago, transaccion);
      const disputa = disputas.crear({
        reserva,
        pago,
        origen: OrigenDisputa.CONTRACARGO,
        estado,
        importe: datos.importe,
        moneda: pago.currency,
        motivo: datos.motivo?.trim().slice(0, 500) || 'Contracargo informado por Mercado Pago',
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

      if (datos.pagoExterno) await this.pagos.registrarEstadoExterno(pago, datos.pagoExterno, transaccion);
      await this.pagos.marcarContracargo(pago.id, datos.chargebackId, transaccion);
      await this.reservasService.congelarPorContracargo(reserva, transaccion);
      return disputas.guardar(disputa);
    });
  }

  async listarAdministracion() {
    const disputas = await this.disputas.listarAdministracion();
    return disputas.map((disputa) => this.respuestaAdministracion(disputa));
  }

  async resolver(id: number, dto: ResolverDisputaDto, idAdmin: number) {
    const disputa = await this.disputas.buscarPorId(id);
    if (!disputa) throw new NotFoundException('Disputa no encontrada');
    if (disputa.estado.codigo === this.catalogos.codigoEstado('DISPUTA', 'GANADA') || disputa.estado.codigo === this.catalogos.codigoEstado('DISPUTA', 'PERDIDA'))
      throw new ConflictException('La disputa ya fue resuelta');

    const resultado = await this.disputas.conTransaccion(async (disputas, transaccion) => {
      const reserva = await this.reservasService.obtenerReserva(disputa.reserva.id, transaccion);
      const actual = await disputas.buscarPorId(id);
      if (!actual || (['GANADA', 'PERDIDA'] as const).some(codigo => actual.estado.codigo === this.catalogos.codigoEstado('DISPUTA', codigo)))
        throw new ConflictException('La disputa ya fue resuelta');
      const referencia = `dis:${id}`;
      const previo = await this.reembolsos.buscarPorOrigen(OrigenReembolso.CONTRACARGO, referencia, transaccion);
      if (dto.resultado === this.catalogos.codigoEstado('DISPUTA', 'GANADA')) {
        if (previo) throw new ConflictException('La disputa tiene una devolución registrada');
        await this.pagos.restaurarPagoAprobado(actual.pago.id, transaccion);
        actual.reserva = await this.reservasService.restaurarPorContracargoGanado(reserva, actual.estado_liquidacion_previo, transaccion);
        actual.estado = await this.catalogos.obtenerEstado('DISPUTA', dto.resultado);
        actual.resolucion = dto.observacion?.trim() || 'Contracargo ganado';
        actual.resuelto_por = referenciaUsuario(idAdmin);
        actual.resuelto_en = new Date();
        return { disputa: await disputas.guardar(actual), reembolso: null };
      }
      const pago = actual.pago;
      const importe = Number(actual.importe);
      const reembolso = previo ?? await this.reembolsos.crearSolicitud({
        reserva,
        pago,
        tipo: importe >= Number(pago.amount) - 0.009 ? TipoReembolso.CONTRACARGO : TipoReembolso.PARCIAL,
        origen: OrigenReembolso.CONTRACARGO,
        importe,
        motivo: 'Contracargo perdido',
        idSolicitadoPor: idAdmin,
        idempotencyKey: referencia,
        referenciaInterna: referencia,
      }, transaccion);
      return { disputa: actual, reembolso };
    });
    const { reembolso } = resultado;
    if (!reembolso) return this.respuestaAdministracion(resultado.disputa);
    // El contracargo ya revirtió el dinero en Mercado Pago: se registra,
    // pero no se dispara un segundo reembolso automático.
    await this.reembolsos.registrarManual(
      reembolso.id,
      dto.referencia?.trim() || disputa.chargeback_id || `contracargo-${disputa.id}`,
      idAdmin,
    );
    // El orquestador aplica el estado de la reserva y libera fechas solo
    // cuando el contracargo perdido ocurre antes del inicio.
    const aplicada = await this.reembolsos.aplicarConfirmado(reembolso.id, (confirmado, transaccion) =>
      this.aplicarResolucionReembolso(confirmado, transaccion, dto.observacion),
    );
    return this.respuestaAdministracion(aplicada ?? (await this.disputas.buscarPorId(id))!);
  }

  async aplicarResolucionReembolso(reembolso: Reembolso, transaccion: EntityManager, observacion?: string): Promise<Disputa> {
    const id = Number(reembolso.referencia_interna?.split(':')[1]);
    const disputas = this.disputas.enTransaccion(transaccion);
    const disputa = Number.isSafeInteger(id) ? await disputas.buscarPorId(id) : null;
    if (!disputa || disputa.pago.id !== reembolso.pago.id || disputa.reserva.id !== reembolso.reserva.id)
      throw new ConflictException('El reembolso requiere identificar el contracargo de origen');
    if (disputa.estado.codigo === this.catalogos.codigoEstado('DISPUTA', 'GANADA'))
      throw new ConflictException('La disputa tiene una resolución incompatible con el reembolso');
    disputa.reserva = await this.reservasService.aplicarEfectoReembolso(reembolso, transaccion);
    disputa.estado = await this.catalogos.obtenerEstado('DISPUTA', 'PERDIDA');
    disputa.resolucion = observacion?.trim() || 'Contracargo perdido';
    disputa.resuelto_por = reembolso.resuelto_por ?? reembolso.solicitado_por;
    disputa.resuelto_en = new Date();
    return disputas.guardar(disputa);
  }

  private respuestaAdministracion({ estado, ...disputa }: Disputa) {
    return {
      ...disputa,
      estado: estado.codigo,
      reserva: this.reservasService.prepararRespuesta(disputa.reserva),
    };
  }
}
