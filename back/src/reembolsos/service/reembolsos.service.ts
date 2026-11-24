import { CatalogosService } from '../../catalogos/service/catalogos.service';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { AlmacenamientoService, type ComprobanteSubido } from '../../almacenamiento/service/almacenamiento.service';
import { createHash, randomUUID } from 'node:crypto';
import type { EntityManager } from 'typeorm';
import type { Pago } from '../../pagos/entity/pago.entity';
import { PagosService } from '../../pagos/service/pagos.service';
import { ReservaEstadoService } from '../../reservas-consulta/service/reserva-estado.service';
import type { Reserva } from '../../reservas/entity/reserva.entity';
import { referenciaUsuario } from '../../usuarios/usuario-referencia';
import { TOLERANCIA_MONETARIA } from '../../common/utils/dinero';
import {
  OrigenReembolso,
  Reembolso,
  TipoReembolso,
} from '../entity/reembolso.entity';
import { MercadoPagoService, type ResultadoReembolsoExterno } from '../../mercado-pago/service/mercado-pago.service';
import {
  REEMBOLSOS_REPOSITORY,
  type IReembolsosRepository,
} from '../repository/reembolsos.repository.interface';

export type CrearReembolsoDatos = {
  reserva: Reserva;
  pago: Pago;
  tipo: TipoReembolso;
  origen: OrigenReembolso;
  importe: number;
  motivo: string;
  idSolicitadoPor: number | null;
  idempotencyKey?: string;
  referenciaInterna?: string;
  /** Los ajustes externos pueden tener más de un reembolso por reserva. */
  permitirMultiplesAjustes?: boolean;
};

@Injectable()
export class ReembolsosService {
  private get estadosActivos(): string[] {
    return [...this.estadosEnCurso, this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO')];
  }

  /** Devoluciones que todavía pueden mover dinero; una aprobada ya está descontada del pago. */
  private get estadosEnCurso(): string[] {
    return [
      this.catalogos.codigoEstado('REEMBOLSO', 'PENDIENTE'),
      this.catalogos.codigoEstado('REEMBOLSO', 'EN_PROCESO'),
      this.catalogos.codigoEstado('REEMBOLSO', 'FALLIDO'),
    ];
  }

  private readonly logger = new Logger(ReembolsosService.name);

  constructor(@Inject(REEMBOLSOS_REPOSITORY) private readonly reembolsos: IReembolsosRepository, private readonly pasarela: MercadoPagoService, private readonly pagos: PagosService, private readonly estadoService: ReservaEstadoService, private readonly catalogos: CatalogosService, @Optional() private readonly almacenamiento?: AlmacenamientoService) {}

  /**
   * Con `transaccion`, el registro participa de la operación del servicio que
   * coordina: si esa operación falla después, la solicitud también se revierte.
   */
  async crearSolicitud(datos: CrearReembolsoDatos, transaccion?: EntityManager): Promise<Reembolso> {
    const { reembolso } = await this.crearSolicitudConResultado(datos, transaccion);
    return this.prepararRespuesta(reembolso);
  }

  async crearSolicitudConResultado(datos: CrearReembolsoDatos, transaccion?: EntityManager): Promise<{ reembolso: Reembolso; creado: boolean }> {
    this.verificarOrigenOperable(datos.origen);
    const importe = Number(datos.importe);
    if (!Number.isFinite(importe) || importe <= 0)
      throw new BadRequestException('El importe del reembolso debe ser positivo');

    const clave = datos.idempotencyKey ?? randomUUID();
    // En una transacción ajena no se recupera un duplicado: el error la revierte completa.
    if (transaccion)
      return this.registrarSolicitud(datos, importe, clave, this.reembolsos.enTransaccion(transaccion), transaccion);

    const existente = await this.reembolsos.buscarPorIdempotencyKey(clave);
    if (existente) return { reembolso: existente, creado: false };

    try {
      return await this.reembolsos.conTransaccion((reembolsos, propia) =>
        this.registrarSolicitud(datos, importe, clave, reembolsos, propia),
      );
    } catch (error) {
      const ganador = await this.reembolsos.buscarPorIdempotencyKey(clave);
      if (ganador) return { reembolso: ganador, creado: false };
      throw error;
    }
  }

  /** Valida el saldo con el pago bloqueado y registra la solicitud; la clave la hace repetible. */
  private async registrarSolicitud(datos: CrearReembolsoDatos, importe: number, clave: string, reembolsos: IReembolsosRepository, transaccion: EntityManager): Promise<{ reembolso: Reembolso; creado: boolean }> {
    const pago = await this.pagos.buscarParaReembolso(datos.pago.id, transaccion);
    if (!pago)
      throw new NotFoundException('No se encontró el pago de la reserva');

    const existente = await reembolsos.buscarPorIdempotencyKey(clave);
    if (existente) return { reembolso: existente, creado: false };

    if (
      datos.origen === OrigenReembolso.AJUSTE_ADMIN &&
      !datos.permitirMultiplesAjustes
    ) {
      const deLaReserva = await reembolsos.buscarPorReserva(datos.reserva.id);
      const activa = deLaReserva.find(
        (actual) =>
          actual.origen === OrigenReembolso.AJUSTE_ADMIN &&
          this.estadosEnCurso.includes(actual.estado),
      );
      if (activa)
        throw new ConflictException(
          'Ya existe una devolución de liquidación en curso para la reserva',
        );
    }

    const reservado = await reembolsos.sumarImportesReservados(pago.id, this.estadosEnCurso);
    const saldo = this.pagos.saldoReembolsable(pago) - reservado;
    if (importe > saldo + TOLERANCIA_MONETARIA)
      throw new ConflictException(
        `El importe supera el saldo reembolsable de ${pago.currency} ${saldo.toFixed(2)}`,
      );

    const reembolso = reembolsos.crear({
      reserva: datos.reserva,
      pago,
      tipo: datos.tipo,
      origen: datos.origen,
      importe,
      moneda: pago.currency,
      estado: this.catalogos.codigoEstado('REEMBOLSO', 'PENDIENTE'),
      transferencia_manual: this.requiereTransferencia(pago),
      motivo: datos.motivo.trim().slice(0, 500),
      referencia_interna: datos.referenciaInterna ?? null,
      referencia_externa: null,
      id_externo: null,
      idempotency_key: clave,
      solicitado_por:
        datos.idSolicitadoPor != null
          ? referenciaUsuario(datos.idSolicitadoPor)
          : null,
      resuelto_por: null,
      resuelto_en: null,
      error_detalle: null,
    });
    return { reembolso: await reembolsos.guardar(reembolso), creado: true };
  }

  async registrarManual(id: number, referencia: string, idActor: number): Promise<Reembolso> {
    if (!referencia.trim() || referencia.trim().length > 150)
      throw new BadRequestException('La referencia es obligatoria y admite hasta 150 caracteres');
    return this.confirmar(id, {
      referencia: referencia.trim(),
      idActor,
      idExterno: null,
    });
  }

  /**
   * El admin registra la transferencia con el comprobante obligatorio; la referencia y la observación son opcionales.
   * El archivo se sube antes de confirmar y se borra si el registro no lo termina guardando.
   */
  async registrarTransferencia(id: number, datos: { referencia?: string; observacion?: string }, archivo: Express.Multer.File | undefined, idActor: number): Promise<Reembolso> {
    const texto = datos.referencia?.trim() ?? '';
    const observacion = datos.observacion?.trim() || null;
    if (texto.length > 150)
      throw new BadRequestException('La referencia de la transferencia admite hasta 150 caracteres');
    if ((observacion?.length ?? 0) > 500)
      throw new BadRequestException('La observación de la transferencia admite hasta 500 caracteres');
    const actual = await this.reembolsos.buscarRegistro(id);
    if (!actual) throw new NotFoundException('Reembolso no encontrado');
    if (!actual.transferencia_manual)
      throw new ConflictException('El reembolso no está habilitado para transferencia');
    if (actual.estado === this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO'))
      throw new ConflictException('Otro administrador ya registró esta devolución');
    if (!this.almacenamiento) throw new Error('Falta el almacenamiento de comprobantes');
    const comprobante = await this.almacenamiento.subirComprobante(`reembolsos/${id}`, archivo);
    let guardado = false;
    try {
      return await this.confirmar(id, {
        referencia: texto, idActor, idExterno: null, transferencia: true,
        comprobante, observacion, alGuardarComprobante: () => { guardado = true; },
      });
    } finally {
      if (!guardado)
        await this.almacenamiento.eliminarComprobante(comprobante.url).catch(() =>
          this.logger.warn(`No se pudo borrar el comprobante sin usar del reembolso ${id}`));
    }
  }

  /** Enlace firmado del comprobante, solo para el admin y el inquilino de la reserva. */
  async urlComprobante(id: number, actor: { id: number; rol?: string }): Promise<{ url: string }> {
    const comprobante = await this.reembolsos.buscarComprobante(id);
    const autorizado = actor.rol === 'Administrador' || comprobante?.idInquilino === actor.id;
    if (!comprobante || !autorizado || !comprobante.url)
      throw new NotFoundException('Comprobante no encontrado');
    if (!this.almacenamiento) throw new Error('Falta el almacenamiento de comprobantes');
    return { url: await this.almacenamiento.firmarComprobante(comprobante.url) };
  }

  async conversar(id: number, actor: { id: number; rol?: string }, despuesDe: number, texto?: string) {
    if (despuesDe < 0 || despuesDe > 2_147_483_647)
      throw new BadRequestException('El identificador del mensaje es inválido');
    const administracion = actor.rol === 'Administrador';
    return this.reembolsos.conTransaccion(async repo => {
      const reembolso = await repo.buscarPorId(id);
      if (!reembolso?.transferencia_manual || (!administracion && reembolso.reserva?.usuario?.id !== actor.id))
        throw new NotFoundException('Conversación de reembolso no encontrada');
      const actual = texto === undefined ? reembolso : await repo.buscarRegistro(id, { bloquear: true });
      const abierta = actual?.estado === this.catalogos.codigoEstado('REEMBOLSO', 'PENDIENTE');
      if (texto !== undefined) {
        if (!abierta) throw new ConflictException('La conversación está cerrada');
        await repo.guardarMensaje(id, actor.id, administracion, texto.trim());
        return { abierta };
      }
      return { abierta, mensajes: await repo.listarMensajes(id, despuesDe) };
    });
  }

  actividadInquilino(idUsuario: number) {
    return this.reembolsos.actividadInquilino(idUsuario, this.estadosEnCurso);
  }

  listarConversaciones(idReserva: number, idInquilino: number) {
    return this.reembolsos.listarConversaciones(idReserva, idInquilino);
  }

  async registrarPagoTardio(reserva: Reserva, motivo: string, transaccion: EntityManager): Promise<boolean> {
    const pago = await this.buscarPagoPorReserva(reserva.id, transaccion);
    if (!pago || pago.status !== 'approved') return false;
    const existentes = await this.listarPorReserva(reserva.id, transaccion);
    if (existentes.some(reembolso => this.estadosActivos.includes(reembolso.estado))) return false;
    const importe = this.saldoReembolsable(pago);
    if (importe <= TOLERANCIA_MONETARIA) return false;
    const { creado } = await this.crearSolicitudConResultado({
      reserva, pago, importe, motivo,
      tipo: importe >= Number(pago.amount) - TOLERANCIA_MONETARIA ? TipoReembolso.TOTAL : TipoReembolso.PARCIAL,
      origen: OrigenReembolso.PAGO_TARDIO,
      idSolicitadoPor: null,
      idempotencyKey: `tardio:${pago.id}`,
      referenciaInterna: `tardio:${pago.id}`,
    }, transaccion);
    return creado;
  }

  async recuperarConfirmacion(id: number, referencia: string, idActor: number): Promise<Reembolso> {
    const reembolso = await this.buscar(id);
    this.verificarOrigenOperable(reembolso.origen);
    if (reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO')) return reembolso;
    if (reembolso.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'FALLIDO') &&
        reembolso.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'EN_PROCESO'))
      throw new ConflictException('Solo se puede recuperar un reembolso con resultado incierto');
    const idExterno = referencia.trim();
    if (!/^\d{1,100}$/.test(idExterno))
      throw new BadRequestException('Ingresá el identificador del reembolso informado por Mercado Pago');
    const paymentId = reembolso.pago.payment_id;
    if (!paymentId) throw new ConflictException('El pago no tiene identificador de Mercado Pago');
    const resultado = await this.pasarela.consultarReembolso(paymentId, idExterno);
    if (resultado.status !== 'approved' || String(resultado.id) !== idExterno ||
        resultado.amount == null || !(Math.abs(Number(resultado.amount) - Number(reembolso.importe)) <= TOLERANCIA_MONETARIA) ||
        (resultado.payment_id != null && String(resultado.payment_id) !== paymentId))
      throw new ConflictException('Mercado Pago no confirmó una devolución por ese identificador e importe');
    return this.confirmar(id, { referencia: idExterno, idActor, idExterno });
  }

  async ejecutarYConfirmar(id: number, idActor: number): Promise<Reembolso> {
    const reembolso = await this.ejecutar(id, idActor);
    if (!this.estaAprobado(reembolso))
      throw new ConflictException('El reembolso todavía no fue confirmado por Mercado Pago');
    return reembolso;
  }

  estaAprobado(reembolso: Reembolso): boolean {
    return reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO');
  }

  async ejecutar(id: number, idActor: number): Promise<Reembolso> {
    const reembolso = await this.buscar(id);
    this.verificarOrigenOperable(reembolso.origen);
    if (!reembolso.pago.payment_id)
      throw new ConflictException('El pago no tiene identificador de Mercado Pago');
    if (reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO')) return reembolso;

    return this.procesarEnPasarela(reembolso, idActor, false);
  }

  private async procesarEnPasarela(reembolso: Reembolso, idActor: number | null, conciliacion: boolean): Promise<Reembolso> {
    const paymentId = reembolso.pago.payment_id;
    if (!paymentId) throw new ConflictException('El pago no tiene identificador de Mercado Pago');

    const intento = await this.reembolsos.conTransaccion(async (repo) => {
      const actual = await repo.buscarRegistro(reembolso.id, { bloquear: true, idsRelaciones: true });
      if (!actual) throw new NotFoundException('Reembolso no encontrado');
      if (actual.estado === this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO')) return null;
      if (actual.transferencia_manual) {
        if (conciliacion) return null;
        throw new ConflictException('Este reembolso se gestiona por transferencia bancaria');
      }
      const pendiente = actual.estado === this.catalogos.codigoEstado('REEMBOLSO', 'PENDIENTE');
      const recuperable = actual.estado === this.catalogos.codigoEstado('REEMBOLSO', 'EN_PROCESO') ||
        actual.estado === this.catalogos.codigoEstado('REEMBOLSO', 'FALLIDO');
      const ahora = new Date();
      if (conciliacion && (!recuperable || !actual.conciliar_en || actual.conciliar_en > ahora)) return null;
      const programado = actual.conciliar_en && actual.conciliar_en <= ahora;
      if (!conciliacion && !pendiente && !(recuperable && programado)) {
        throw new ConflictException('El reembolso no está disponible para ejecutar');
      }
      // Los reintentos sin identificador se limitan a los intentos recientes.
      if (!pendiente && !actual.id_externo &&
          (!actual.primer_intento_en || ahora.getTime() - actual.primer_intento_en.getTime() > 15 * 60_000)) {
        await repo.actualizar(actual.id, {
          estado: this.catalogos.codigoEstado('REEMBOLSO', 'FALLIDO'),
          conciliar_en: null,
          error_detalle: 'Requiere verificar el reembolso en Mercado Pago antes de volver a ejecutarlo',
        });
        return null;
      }
      const vigencia = new Date(ahora.getTime() + 60_000);
      await repo.actualizar(actual.id, {
        estado: this.catalogos.codigoEstado('REEMBOLSO', 'EN_PROCESO'),
        conciliar_en: vigencia,
        ...(pendiente ? { primer_intento_en: ahora } : {}),
        ...(idActor != null ? { resuelto_por: referenciaUsuario(idActor) } : {}),
      });
      return { id: actual.id, importe: actual.importe, idempotency_key: actual.idempotency_key,
        id_externo: actual.id_externo, vigencia };
    });

    if (!intento) return this.buscar(reembolso.id);
    try {
      const importe = Number(intento.importe);
      const total = Number(reembolso.pago.amount_refunded) === 0 && importe === Number(reembolso.pago.amount);
      const resultado = intento.id_externo
        ? await this.pasarela.consultarReembolso(paymentId, intento.id_externo)
        : await this.pasarela.reembolsar(paymentId, importe, intento.idempotency_key, total);
      const rechazoDefinitivo = ['rejected', 'cancelled', 'failed'].includes(resultado.status ?? '');
      const idExterno = resultado.id == null ? intento.id_externo : String(resultado.id);
      if ((!idExterno && !rechazoDefinitivo) || (intento.id_externo && intento.id_externo !== idExterno))
        throw new ConflictException('La pasarela no confirmó el identificador del reembolso');
      if ((((total && !rechazoDefinitivo) || resultado.amount != null) && !(Math.abs(Number(resultado.amount) - importe) <= TOLERANCIA_MONETARIA)) ||
          (resultado.payment_id != null && String(resultado.payment_id) !== paymentId))
        throw new ConflictException('La devolución informada no coincide con la solicitud');
      const vigente = await this.reembolsos.conTransaccion(async (repo) => {
        const actual = await repo.buscarRegistro(intento.id, { bloquear: true });
        if (!actual) return false;
        if (actual.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'EN_PROCESO') ||
            actual.conciliar_en?.getTime() !== intento.vigencia.getTime()) return false;
        if (actual.id_externo && actual.id_externo !== idExterno)
          throw new ConflictException('La pasarela informó otro identificador para el mismo reembolso');
        await repo.actualizar(actual.id, {
          id_externo: idExterno,
          referencia_externa: idExterno,
          ...(rechazoDefinitivo ? {
            estado: this.catalogos.codigoEstado('REEMBOLSO', 'PENDIENTE'),
            transferencia_manual: true,
            conciliar_en: null,
            error_detalle: 'Mercado Pago rechazó el reembolso. Continuá por transferencia.',
          } : {}),
        });
        return true;
      });
      if (vigente && resultado.status === 'approved' && idExterno)
        return await this.confirmar(intento.id, { referencia: idExterno, idActor, idExterno });
      return this.buscar(intento.id);
    } catch (error) {
      await this.reembolsos.conTransaccion(async (repo) => {
        const actual = await repo.buscarRegistro(intento.id, { bloquear: true });
        if (!actual) return;
        if (actual.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'EN_PROCESO') ||
            actual.conciliar_en?.getTime() !== intento.vigencia.getTime()) return;
        await repo.actualizar(actual.id, {
          estado: this.catalogos.codigoEstado('REEMBOLSO', 'FALLIDO'),
          error_detalle: 'No se pudo confirmar el resultado de Mercado Pago',
        });
      });
      throw error;
    }
  }

  private async confirmar(id: number, datos: { referencia: string; idActor: number | null; idExterno: string | null; transferencia?: boolean; comprobante?: ComprobanteSubido; observacion?: string | null; alGuardarComprobante?: () => void }): Promise<Reembolso> {
    const guardado = await this.reembolsos.conTransaccion(async (repo, transaccion) => {
      const reembolso = await repo.buscarRegistro(id, { bloquear: true, idsRelaciones: true });
      if (!reembolso) throw new NotFoundException('Reembolso no encontrado');
      this.verificarOrigenOperable(reembolso.origen);
      if (datos.transferencia && !reembolso.transferencia_manual)
        throw new ConflictException('El reembolso no está habilitado para transferencia');
      if (reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO')) {
        // Con comprobante, cada registro es único: si ya se aprobó, este archivo no se usa.
        if (datos.transferencia && (datos.comprobante || (reembolso.referencia_externa ?? '') !== datos.referencia))
          throw new ConflictException('Otro administrador ya registró esta devolución');
        return reembolso;
      }
      if (!datos.transferencia && reembolso.id_externo && reembolso.id_externo !== datos.idExterno)
        throw new ConflictException('El reembolso ya está vinculado a otro identificador externo');
      if (!this.estadosActivos.includes(reembolso.estado) ||
          (datos.idExterno == null && (reembolso.conciliar_en || (!datos.transferencia && reembolso.id_externo) ||
            reembolso.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'PENDIENTE'))))
        throw new ConflictException('El reembolso no está disponible para confirmar');

      const pago = await this.pagos.buscarParaReembolso(reembolso.pago.id, transaccion);
      if (!pago) throw new NotFoundException('Pago no encontrado');
      if (Number(reembolso.importe) > this.saldoReembolsable(pago) + TOLERANCIA_MONETARIA)
        throw new ConflictException('El reembolso supera el saldo del pago');

      reembolso.estado = this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO');
      reembolso.referencia_externa = datos.referencia || null;
      reembolso.id_externo = datos.idExterno;
      reembolso.resuelto_en = new Date();
      if (datos.idActor != null) reembolso.resuelto_por = referenciaUsuario(datos.idActor);
      reembolso.error_detalle = null;
      await this.pagos.aplicarReembolso(pago, Number(reembolso.importe), transaccion);
      reembolso.conciliar_en = null;
      await repo.actualizar(reembolso.id, {
        estado: reembolso.estado,
        referencia_externa: reembolso.referencia_externa,
        id_externo: reembolso.id_externo,
        resuelto_en: reembolso.resuelto_en,
        resuelto_por: reembolso.resuelto_por,
        error_detalle: null,
        conciliar_en: null,
        ...(datos.comprobante ? { comprobante_url: datos.comprobante.url, comprobante_nombre: datos.comprobante.nombre, observacion_transferencia: datos.observacion ?? null } : {}),
      });
      return reembolso;
    });
    // Recién con la transacción confirmada el comprobante queda en uso; si algo falló, quien lo subió lo borra.
    if (datos.comprobante) datos.alGuardarComprobante?.();
    return this.buscar(guardado.id);
  }

  async aplicarConfirmado<T>(id: number, aplicar: (reembolso: Reembolso, transaccion: EntityManager) => Promise<T>): Promise<T | null> {
    return this.reembolsos.conTransaccion(async (repo, transaccion) => {
      const registro = await repo.buscarRegistro(id, { bloquear: true });
      if (!registro) throw new NotFoundException('Reembolso no encontrado');
      this.verificarOrigenOperable(registro.origen);
      if (registro.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO'))
        throw new ConflictException('Solo se puede aplicar un reembolso aprobado');
      if (registro.aplicado_en) return null;
      if (registro.revision_aplicacion)
        throw new ConflictException('El reembolso histórico requiere revisar su aplicación');
      const reembolso = await repo.buscarPorId(id);
      if (!reembolso) throw new NotFoundException('Reembolso no encontrado');
      const resultado = await aplicar(reembolso, transaccion);
      await repo.actualizar(id, { aplicado_en: new Date() });
      return resultado;
    });
  }

  async rechazar(id: number, motivo: string, idActor: number | null, confirmadoPorPasarela = false): Promise<Reembolso> {
    const guardado = await this.reembolsos.conTransaccion(async (repo) => {
      const reembolso = await repo.buscarRegistro(id, { bloquear: true });
      if (!reembolso) throw new NotFoundException('Reembolso no encontrado');
      if (reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO'))
        throw new ConflictException('Un reembolso aprobado no puede rechazarse');
      if (reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'RECHAZADO')) return reembolso;
      if (reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'CANCELADO'))
        throw new ConflictException('Un reembolso cancelado no puede rechazarse');
      if (!confirmadoPorPasarela && reembolso.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'PENDIENTE'))
        throw new ConflictException('Solo se puede rechazar una solicitud pendiente');
      reembolso.estado = this.catalogos.codigoEstado('REEMBOLSO', 'RECHAZADO');
      reembolso.error_detalle = motivo.trim();
      reembolso.resuelto_en = new Date();
      reembolso.resuelto_por =
        idActor != null ? referenciaUsuario(idActor) : null;
      await repo.actualizar(id, {
        estado: reembolso.estado, error_detalle: reembolso.error_detalle,
        resuelto_en: reembolso.resuelto_en, resuelto_por: reembolso.resuelto_por, conciliar_en: null,
      });
      return reembolso;
    });
    return this.prepararRespuesta(guardado);
  }

  /** Compensa un reembolso pendiente/fallido; no toca aprobados ni en proceso. */
  async compensar(id: number, idActor: number | null): Promise<boolean> {
    try {
      const reembolso = await this.buscar(id);
      if (
        reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'RECHAZADO') ||
        reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'CANCELADO')
      )
        return true;
      if (
        reembolso.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'PENDIENTE') &&
        reembolso.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'FALLIDO')
      )
        return false;
      const fallido = reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'FALLIDO');
      if (fallido) {
        // Un FALLIDO puede haber salido igual: sin respuesta definitiva de MP
        // se mantiene reservado para no habilitar un segundo reembolso.
        const idExterno = reembolso.id_externo ?? reembolso.referencia_externa;
        if (!reembolso.pago?.payment_id || !idExterno) return false;
        const resultado = await this.pasarela.consultarReembolso(
          reembolso.pago.payment_id,
          idExterno,
        );
        const estado = (resultado.status ?? '').toLowerCase();
        if (!['rejected', 'cancelled', 'failed'].includes(estado)) return false;
      }
      await this.rechazar(
        id,
        'La reserva no se pudo cancelar por el bloqueo del anunciante',
        idActor,
        fallido,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `No se pudo compensar el reembolso ${id}`,
        error as Error,
      );
      return false;
    }
  }

  /**
   * Anula una solicitud de devolución que todavía no movió dinero. No se usa
   * para aprobados ni para reembolsos en proceso de Mercado Pago.
   */
  async cancelar(id: number, motivo: string, idActor: number | null): Promise<Reembolso> {
    const cancelado = await this.reembolsos.actualizarEnTransaccion(
      id,
      (reembolso) => {
        if (reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'CANCELADO')) return;
        if (reembolso.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'PENDIENTE'))
          throw new ConflictException(
            'Solo puede cancelarse un reembolso pendiente',
          );
        reembolso.estado = this.catalogos.codigoEstado('REEMBOLSO', 'CANCELADO');
        reembolso.error_detalle = motivo.trim().slice(0, 500);
        reembolso.resuelto_en = new Date();
        reembolso.resuelto_por =
          idActor != null ? referenciaUsuario(idActor) : null;
      },
    );
    if (!cancelado) throw new NotFoundException('Reembolso no encontrado');
    return this.buscar(cancelado.id);
  }

  /**
   * Concilia un reembolso informado por Mercado Pago que no fue iniciado
   * desde la plataforma. Es idempotente por referencia externa.
   */
  async registrarMovimientosExternos(pago: Pago, movimientos: ResultadoReembolsoExterno[]): Promise<number[]> {
    const ids: number[] = [];
    const aprobados = movimientos.filter(movimiento => movimiento.status === 'approved');
    for (const movimiento of aprobados) {
      const importe = Number(movimiento.amount);
      if (movimiento.id == null || !Number.isFinite(importe) || importe <= 0 ||
          (movimiento.payment_id != null && String(movimiento.payment_id) !== pago.payment_id))
        throw new ConflictException('Mercado Pago informó un movimiento incompleto');
      const idExterno = String(movimiento.id);
      const registrados = await this.reembolsos.buscarPorPago(pago.id);
      const vinculado = await this.reembolsos.buscarPorIdExterno(idExterno);
      if (vinculado) {
        if (!registrados.some(registro => registro.id === vinculado.id) ||
            Math.abs(Number(vinculado.importe) - importe) > TOLERANCIA_MONETARIA)
          throw new ConflictException('El reembolso externo no coincide con su registro local');
        if (vinculado.origen === OrigenReembolso.CONTRACARGO) continue;
        const confirmado = await this.confirmar(vinculado.id, { referencia: idExterno, idActor: null, idExterno });
        if (!confirmado.aplicado_en && !confirmado.revision_aplicacion) ids.push(confirmado.id);
        continue;
      }
      const previo = registrados.find(registro => registro.referencia_externa === idExterno &&
        registro.estado === this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO'));
      if (previo) {
        if (previo.origen !== OrigenReembolso.CONTRACARGO && !previo.aplicado_en && !previo.revision_aplicacion) ids.push(previo.id);
        continue;
      }
      const previoWebhook = await this.reembolsos.buscarPorReferenciaExterna(`mp-refund:${pago.payment_id}`);
      if (previoWebhook?.estado === this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO') &&
          registrados.some(registro => registro.id === previoWebhook.id) &&
          Math.abs(Number(previoWebhook.importe) - importe) <= TOLERANCIA_MONETARIA) {
        if (!previoWebhook.aplicado_en && !previoWebhook.revision_aplicacion) ids.push(previoWebhook.id);
        continue;
      }
      if (registrados.some(registro => !registro.id_externo &&
          (registro.estado === this.catalogos.codigoEstado('REEMBOLSO', 'EN_PROCESO') ||
            registro.estado === this.catalogos.codigoEstado('REEMBOLSO', 'FALLIDO'))))
        throw new ConflictException('Hay un reembolso automático pendiente de identificar');
      const confirmado = await this.registrarDesdeWebhook({
        pago, importe, referenciaExterna: `mp-refund:${idExterno}`, idExterno,
      });
      if (confirmado && !confirmado.aplicado_en && !confirmado.revision_aplicacion) ids.push(confirmado.id);
    }
    return ids;
  }

  private async registrarDesdeWebhook(datos: { pago: Pago; importe: number; referenciaExterna: string; idExterno: string }): Promise<Reembolso | null> {
    const existente = await this.reembolsos.buscarPorReferenciaExterna(
      datos.referenciaExterna,
    );
    if (existente) {
      if (existente.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO'))
        return this.confirmar(existente.id, {
          referencia: datos.referenciaExterna,
          idActor: null,
          idExterno: datos.idExterno,
        });
      return existente;
    }
    const reserva = datos.pago.reserva;
    if (!reserva)
      throw new ConflictException('El pago no tiene una reserva asociada');
    if (this.saldoReembolsable(await this.pagos.buscarPorId(datos.pago.id)) <= TOLERANCIA_MONETARIA) {
      return this.reembolsos.buscarPorReferenciaExterna(datos.referenciaExterna);
    }
    const clave = createHash('sha256').update(datos.referenciaExterna).digest('hex').slice(0, 36);
    const reembolso = await this.crearSolicitud({
      reserva,
      pago: datos.pago,
      tipo:
        Number(datos.importe) >= Number(datos.pago.amount)
          ? TipoReembolso.TOTAL
          : TipoReembolso.PARCIAL,
      origen: OrigenReembolso.AJUSTE_ADMIN,
      importe: Number(datos.importe),
      motivo: 'Reembolso informado por Mercado Pago',
      idSolicitadoPor: null,
      idempotencyKey: clave,
      referenciaInterna: datos.referenciaExterna,
      // El ajuste externo ya ocurrió en Mercado Pago: no debe bloquearse por
      // una devolución de liquidación en curso de la misma reserva.
      permitirMultiplesAjustes: true,
    });
    return this.confirmar(reembolso.id, {
      referencia: datos.referenciaExterna,
      idActor: null,
      idExterno: datos.idExterno,
    });
  }

  async coberturaDevolucion(idReserva: number, pago: Pago) {
    const pagoActual =
      (await this.buscarPagoPorReserva(idReserva)) ?? pago;
    const existentes = await this.listarPorReserva(idReserva);
    return { ...this.calcularCobertura(pagoActual, existentes), pago: pagoActual };
  }

  private calcularCobertura(pago: Pago, existentes: Reembolso[]) {
    const pendientes = existentes.filter(
      (reembolso) =>
        reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'PENDIENTE') ||
        reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'EN_PROCESO'),
    );
    const pendienteTotal = pendientes.reduce(
      (total, reembolso) => total + Number(reembolso.importe),
      0,
    );
    return {
      pendientes,
      aprobado:
        existentes.find(
          (reembolso) => reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO'),
        ) ?? null,
      faltante:
        this.saldoReembolsable(pago) - pendienteTotal,
    };
  }

  async asegurarDevolucion(reserva: Reserva, pago: Pago, existentes: Reembolso[], idAnunciante: number, idAdmin: number, motivo: string) {
    const { pendientes, aprobado, faltante } = this.calcularCobertura(pago, existentes);
    if (
      existentes.some(
        (reembolso) => reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'FALLIDO'),
      )
    )
      return { reembolso: null, pendientes: [], cubre: false, creado: false };
    if (faltante <= TOLERANCIA_MONETARIA) {
      if (!aprobado && pendientes.length === 0)
        return { reembolso: null, pendientes: [], cubre: false, creado: false };
      return {
        reembolso: aprobado,
        pendientes,
        cubre: true,
        creado: false,
      };
    }

    const base = `blq:${idAnunciante}:${reserva.id}`;
    const hayCoberturaParcial = aprobado != null || pendientes.length > 0;
    for (let intento = 0; intento < 2; intento += 1) {
      const clave =
        hayCoberturaParcial || intento > 0
          ? `${base}:c${intento + 1}`
          : base;

      const { reembolso, creado } =
        await this.crearSolicitudConResultado({
          reserva,
          pago,
          tipo:
            faltante >= Number(pago.amount) - TOLERANCIA_MONETARIA
              ? TipoReembolso.TOTAL
              : TipoReembolso.PARCIAL,
          origen: OrigenReembolso.CANCELACION,
          importe: faltante,
          motivo,
          idSolicitadoPor: idAdmin,
          idempotencyKey: clave,
          referenciaInterna: base,
        });

      if (
        reembolso.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'PENDIENTE') &&
        reembolso.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'EN_PROCESO') &&
        reembolso.estado !== this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO')
      )
        continue;

      // Un aprobado devuelto por la clave ya está incluido en el saldo:
      // no cubre el faltante, hay que crear el complemento.
      if (reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO')) continue;
      if (Number(reembolso.importe) < faltante - TOLERANCIA_MONETARIA) continue;

      return {
        reembolso,
        pendientes: [...pendientes, reembolso],
        cubre: true,
        creado,
      };
    }

    return { reembolso: null, pendientes: [], cubre: false, creado: false };
  }

  async buscar(id: number): Promise<Reembolso> {
    const reembolso = await this.reembolsos.buscarPorId(id);
    if (!reembolso) throw new NotFoundException('Reembolso no encontrado');
    return this.prepararRespuesta(reembolso);
  }

  async listarPorReserva(idReserva: number, transaccion?: EntityManager): Promise<Reembolso[]> {
    const repositorio = transaccion ? this.reembolsos.enTransaccion(transaccion) : this.reembolsos;
    const reembolsos = await repositorio.buscarPorReserva(idReserva);
    return reembolsos.map((reembolso) => this.prepararRespuesta(reembolso));
  }

  async buscarPagoPorReserva(idReserva: number, transaccion?: EntityManager): Promise<Pago | null> {
    return this.pagos.buscarPorReserva(idReserva, !transaccion, transaccion);
  }

  requiereTransferencia(pago: Pago): boolean {
    // Un medio confirmado por Mercado Pago usa el mismo circuito de devolución,
    // tanto para tarjetas como para dinero en cuenta. Sin medio, requiere revisión manual.
    return !pago.payment_method_id?.trim();
  }

  async buscarPagoParaReembolsoReserva(idReserva: number, transaccion: EntityManager): Promise<Pago | null> {
    const pago = await this.buscarPagoPorReserva(idReserva, transaccion);
    return pago ? this.pagos.buscarParaReembolso(pago.id, transaccion) : null;
  }

  async tieneDevolucionDeCancelacionActiva(idReserva: number, transaccion?: EntityManager): Promise<boolean> {
    const repositorio = transaccion ? this.reembolsos.enTransaccion(transaccion) : this.reembolsos;
    const reembolsos = await repositorio.buscarPorReserva(idReserva);
    return reembolsos.some((reembolso) =>
      reembolso.origen === OrigenReembolso.CANCELACION && this.estadosActivos.includes(reembolso.estado),
    );
  }

  saldoReembolsable(pago: Pago): number {
    return this.pagos.saldoReembolsable(pago);
  }

  listarPagosPorReservas(idsReserva: number[]): Promise<Pago[]> {
    return this.pagos.listarPorReservas(idsReserva);
  }

  async listarAdministracion(): Promise<Reembolso[]> {
    const reembolsos = await this.reembolsos.listarAdministracion();
    return reembolsos.map((reembolso) => this.prepararRespuesta(reembolso));
  }

  async resumenAdministracion(): Promise<{ pendientes: number; fallidos: number; total: number }> {
    const filas = await this.reembolsos.contarPorEstado();
    const porEstado = new Map(filas.map((fila) => [fila.estado, Number(fila.cantidad)]));
    const pendientes = (porEstado.get(this.catalogos.codigoEstado('REEMBOLSO', 'PENDIENTE')) ?? 0) +
      (porEstado.get(this.catalogos.codigoEstado('REEMBOLSO', 'EN_PROCESO')) ?? 0);
    const fallidos = porEstado.get(this.catalogos.codigoEstado('REEMBOLSO', 'FALLIDO')) ?? 0;
    const total = [...porEstado.values()].reduce((acumulado, cantidad) => acumulado + cantidad, 0);
    return { pendientes, fallidos, total };
  }

  async listarPendientesAplicacion(desdeId = 0): Promise<Reembolso[]> {
    return this.reembolsos.buscarPendientesAplicacion(this.catalogos.codigoEstado('REEMBOLSO', 'APROBADO'), desdeId);
  }

  private verificarOrigenOperable(origen: OrigenReembolso): void {
    if (origen === OrigenReembolso.CONTRACARGO)
      throw new ConflictException('DEPA gestiona los contracargos fuera de la aplicación');
  }

  buscarPorOrigen(origen: OrigenReembolso, referencia: string, transaccion?: EntityManager): Promise<Reembolso | null> {
    const repositorio = transaccion ? this.reembolsos.enTransaccion(transaccion) : this.reembolsos;
    return repositorio.buscarPorOrigen(origen, referencia);
  }

  async listarEnCursoPorReservas(idsReserva: number[]): Promise<Reembolso[]> {
    return this.reembolsos.buscarPorReservasConEstados(idsReserva, this.estadosEnCurso);
  }

  /** Una devolución en curso frena el pago al anunciante; una aprobada ya está descontada del saldo. */
  async tieneDevolucionEnCurso(idReserva: number, transaccion?: EntityManager): Promise<boolean> {
    const repositorio = transaccion ? this.reembolsos.enTransaccion(transaccion) : this.reembolsos;
    return (await repositorio.buscarPorReservasConEstados([idReserva], this.estadosEnCurso)).length > 0;
  }

  private prepararRespuesta(reembolso: Reembolso): Reembolso {
    if (reembolso.reserva?.estado_pago) {
      reembolso.reserva = this.estadoService.prepararRespuesta(reembolso.reserva);
    }
    if (reembolso.pago?.reserva?.estado_pago) {
      reembolso.pago.reserva = this.estadoService.prepararRespuesta(reembolso.pago.reserva);
    }
    return reembolso;
  }

  async reconciliarPendientes(): Promise<void> {
    const estados = [
      this.catalogos.codigoEstado('REEMBOLSO', 'EN_PROCESO'),
      this.catalogos.codigoEstado('REEMBOLSO', 'FALLIDO'),
    ];
    const pendientes = await this.reembolsos.buscarPendientesConciliacion(estados, new Date());
    for (const reembolso of pendientes) {
      try {
        await this.procesarEnPasarela(reembolso, null, true);
      } catch {
        this.logger.warn(`No se pudo conciliar el reembolso ${reembolso.id}`);
      }
    }
  }
}
