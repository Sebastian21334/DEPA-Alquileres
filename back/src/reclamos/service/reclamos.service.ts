import type { DemoraAdministrativaDto } from '../dto/reclamo-demora-administrativa.dto';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { EntityManager } from 'typeorm';
import sharp from 'sharp';
import { TOLERANCIA_MONETARIA } from '../../common/utils/dinero';
import { CancelacionesService } from '../../cancelaciones/service/cancelaciones.service';
import type { FaltanteCancelacionDto, ReclamoRespuestaDto, ReclamarFaltanteCancelacionDto } from '../dto/reclamo-faltante-cancelacion.dto';
import { fechaArgentina, fechaParaMostrar } from '../../common/utils/fechas';
import { AlmacenamientoService } from '../../almacenamiento/service/almacenamiento.service';
import type { Reserva } from '../../reservas/entity/reserva.entity';
import { ReservasService } from '../../reservas/service/reservas.service';
import { ReservaNotificacionesService } from '../../reservas/service/reserva-notificaciones.service';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import { referenciaUsuario } from '../../usuarios/usuario-referencia';
import {
  OrigenReembolso,
  type Reembolso,
  TipoReembolso,
} from '../../reembolsos/entity/reembolso.entity';
import {
  CategoriaReclamo,
  Reclamo,
  ResolucionReclamo,
} from '../entity/reclamo.entity';
import { MAX_INTENTOS_CODIGO } from '../../reservas-consulta/service/reserva-estado.service';
import { ReclamoEvidencia } from '../entity/reclamo-evidencia.entity';
import {
  ReclamoMensaje,
  VisibilidadMensajeReclamo,
} from '../entity/reclamo-mensaje.entity';
import { CrearReclamoDto } from '../dto/crear-reclamo.dto';
import { EnviarMensajeReclamoDto } from '../dto/enviar-mensaje-reclamo.dto';
import { ResolverReclamoDto } from '../dto/resolver-reclamo.dto';
import type { AutorReclamo, ImagenReclamo, MensajeReclamoRespuesta } from '../dto/reclamo-respuesta.dto';
import { RECLAMOS_REPOSITORY } from '../repository/reclamos.repository.interface';
import type { IReclamosRepository } from '../repository/reclamos.repository.interface';
import type { Usuario } from '../../usuarios/entity/usuario.entity';

/** T49: imágenes por envío (al crear el reclamo o en un mensaje) y por reclamo, sumando las de todas las partes. */
export const MAX_IMAGENES_POR_ENVIO = 10;
export const MAX_IMAGENES_POR_RECLAMO = 30;
export const MAX_BYTES_IMAGEN = 5 * 1024 * 1024;
const DIAS_RECLAMO_DEMORA = 7;

interface ImagenPreparada { nombre: string; contenido: Buffer; }
interface ImagenSubida { nombre: string; url: string; }

/** Datos mínimos de un autor: nunca su email, teléfono ni documento. */
function autorRespuesta(usuario: Usuario | null | undefined): AutorReclamo | null {
  if (!usuario) return null;
  return { id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, rol: usuario.rol ? { nombre: usuario.rol.nombre } : null };
}

@Injectable()
export class ReclamosService {
  private readonly logger = new Logger(ReclamosService.name);

  constructor(@Inject(RECLAMOS_REPOSITORY) private readonly reclamos: IReclamosRepository, private readonly reservas: ReservasService, private readonly reembolsos: ReembolsosService, private readonly almacenamientoService: AlmacenamientoService, private readonly catalogos: CatalogosService, private readonly cancelaciones: CancelacionesService, private readonly notificaciones?: ReservaNotificacionesService) {}

  async listarDemorasMias(idUsuario: number): Promise<DemoraAdministrativaDto[]> {
    const solicitudes = await this.cancelaciones.listarDemorasParaReclamo(idUsuario);
    const elegibles = solicitudes.filter(({ reserva }) => !reserva.cancelada && this.reservas.pagoAprobado(reserva) && reserva.fecha_fin && !this.fueraDePlazo(reserva.fecha_fin, fechaArgentina()));
    return Promise.all(elegibles.map(async solicitud => ({ solicitudId: solicitud.id, reservaId: solicitud.reserva.id,
      titulo: solicitud.reserva.publicacion?.titulo ?? 'Alojamiento', fechaInicio: solicitud.reserva.fecha_inicio, fechaSolicitud: solicitud.creada_en,
      reclamoAbierto: await this.reclamos.existeAbierto(solicitud.reserva.id, [this.catalogos.codigoEstado('RECLAMO', 'ABIERTO'), this.catalogos.codigoEstado('RECLAMO', 'EN_REVISION')]) })));
  }

  async consultarFaltanteCancelacion(idReserva: number, idUsuario: number): Promise<FaltanteCancelacionDto> {
    const reserva = await this.reservas.buscarPorId(idReserva, idUsuario);
    this.verificarInquilino(reserva, idUsuario);
    return {
      devolucion: await this.cancelaciones.saldoDevolucion(reserva),
      reclamoAbierto: await this.reclamos.existeAbierto(idReserva, [this.catalogos.codigoEstado('RECLAMO', 'ABIERTO'), this.catalogos.codigoEstado('RECLAMO', 'EN_REVISION')]),
    };
  }

  async reclamarFaltanteCancelacion(idReserva: number, dto: ReclamarFaltanteCancelacionDto, idUsuario: number): Promise<ReclamoRespuestaDto> {
    let idReclamo = 0;
    await this.reservas.conReservaBloqueada(idReserva, async (reserva, transaccion) => {
      this.verificarInquilino(reserva, idUsuario);
      const repo = this.reclamos.enTransaccion(transaccion);
      const saldo = await this.cancelaciones.saldoDevolucion(reserva, transaccion);
      if (!saldo || saldo.importeReclamable <= 0)
        throw new ConflictException('No hay un importe faltante para reclamar; revisá lo devuelto y lo que sigue en gestión');
      if (await repo.existeAbierto(idReserva, [this.catalogos.codigoEstado('RECLAMO', 'ABIERTO'), this.catalogos.codigoEstado('RECLAMO', 'EN_REVISION')]))
        throw new ConflictException('La reserva ya tiene un reclamo abierto');
      const reclamo = await repo.guardar({
        reserva, inquilino: referenciaUsuario(idUsuario), anunciante: reserva.publicacion?.anunciante?.usuario,
        categoria: 'OTRO', descripcion: dto.descripcion.trim(), solicitud_cancelacion_id: saldo.solicitudId,
        estado: this.catalogos.codigoEstado('RECLAMO', 'ABIERTO'), resolucion: null,
        importe_reembolso: null, administrador_resolucion: null, resuelto_en: null,
      });
      idReclamo = reclamo.id;
    });
    const reclamo = await this.obtener(idReclamo, idUsuario, false);
    await this.notificaciones?.avisarCambio(reclamo.reserva, ['inquilino', 'anunciante', 'admin'], 'Reclamo por reembolso faltante', 'Se abrió un reclamo por el importe faltante de una cancelación. Consultá el expediente en DEPA.');
    return reclamo;
  }

  private verificarInquilino(reserva: Reserva, idUsuario: number): void {
    if (!this.reservas.esDelInquilino(reserva, idUsuario))
      throw new ForbiddenException('Solo el Inquilino de la reserva puede reclamar el faltante');
  }

  /** Reclamos que bloquean la liquidación: los de demora administrativa se tramitan sin retenerla. */
  tieneReclamoAbierto(idReserva: number, transaccion: EntityManager): Promise<boolean> {
    return this.reclamos.enTransaccion(transaccion).existeAbierto(idReserva, [
      this.catalogos.codigoEstado('RECLAMO', 'ABIERTO'),
      this.catalogos.codigoEstado('RECLAMO', 'EN_REVISION'),
    ], CategoriaReclamo.DEMORA_ADMINISTRATIVA);
  }

  async crear(dto: CrearReclamoDto, idUsuario: number): Promise<ReclamoRespuestaDto> {
    if (dto.descripcion.trim().length < 20) throw new BadRequestException('La descripción debe tener al menos 20 caracteres de contenido');
    const porDemora = dto.categoria === CategoriaReclamo.DEMORA_ADMINISTRATIVA;
    const pedidoDeCodigo = dto.categoria === CategoriaReclamo.CODIGO_BLOQUEADO;
    let reclamo!: Reclamo;
    const crear = async (reserva: Reserva, transaccion: EntityManager): Promise<Reclamo> => {
      const reclamos = this.reclamos.enTransaccion(transaccion);
      if (pedidoDeCodigo) this.validarPedidoDeCodigo(reserva, idUsuario);
      else if (!porDemora && !this.reservas.esDelInquilino(reserva, idUsuario))
        throw new ForbiddenException(
          'Solo el Inquilino de la reserva puede iniciar un reclamo',
        );
      if (!porDemora && this.reservas.liquidacionResuelta(reserva))
        throw new ConflictException('La liquidación de esta reserva ya fue resuelta');
      if (reserva.estado_pago !== this.catalogos.codigoEstado('PAGO_RESERVA', 'APROBADO'))
        throw new ConflictException('La reserva no tiene un pago aprobado');
      if (reserva.cancelada)
        throw new ConflictException('La reserva está cancelada');
      if (
        !reserva.fecha_inicio ||
        !reserva.fecha_fin ||
        reserva.fecha_inicio > reserva.fecha_fin
      )
        throw new ConflictException('Las fechas de la reserva no son válidas');

      if (!reserva.usuario)
        throw new ConflictException('La reserva no tiene un Inquilino asociado');

      if (porDemora) {
        const hoy = fechaArgentina();
        if (hoy < reserva.fecha_inicio)
          throw new BadRequestException(
            'Antes del inicio usá la solicitud de cancelación; el reclamo es para una estadía iniciada o finalizada',
          );
        if (this.fueraDePlazo(reserva.fecha_fin, hoy))
          throw new BadRequestException(
            `El plazo para reclamar vence a los ${DIAS_RECLAMO_DEMORA} días corridos del fin de la estadía`,
          );
      } else this.validarPeriodoReclamo(reserva);

      if (await reclamos.existeAbierto(reserva.id, [this.catalogos.codigoEstado('RECLAMO', 'ABIERTO'), this.catalogos.codigoEstado('RECLAMO', 'EN_REVISION')]))
        throw new ConflictException('La reserva ya tiene un reclamo abierto');

      const solicitudDemorada = porDemora ? await this.cancelaciones.buscarSolicitudParaReclamoDemora(reserva, idUsuario, transaccion) : null;
      reclamo = await reclamos.guardar({
        reserva,
        inquilino: reserva.usuario,
        anunciante: reserva.publicacion?.anunciante?.usuario ?? undefined,
        categoria: dto.categoria,
        solicitud_cancelacion_id: solicitudDemorada?.id ?? null,
        descripcion: dto.descripcion.trim(),
        estado: this.catalogos.codigoEstado('RECLAMO', 'ABIERTO'),
        resolucion: null,
        importe_reembolso: null,
        administrador_resolucion: null,
        resuelto_en: null,
      });
      return reclamo;
    };
    if (porDemora) await this.reservas.conReservaBloqueada(dto.id_reserva, async (reserva, tx) => { await crear(reserva, tx); });
    else await this.reservas.conReservaParaReclamo(dto.id_reserva, crear, pedidoDeCodigo ? 'Pedido de reinicio del código en revisión' : undefined);
    await this.notificaciones?.avisarCambio(reclamo.reserva, ['inquilino', 'anunciante', 'admin'], porDemora ? 'Reclamo por demora administrativa' : pedidoDeCodigo ? 'Pedido de reinicio del código de alojamiento' : 'Reclamo abierto', 'Se abrió un reclamo sobre la reserva. Podés seguirlo en DEPA.');
    return this.responder(reclamo, false);
  }

  private validarPedidoDeCodigo(reserva: Reserva, idUsuario: number): void {
    if (!this.reservas.esDelAnunciante(reserva, idUsuario))
      throw new ForbiddenException('Solo el anunciante de la reserva puede pedir el reinicio del código');
    if (this.reservas.codigoValidado(reserva))
      throw new ConflictException('El ingreso ya se validó: no hace falta reiniciar el código');
    if (!this.reservas.codigoBloqueado(reserva))
      throw new ConflictException('El código no está bloqueado: todavía podés cargarlo desde la reserva');
  }

  async listarMios(idUsuario: number): Promise<ReclamoRespuestaDto[]> {
    const reclamos = await this.reclamos.listarPorParticipante(idUsuario);
    return Promise.all(reclamos.map((reclamo) => this.responder(reclamo, false)));
  }

  async listarAdministracion(): Promise<ReclamoRespuestaDto[]> {
    const reclamos = await this.reclamos.listarAdministracion();
    return Promise.all(reclamos.map((reclamo) => this.responder(reclamo, true)));
  }

  async obtener(id: number, idUsuario: number, esAdmin: boolean): Promise<ReclamoRespuestaDto> {
    return this.responder(await this.buscarComoParticipante(id, idUsuario, esAdmin), esAdmin);
  }

  /** Imágenes de la descripción: las que se suben al crear el reclamo, sin mensaje. */
  async subirEvidencias(id: number, idUsuario: number, esAdmin: boolean, archivos: Express.Multer.File[]): Promise<ImagenReclamo[]> {
    const reclamo = await this.buscarComoParticipante(id, idUsuario, esAdmin);
    if (!archivos?.length)
      throw new BadRequestException('No se recibieron imágenes');
    this.verificarNoCerrado(reclamo);
    const subidas = await this.subirImagenes(reclamo, await this.prepararImagenes(id, archivos));
    const guardadas = await this.guardarConImagenes(id, subidas, (reclamos) =>
      reclamos.guardarEvidencias(this.evidenciasDe(reclamo, subidas, this.participante(reclamo, idUsuario), null)));
    return this.imagenesRespuesta(guardadas);
  }

  /** T49: el mensaje puede llevar imágenes; con imágenes, el texto es opcional. */
  async enviarMensaje(id: number, dto: EnviarMensajeReclamoDto, idUsuario: number, esAdmin: boolean, archivos: Express.Multer.File[] = []): Promise<MensajeReclamoRespuesta> {
    const reclamo = await this.buscarComoParticipante(id, idUsuario, esAdmin);
    this.verificarNoCerrado(reclamo);
    const visibilidad = dto.visible_para ?? VisibilidadMensajeReclamo.TODOS;
    if (visibilidad === VisibilidadMensajeReclamo.ADMIN && !esAdmin)
      throw new ForbiddenException('Solo el Administrador puede dejar notas internas');
    // Las imágenes de un mensaje las ven todas las partes: una nota interna no puede llevarlas.
    if (visibilidad === VisibilidadMensajeReclamo.ADMIN && archivos.length)
      throw new BadRequestException('Las notas internas no admiten imágenes');
    const texto = dto.texto?.trim() ?? '';
    if (!texto && !archivos.length)
      throw new BadRequestException('Escribí un mensaje o adjuntá al menos una imagen');
    const subidas = archivos.length ? await this.subirImagenes(reclamo, await this.prepararImagenes(id, archivos)) : [];
    const { mensaje, evidencias } = await this.guardarConImagenes(id, subidas, async (reclamos) => {
      if (esAdmin && reclamo.estado === this.catalogos.codigoEstado('RECLAMO', 'ABIERTO')) {
        reclamo.estado = this.catalogos.codigoEstado('RECLAMO', 'EN_REVISION');
        await reclamos.guardar(reclamo);
      }
      const guardado = await reclamos.guardarMensaje({ reclamo, autor: referenciaUsuario(idUsuario), texto, visible_para: visibilidad });
      return {
        mensaje: guardado,
        evidencias: subidas.length ? await reclamos.guardarEvidencias(this.evidenciasDe(reclamo, subidas, guardado.autor, guardado)) : [],
      };
    });
    if (visibilidad === VisibilidadMensajeReclamo.TODOS)
      await this.notificaciones?.avisarCambio(reclamo.reserva, esAdmin ? ['inquilino', 'anunciante'] : ['inquilino', 'anunciante', 'admin'], 'Nuevo mensaje en un reclamo', 'Hay un nuevo mensaje en el expediente. Ingresá a DEPA para leerlo.', idUsuario);
    return this.mensajeRespuesta(mensaje, await this.imagenesRespuesta(evidencias));
  }

  async listarMensajes(id: number, idUsuario: number, esAdmin: boolean): Promise<MensajeReclamoRespuesta[]> {
    return (await this.obtener(id, idUsuario, esAdmin)).mensajes;
  }

  async resolver(id: number, dto: ResolverReclamoDto, idAdmin: number): Promise<ReclamoRespuestaDto> {
    const reclamo = await this.buscarComoParticipante(id, idAdmin, true);
    const estadosCerrados: string[] = [
      this.catalogos.codigoEstado('RECLAMO', 'RESUELTO_INQUILINO'),
      this.catalogos.codigoEstado('RECLAMO', 'RESUELTO_ANUNCIANTE'),
      this.catalogos.codigoEstado('RECLAMO', 'CERRADO'),
    ];
    if (estadosCerrados.includes(reclamo.estado))
      throw new ConflictException('El reclamo ya fue resuelto');
    this.validarResolucionSegunCategoria(reclamo, dto);
    const reserva = reclamo.reserva;

    const referencia = `rec:${id}`;
    const resultado: { reclamo: Reclamo; reembolso?: Reembolso } = { reclamo };
    await this.reservas.conReservaBloqueada(reserva.id, async (actual, transaccion) => {
      const repositorio = this.reclamos.enTransaccion(transaccion);
      const expediente = await repositorio.buscarPorId(id);
      if (!expediente || estadosCerrados.includes(expediente.estado))
        throw new ConflictException('El reclamo ya fue resuelto');
      const previo = await this.reembolsos.buscarPorOrigen(OrigenReembolso.RECLAMO, referencia, transaccion);
      if (expediente.solicitud_cancelacion_id != null && expediente.categoria !== CategoriaReclamo.DEMORA_ADMINISTRATIVA) {
        resultado.reembolso = await this.resolverFaltanteCancelacion(expediente, actual, dto, idAdmin, previo, transaccion);
        resultado.reclamo = await repositorio.guardar(this.registrarDecision(expediente, dto.resolucion, resultado.reembolso ? Number(resultado.reembolso.importe) : null, idAdmin));
        return;
      }
      if (this.esAFavorDelAnunciante(dto.resolucion)) {
        if (previo) throw new ConflictException('El reclamo tiene una devolución registrada');
        // Sin devolución y reinicio del código vuelven a RETENIDO con los intentos en 0 si falta el código.
        expediente.reserva = expediente.categoria === CategoriaReclamo.DEMORA_ADMINISTRATIVA ? actual : dto.resolucion === ResolucionReclamo.CONFIRMAR_INGRESO
          ? await this.reservas.confirmarIngresoSinCodigo(actual, dto.observacion, transaccion)
          : await this.reservas.resolverReclamoSinDevolucion(actual, dto.observacion ?? (
            dto.resolucion === ResolucionReclamo.REINICIAR_CODIGO
              ? `Administración habilitó ${MAX_INTENTOS_CODIGO} intentos más del código` : undefined), transaccion);
        resultado.reclamo = await repositorio.guardar(this.registrarDecision(expediente, dto.resolucion, null, idAdmin));
        return;
      }
      const pago = await this.reembolsos.buscarPagoPorReserva(reserva.id, transaccion);
      if (!pago)
        throw new ConflictException('La reserva no tiene un pago registrado');
      const saldo = this.reembolsos.saldoReembolsable(pago);
      const total = dto.resolucion === ResolucionReclamo.DEVOLUCION_TOTAL;
      if (!previo && total && saldo <= TOLERANCIA_MONETARIA)
        throw new ConflictException('El pago no tiene saldo para devolver');
      const importe = previo ? Number(previo.importe) : total ? saldo : Number(dto.importe ?? 0);
      if (!Number.isFinite(importe) || importe <= 0)
        throw new BadRequestException('Indicá el importe de la devolución parcial');
      // Un parcial por todo el saldo es una devolución total: el reclamo y la reserva tienen que decir lo mismo.
      if (!previo && !total && importe >= saldo - TOLERANCIA_MONETARIA)
        throw new BadRequestException(
          `La devolución parcial tiene que ser menor que el saldo del pago (${pago.currency} ${saldo.toFixed(2)}). Para devolver todo elegí "Devolución total".`,
        );
      const tipo = total ? TipoReembolso.TOTAL : TipoReembolso.PARCIAL;
      if (previo && (previo.tipo !== tipo ||
          (tipo === TipoReembolso.PARCIAL && importe !== Number(dto.importe))))
        throw new ConflictException('El reclamo ya tiene una devolución por otro importe o tipo');
      resultado.reembolso = previo ?? await this.reembolsos.crearSolicitud({
        reserva,
        pago,
        tipo,
        origen: OrigenReembolso.RECLAMO,
        importe,
        motivo: `Reclamo #${reclamo.id}: ${dto.observacion ?? 'resolución favorable al inquilino'}`,
        idSolicitadoPor: idAdmin,
        idempotencyKey: referencia,
        referenciaInterna: referencia,
      }, transaccion);
      // La decisión se registra junto con la devolución; la plata se mueve después.
      resultado.reclamo = await repositorio.guardar(this.registrarDecision(expediente, dto.resolucion, Number(resultado.reembolso.importe), idAdmin));
    });
    if (!resultado.reembolso) {
      const [asunto, mensaje] = this.avisoSinDevolucion(dto.resolucion);
      await this.notificaciones?.avisarCambio(resultado.reclamo.reserva, ['inquilino', 'anunciante'], asunto, mensaje);
      return this.responder(resultado.reclamo, true);
    }
    const aplicado = await this.ejecutarDevolucion(resultado.reembolso, idAdmin);
    if (aplicado)
      await this.notificaciones?.avisarCambio(aplicado.reserva, ['inquilino', 'anunciante'], 'Reclamo resuelto con devolución', 'La devolución quedó registrada y el reclamo se resolvió. Consultá el detalle en DEPA.');
    else
      await this.notificaciones?.avisarCambio(resultado.reclamo.reserva, ['inquilino', 'anunciante'], 'Reclamo resuelto con devolución', 'La administración resolvió el reclamo con devolución. La devolución está en gestión; consultá su estado en DEPA.');
    return this.responder(aplicado ?? await this.buscarComoParticipante(id, idAdmin, true), true);
  }

  /**
   * Mueve la plata de una decisión ya registrada. Si no puede hacerlo ahora
   * (transferencia manual o Mercado Pago no confirma), la devolución sigue en
   * Reembolsos y su conciliación la aplica al reclamo cuando se aprueba.
   */
  private async ejecutarDevolucion(reembolso: Reembolso, idAdmin: number): Promise<Reclamo | null> {
    if (reembolso.transferencia_manual && reembolso.estado === this.catalogos.codigoEstado('REEMBOLSO', 'PENDIENTE'))
      return null;
    try {
      const ejecutado = await this.reembolsos.ejecutar(reembolso.id, idAdmin);
      if (!this.reembolsos.estaAprobado(ejecutado)) return null;
      return await this.reembolsos.aplicarConfirmado(ejecutado.id, (confirmado, transaccion) =>
        this.aplicarResolucionReembolso(confirmado, transaccion),
      );
    } catch (error) {
      this.logger.warn(`La devolución ${reembolso.id} quedó pendiente en Reembolsos: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * T34: el pedido de reinicio del código se resuelve habilitando intentos, confirmando
   * el ingreso o devolviendo el total con motivo. Los demás reclamos conservan sus opciones.
   */
  private async resolverFaltanteCancelacion(reclamo: Reclamo, reserva: Reserva, dto: ResolverReclamoDto, idAdmin: number, previo: Reembolso | null, transaccion: EntityManager): Promise<Reembolso | undefined> {
    if (previo) throw new ConflictException('El reclamo ya tiene una devolución registrada');
    if (dto.resolucion === ResolucionReclamo.SIN_DEVOLUCION) return undefined;
    const saldo = await this.cancelaciones.saldoDevolucion(reserva, transaccion);
    if (!saldo || saldo.solicitudId !== reclamo.solicitud_cancelacion_id || saldo.importeReclamable <= 0)
      throw new ConflictException('El faltante ya está cubierto por devoluciones confirmadas o en gestión');
    const importe = dto.resolucion === ResolucionReclamo.DEVOLUCION_TOTAL ? saldo.importeReclamable : Number(dto.importe);
    if (!Number.isFinite(importe) || importe <= 0 || importe > saldo.importeReclamable)
      throw new BadRequestException('El importe debe ser positivo y no superar el faltante disponible');
    if (dto.resolucion === ResolucionReclamo.DEVOLUCION_PARCIAL && importe >= saldo.importeReclamable)
      throw new BadRequestException('Para completar el faltante elegí "Completar faltante"');
    const pago = await this.reembolsos.buscarPagoPorReserva(reserva.id, transaccion);
    if (!pago) throw new ConflictException('La reserva no tiene un pago registrado');
    const referencia = `rec:${reclamo.id}`;
    return this.reembolsos.crearSolicitud({
      reserva, pago, importe, tipo: importe >= this.reembolsos.saldoReembolsable(pago) ? TipoReembolso.TOTAL : TipoReembolso.PARCIAL,
      origen: OrigenReembolso.RECLAMO, motivo: `Reclamo #${reclamo.id}: ${dto.observacion ?? 'faltante de cancelación'}`,
      idSolicitadoPor: idAdmin, idempotencyKey: referencia, referenciaInterna: referencia,
    }, transaccion);
  }

  private validarResolucionSegunCategoria(reclamo: Reclamo, dto: ResolverReclamoDto): void {
    const pedidoDeCodigo = reclamo.categoria === CategoriaReclamo.CODIGO_BLOQUEADO;
    const permitidas: ResolucionReclamo[] = pedidoDeCodigo
      ? [ResolucionReclamo.REINICIAR_CODIGO, ResolucionReclamo.CONFIRMAR_INGRESO, ResolucionReclamo.DEVOLUCION_TOTAL]
      : [ResolucionReclamo.SIN_DEVOLUCION, ResolucionReclamo.DEVOLUCION_TOTAL, ResolucionReclamo.DEVOLUCION_PARCIAL];
    if (!permitidas.includes(dto.resolucion))
      throw new BadRequestException(pedidoDeCodigo
        ? 'Un pedido de reinicio del código se resuelve habilitando más intentos, confirmando el ingreso o devolviendo el total'
        : 'Esa resolución solo corresponde a un pedido de reinicio del código');
    if (pedidoDeCodigo && dto.resolucion === ResolucionReclamo.DEVOLUCION_TOTAL && !dto.observacion?.trim())
      throw new BadRequestException('Indicá el motivo de la devolución al inquilino');
  }

  private esAFavorDelAnunciante(resolucion: ResolucionReclamo): boolean {
    const aFavorDelAnunciante: ResolucionReclamo[] = [
      ResolucionReclamo.SIN_DEVOLUCION, ResolucionReclamo.REINICIAR_CODIGO, ResolucionReclamo.CONFIRMAR_INGRESO,
    ];
    return aFavorDelAnunciante.includes(resolucion);
  }

  private avisoSinDevolucion(resolucion: ResolucionReclamo): [string, string] {
    if (resolucion === ResolucionReclamo.REINICIAR_CODIGO)
      return ['Código de alojamiento reiniciado', `La administración habilitó ${MAX_INTENTOS_CODIGO} intentos más para validar el código de alojamiento. Consultá el detalle en DEPA.`];
    if (resolucion === ResolucionReclamo.CONFIRMAR_INGRESO)
      return ['Ingreso confirmado por la administración', 'La administración confirmó el ingreso sin el código de alojamiento. El pago al anunciante sigue los plazos habituales. Consultá el detalle en DEPA.'];
    return ['Reclamo resuelto', 'La administración resolvió el reclamo sin devolución. Consultá el expediente en DEPA.'];
  }

  /** Registra la decisión del administrador sobre el reclamo; las asignaciones viven en el servicio. */
  private registrarDecision(reclamo: Reclamo, resolucion: ResolucionReclamo, importe: number | null, idAdmin: number | null): Reclamo {
    reclamo.estado = this.esAFavorDelAnunciante(resolucion)
      ? this.catalogos.codigoEstado('RECLAMO', 'RESUELTO_ANUNCIANTE')
      : this.catalogos.codigoEstado('RECLAMO', 'RESUELTO_INQUILINO');
    reclamo.resolucion = resolucion;
    reclamo.importe_reembolso = importe;
    reclamo.administrador_resolucion = idAdmin != null ? referenciaUsuario(idAdmin) : null;
    reclamo.resuelto_en = new Date();
    return reclamo;
  }

  async aplicarResolucionReembolso(reembolso: Reembolso, transaccion: EntityManager): Promise<Reclamo> {
    const id = Number(reembolso.referencia_interna?.split(':')[1]);
    const reclamos = this.reclamos.enTransaccion(transaccion);
    const reclamo = Number.isSafeInteger(id) ? await reclamos.buscarPorId(id) : null;
    if (!reclamo || reclamo.reserva.id !== reembolso.reserva.id)
      throw new ConflictException('El reembolso requiere identificar el reclamo de origen');
    if (reclamo.estado === this.catalogos.codigoEstado('RECLAMO', 'RESUELTO_ANUNCIANTE'))
      throw new ConflictException('El reclamo tiene una resolución incompatible con el reembolso');
    reclamo.reserva = await this.reservas.aplicarEfectoReembolso(reembolso, transaccion,
      reembolso.motivo.replace(/^Reclamo #\d+: /, ''));
    // La decisión ya quedó registrada al resolver; los reclamos anteriores a ese
    // cambio la completan recién cuando se confirma la devolución.
    if (!reclamo.resuelto_en) {
      const resolucion = reembolso.tipo === TipoReembolso.TOTAL
        ? ResolucionReclamo.DEVOLUCION_TOTAL : ResolucionReclamo.DEVOLUCION_PARCIAL;
      this.registrarDecision(reclamo, resolucion, Number(reembolso.importe),
        reembolso.resuelto_por?.id ?? reembolso.solicitado_por?.id ?? null);
    }
    return reclamos.guardar(reclamo);
  }

  private async buscarComoParticipante(id: number, idUsuario: number, esAdmin: boolean): Promise<Reclamo> {
    const reclamo = await this.reclamos.buscarPorId(id);
    if (!reclamo) throw new NotFoundException('Reclamo no encontrado');
    if (!esAdmin) this.verificarParticipante(reclamo, idUsuario);
    return reclamo;
  }

  private verificarParticipante(reclamo: Reclamo, idUsuario: number): void {
    if (
      reclamo.inquilino?.id !== idUsuario &&
      reclamo.anunciante?.id !== idUsuario
    )
      throw new ForbiddenException('No formás parte de este reclamo');
  }

  private verificarNoCerrado(reclamo: Reclamo): void {
    if (reclamo.estado === this.catalogos.codigoEstado('RECLAMO', 'CERRADO'))
      throw new ConflictException('El reclamo está cerrado');
  }

  private participante(reclamo: Reclamo, idUsuario: number): Usuario {
    return [reclamo.inquilino, reclamo.anunciante].find((usuario) => usuario?.id === idUsuario) ?? referenciaUsuario(idUsuario);
  }

  /**
   * Respuesta de un reclamo: sin notas internas para las partes y con los datos mínimos de cada autor.
   * T49: cada imagen va en su mensaje o, si no tiene, en la descripción, con un enlace firmado de 15 minutos.
   */
  private async responder(reclamo: Reclamo, esAdmin: boolean): Promise<ReclamoRespuestaDto> {
    const mensajes = (reclamo.mensajes ?? [])
      .filter((mensaje) => esAdmin || mensaje.visible_para === VisibilidadMensajeReclamo.TODOS)
      .sort((a, b) => a.id - b.id);
    const imagenes = await this.imagenesRespuesta((reclamo.evidencias ?? []).filter((evidencia) => esAdmin || this.visibleParaLasPartes(evidencia)));
    const respuesta: ReclamoRespuestaDto = Object.assign(this.prepararRespuesta(reclamo), {
      evidencias: imagenes.filter((imagen) => imagen.id_mensaje === null),
      mensajes: mensajes.map((mensaje) => this.mensajeRespuesta(mensaje, imagenes.filter((imagen) => imagen.id_mensaje === mensaje.id))),
    });
    if (reclamo.solicitud_cancelacion_id != null && reclamo.categoria !== CategoriaReclamo.DEMORA_ADMINISTRATIVA)
      respuesta.devolucion_cancelacion = await this.cancelaciones.saldoDevolucion(reclamo.reserva);
    return respuesta;
  }

  private mensajeRespuesta(mensaje: ReclamoMensaje, evidencias: ImagenReclamo[]): MensajeReclamoRespuesta {
    return { id: mensaje.id, texto: mensaje.texto, visible_para: mensaje.visible_para, creado_en: mensaje.creado_en, autor: autorRespuesta(mensaje.autor), evidencias };
  }

  private imagenesRespuesta(evidencias: ReclamoEvidencia[]): Promise<ImagenReclamo[]> {
    return Promise.all([...evidencias].sort((a, b) => a.id - b.id).map(async (evidencia) => ({
      id: evidencia.id,
      id_mensaje: evidencia.mensaje?.id ?? null,
      nombre_archivo: evidencia.nombre_archivo,
      creado_en: evidencia.creado_en,
      autor: autorRespuesta(evidencia.usuario),
      url: await this.almacenamientoService.firmarArchivo('reclamos', evidencia.url),
    })));
  }

  private visibleParaLasPartes(evidencia: ReclamoEvidencia): boolean {
    return !evidencia.mensaje || evidencia.mensaje.visible_para === VisibilidadMensajeReclamo.TODOS;
  }

  /** T49: valida y reduce todas las imágenes antes de subir ninguna, así un archivo inválido no deja otros subidos. */
  private async prepararImagenes(idReclamo: number, archivos: Express.Multer.File[]): Promise<ImagenPreparada[]> {
    if (archivos.length > MAX_IMAGENES_POR_ENVIO)
      throw new BadRequestException(`Podés adjuntar hasta ${MAX_IMAGENES_POR_ENVIO} imágenes por envío`);
    await this.verificarCupo(this.reclamos, idReclamo, archivos.length);
    const imagenes: ImagenPreparada[] = [];
    for (const archivo of archivos) {
      if (archivo.size > MAX_BYTES_IMAGEN)
        throw new BadRequestException('Cada imagen puede pesar hasta 5 MB');
      if (!['image/jpeg', 'image/png'].includes(archivo.mimetype))
        throw new BadRequestException('Solo se admiten imágenes JPEG o PNG');
      try {
        const contenido = await sharp(archivo.buffer)
          .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
        imagenes.push({ nombre: archivo.originalname.slice(0, 255), contenido });
      } catch {
        throw new BadRequestException('El archivo no es una imagen válida');
      }
    }
    return imagenes;
  }

  private async verificarCupo(reclamos: IReclamosRepository, idReclamo: number, nuevas: number): Promise<void> {
    const existentes = await reclamos.contarEvidencias(idReclamo);
    if (existentes + nuevas <= MAX_IMAGENES_POR_RECLAMO) return;
    const disponibles = MAX_IMAGENES_POR_RECLAMO - existentes;
    throw new BadRequestException(disponibles > 0
      ? `Un reclamo admite hasta ${MAX_IMAGENES_POR_RECLAMO} imágenes: podés adjuntar ${disponibles} más`
      : `El reclamo ya tiene las ${MAX_IMAGENES_POR_RECLAMO} imágenes permitidas`);
  }

  private async subirImagenes(reclamo: Reclamo, imagenes: ImagenPreparada[]): Promise<ImagenSubida[]> {
    const subidas: ImagenSubida[] = [];
    try {
      for (const { nombre, contenido } of imagenes) {
        const url = await this.almacenamientoService.subir('reclamos', `reservas/${reclamo.reserva.id}/reclamos/${reclamo.id}-${randomUUID()}.jpg`, contenido, 'image/jpeg');
        subidas.push({ nombre, url });
      }
      return subidas;
    } catch (error) {
      await this.borrarImagenes(subidas);
      throw error;
    }
  }

  /** T49: guarda en una transacción lo que acompaña a las imágenes ya subidas; si algo falla, las borra. */
  private async guardarConImagenes<T>(idReclamo: number, subidas: ImagenSubida[], guardar: (reclamos: IReclamosRepository) => Promise<T>): Promise<T> {
    let guardado = false;
    try {
      const resultado = await this.reclamos.transaccion(async (reclamos) => {
        if (subidas.length) {
          // Otro envío pudo ocupar el cupo mientras se subían los archivos.
          await reclamos.bloquear(idReclamo);
          await this.verificarCupo(reclamos, idReclamo, subidas.length);
        }
        return guardar(reclamos);
      });
      guardado = true;
      return resultado;
    } finally {
      if (!guardado) await this.borrarImagenes(subidas);
    }
  }

  private async borrarImagenes(subidas: ImagenSubida[]): Promise<void> {
    await Promise.all(subidas.map(({ url }) => this.almacenamientoService.eliminarArchivo('reclamos', url).catch((error: Error) =>
      this.logger.warn(`No se pudo borrar una imagen de reclamo que no se guardó: ${error.message}`))));
  }

  private evidenciasDe(reclamo: Reclamo, subidas: ImagenSubida[], usuario: Usuario, mensaje: ReclamoMensaje | null): Partial<ReclamoEvidencia>[] {
    return subidas.map(({ url, nombre }) => ({ reclamo, usuario, mensaje, url, nombre_archivo: nombre, tipo: 'image/jpeg' }));
  }

  private prepararRespuesta(reclamo: Reclamo): Reclamo {
    return Object.assign(reclamo, {
      reserva: this.reservas.prepararRespuesta(reclamo.reserva),
    });
  }

  private validarPeriodoReclamo(reserva: Reserva): void {
    const hoy = fechaArgentina();
    if (reserva.fecha_inicio && hoy < reserva.fecha_inicio)
      throw new BadRequestException(
        `Podés reclamar desde el ${fechaParaMostrar(reserva.fecha_inicio)}, cuando empieza la estadía. Antes usá la solicitud de cancelación.`,
      );
    const finPlazo = this.reservas.finPlazoReclamo(reserva);
    if (finPlazo && hoy > finPlazo)
      throw new BadRequestException(
        `El plazo para reclamar terminó el ${fechaParaMostrar(finPlazo)}, antes de que se habilite el pago al anunciante.`,
      );
  }
  private fueraDePlazo(fechaFin: string, hoy: string): boolean {
    const fin = new Date(`${fechaFin}T12:00:00Z`).getTime();
    const actual = new Date(`${hoy}T12:00:00Z`).getTime();
    return actual > fin + DIAS_RECLAMO_DEMORA * 86_400_000;
  }
}
