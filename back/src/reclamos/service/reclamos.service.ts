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
import { fechaArgentina } from '../../common/utils/fechas';
import { CancelacionesService } from '../../cancelaciones/service/cancelaciones.service';
import type { Reserva } from '../../reservas/entity/reserva.entity';
import type { FaltanteCancelacionDto, ReclamoRespuestaDto, ReclamarFaltanteCancelacionDto } from '../dto/reclamo-faltante-cancelacion.dto';
import { AlmacenamientoService } from '../../almacenamiento/service/almacenamiento.service';
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
  Reclamo,
  ResolucionReclamo,
} from '../entity/reclamo.entity';
import { ReclamoEvidencia } from '../entity/reclamo-evidencia.entity';
import {
  ReclamoMensaje,
  VisibilidadMensajeReclamo,
} from '../entity/reclamo-mensaje.entity';
import { CrearReclamoDto } from '../dto/crear-reclamo.dto';
import { EnviarMensajeReclamoDto } from '../dto/enviar-mensaje-reclamo.dto';
import { ResolverReclamoDto } from '../dto/resolver-reclamo.dto';
import { RECLAMOS_REPOSITORY } from '../repository/reclamos.repository.interface';
import type { IReclamosRepository } from '../repository/reclamos.repository.interface';

const DIAS_RECLAMO = 7;
const MAX_EVIDENCIAS = 5;
const MAX_BYTES = 5 * 1024 * 1024;

@Injectable()
export class ReclamosService {
  private readonly logger = new Logger(ReclamosService.name);

  constructor(@Inject(RECLAMOS_REPOSITORY) private readonly reclamos: IReclamosRepository, private readonly reservas: ReservasService, private readonly reembolsos: ReembolsosService, private readonly almacenamientoService: AlmacenamientoService, private readonly catalogos: CatalogosService, private readonly cancelaciones: CancelacionesService, private readonly notificaciones?: ReservaNotificacionesService) {}

  async listarDemorasMias(idUsuario: number): Promise<DemoraAdministrativaDto[]> {
    const solicitudes = await this.cancelaciones.listarDemorasParaReclamo(idUsuario);
    const elegibles = solicitudes.filter(({ reserva }) => !reserva.cancelada && this.reservas.pagoAprobado(reserva) && reserva.fecha_fin && !this.fueraDePlazo(reserva.fecha_fin, fechaArgentina()));
    return Promise.all(elegibles.map(async solicitud => ({ solicitudId: solicitud.id, reservaId: solicitud.reserva.id,
      titulo: solicitud.reserva.publicacion?.titulo ?? 'Alojamiento', fechaInicio: solicitud.reserva.fecha_inicio, fechaSolicitud: solicitud.creada_en,
      reclamoAbierto: await this.reclamos.existeAbierto(solicitud.reserva.id, ['ABIERTO','EN_REVISION']) })));
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

  async crear(dto: CrearReclamoDto, idUsuario: number): Promise<Reclamo> {
    if (dto.descripcion.trim().length < 20) throw new BadRequestException('La descripción debe tener al menos 20 caracteres de contenido');
    const porDemora = dto.categoria === 'DEMORA_ADMINISTRATIVA';
    let reclamo!: Reclamo;
    const crear = async (reserva: Reserva, transaccion: EntityManager): Promise<Reclamo> => {
      const reclamos = this.reclamos.enTransaccion(transaccion);
      if (!porDemora && !this.reservas.esDelInquilino(reserva, idUsuario))
        throw new ForbiddenException(
          'Solo el Inquilino de la reserva puede iniciar un reclamo',
        );
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

      const hoy = fechaArgentina();
      if (hoy < reserva.fecha_inicio)
        throw new BadRequestException(
          'Antes del inicio usá la solicitud de cancelación; el reclamo es para una estadía iniciada o finalizada',
        );
      if (this.fueraDePlazo(reserva.fecha_fin, hoy))
        throw new BadRequestException(
          `El plazo para reclamar vence a los ${DIAS_RECLAMO} días corridos del fin de la estadía`,
        );

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
    else await this.reservas.conReservaParaReclamo(dto.id_reserva, crear);
    await this.notificaciones?.avisarCambio(reclamo.reserva, ['inquilino', 'anunciante', 'admin'], porDemora ? 'Reclamo por demora administrativa' : 'Reclamo abierto', 'Se abrió un reclamo sobre la reserva. Podés seguirlo en DEPA.');
    return this.prepararRespuesta(reclamo);
  }

  async listarMios(idUsuario: number): Promise<ReclamoRespuestaDto[]> {
    const reclamos = await this.reclamos.listarPorParticipante(idUsuario);
    return Promise.all(reclamos.map((reclamo) => this.prepararFaltante(this.sinNotasInternas(reclamo))));
  }

  async listarAdministracion(): Promise<ReclamoRespuestaDto[]> {
    const reclamos = await this.reclamos.listarAdministracion();
    return Promise.all(reclamos.map((reclamo) => this.prepararFaltante(reclamo)));
  }

  async obtener(id: number, idUsuario: number, esAdmin: boolean): Promise<ReclamoRespuestaDto> {
    const reclamo = await this.reclamos.buscarPorId(id);
    if (!reclamo) throw new NotFoundException('Reclamo no encontrado');
    if (esAdmin) return this.prepararFaltante(reclamo);
    this.verificarParticipante(reclamo, idUsuario);
    return this.prepararFaltante(this.sinNotasInternas(reclamo));
  }

  async subirEvidencias(id: number, idUsuario: number, esAdmin: boolean, archivos: Express.Multer.File[]): Promise<ReclamoEvidencia[]> {
    const reclamo = await this.obtener(id, idUsuario, esAdmin);
    if (!archivos?.length)
      throw new BadRequestException('No se recibieron imágenes');
    if (reclamo.estado === this.catalogos.codigoEstado('RECLAMO', 'CERRADO'))
      throw new ConflictException('El reclamo está cerrado');
    const existentes = await this.reclamos.contarEvidencias(id);
    if (existentes + archivos.length > MAX_EVIDENCIAS)
      throw new BadRequestException(
        `Un reclamo admite hasta ${MAX_EVIDENCIAS} imágenes`,
      );

    const guardadas: ReclamoEvidencia[] = [];
    for (const archivo of archivos) {
      if (archivo.size > MAX_BYTES)
        throw new BadRequestException('Cada imagen puede pesar hasta 5 MB');
      if (!['image/jpeg', 'image/png'].includes(archivo.mimetype))
        throw new BadRequestException('Solo se admiten imágenes JPEG o PNG');
      let contenido: Buffer;
      try {
        contenido = await sharp(archivo.buffer)
          .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
      } catch {
        throw new BadRequestException('El archivo no es una imagen válida');
      }
      const url = await this.almacenamientoService.subir(
        'reclamos',
        `reservas/${reclamo.reserva.id}/reclamos/${id}-${randomUUID()}.jpg`,
        contenido,
        'image/jpeg',
      );
      const evidencia = await this.reclamos.guardarEvidencia({
        reclamo,
        usuario: referenciaUsuario(idUsuario),
        url,
        nombre_archivo: archivo.originalname.slice(0, 255),
        tipo: 'image/jpeg',
      });
      evidencia.reclamo = this.prepararRespuesta(evidencia.reclamo);
      guardadas.push(evidencia);
    }
    return guardadas;
  }

  async urlEvidencia(idReclamo: number, idEvidencia: number, idUsuario: number, esAdmin: boolean): Promise<{ url: string }> {
    await this.obtener(idReclamo, idUsuario, esAdmin);
    const evidencia = await this.reclamos.buscarEvidencia(idReclamo, idEvidencia);
    if (!evidencia) throw new NotFoundException('Evidencia no encontrada');
    return {
      url: await this.almacenamientoService.firmarArchivo('reclamos', evidencia.url),
    };
  }

  async enviarMensaje(id: number, dto: EnviarMensajeReclamoDto, idUsuario: number, esAdmin: boolean): Promise<ReclamoMensaje> {
    const reclamo = await this.obtener(id, idUsuario, esAdmin);
    if (reclamo.estado === this.catalogos.codigoEstado('RECLAMO', 'CERRADO'))
      throw new ConflictException('El reclamo está cerrado');
    if (dto.visible_para === VisibilidadMensajeReclamo.ADMIN && !esAdmin)
      throw new ForbiddenException('Solo el Administrador puede dejar notas internas');
    if (esAdmin && reclamo.estado === this.catalogos.codigoEstado('RECLAMO', 'ABIERTO')) {
      reclamo.estado = this.catalogos.codigoEstado('RECLAMO', 'EN_REVISION');
      await this.reclamos.guardar(reclamo);
    }
    const mensaje = await this.reclamos.guardarMensaje({
      reclamo,
      autor: referenciaUsuario(idUsuario),
      texto: dto.texto.trim(),
      visible_para: dto.visible_para ?? VisibilidadMensajeReclamo.TODOS,
    });
    if (mensaje.visible_para === VisibilidadMensajeReclamo.TODOS)
      await this.notificaciones?.avisarCambio(reclamo.reserva, esAdmin ? ['inquilino', 'anunciante'] : ['inquilino', 'anunciante', 'admin'], 'Nuevo mensaje en un reclamo', 'Hay un nuevo mensaje en el expediente. Ingresá a DEPA para leerlo.', idUsuario);
    mensaje.reclamo = this.prepararRespuesta(mensaje.reclamo);
    return mensaje;
  }

  async listarMensajes(id: number, idUsuario: number, esAdmin: boolean): Promise<ReclamoMensaje[]> {
    const reclamo = await this.obtener(id, idUsuario, esAdmin);
    return reclamo.mensajes
      .filter(
        (mensaje) =>
          esAdmin || mensaje.visible_para === VisibilidadMensajeReclamo.TODOS,
      )
      .sort((a, b) => a.id - b.id);
  }

  async resolver(id: number, dto: ResolverReclamoDto, idAdmin: number): Promise<Reclamo> {
    const reclamo = await this.obtener(id, idAdmin, true);
    const estadosCerrados: string[] = [
      this.catalogos.codigoEstado('RECLAMO', 'RESUELTO_INQUILINO'),
      this.catalogos.codigoEstado('RECLAMO', 'RESUELTO_ANUNCIANTE'),
      this.catalogos.codigoEstado('RECLAMO', 'CERRADO'),
    ];
    if (estadosCerrados.includes(reclamo.estado))
      throw new ConflictException('El reclamo ya fue resuelto');
    const reserva = reclamo.reserva;

    const referencia = `rec:${id}`;
    const resultado: { reclamo: Reclamo; reembolso?: Reembolso } = { reclamo };
    await this.reservas.conReservaBloqueada(reserva.id, async (actual, transaccion) => {
      const repositorio = this.reclamos.enTransaccion(transaccion);
      const expediente = await repositorio.buscarPorId(id);
      if (!expediente || estadosCerrados.includes(expediente.estado))
        throw new ConflictException('El reclamo ya fue resuelto');
      const previo = await this.reembolsos.buscarPorOrigen(OrigenReembolso.RECLAMO, referencia, transaccion);
      if (expediente.solicitud_cancelacion_id != null && expediente.categoria !== 'DEMORA_ADMINISTRATIVA') {
        resultado.reembolso = await this.resolverFaltanteCancelacion(expediente, actual, dto, idAdmin, previo, transaccion);
        resultado.reclamo = await repositorio.guardar(this.registrarDecision(expediente, dto.resolucion, resultado.reembolso ? Number(resultado.reembolso.importe) : null, idAdmin));
        return;
      }
      if (dto.resolucion === ResolucionReclamo.SIN_DEVOLUCION) {
        if (previo) throw new ConflictException('El reclamo tiene una devolución registrada');
        expediente.reserva = expediente.categoria === 'DEMORA_ADMINISTRATIVA' ? actual : await this.reservas.resolverReclamoSinDevolucion(actual, dto.observacion, transaccion);
        resultado.reclamo = await repositorio.guardar(this.registrarDecision(expediente, ResolucionReclamo.SIN_DEVOLUCION, null, idAdmin));
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
      await this.notificaciones?.avisarCambio(resultado.reclamo.reserva, ['inquilino', 'anunciante'], 'Reclamo resuelto', 'La administración resolvió el reclamo sin devolución. Consultá el expediente en DEPA.');
      return this.prepararRespuesta(resultado.reclamo);
    }
    const aplicado = await this.ejecutarDevolucion(resultado.reembolso, idAdmin);
    if (aplicado)
      await this.notificaciones?.avisarCambio(aplicado.reserva, ['inquilino', 'anunciante'], 'Reclamo resuelto con devolución', 'La devolución quedó registrada y el reclamo se resolvió. Consultá el detalle en DEPA.');
    else
      await this.notificaciones?.avisarCambio(resultado.reclamo.reserva, ['inquilino', 'anunciante'], 'Reclamo resuelto con devolución', 'La administración resolvió el reclamo con devolución. La devolución está en gestión; consultá su estado en DEPA.');
    return this.prepararRespuesta(aplicado ?? await this.obtener(id, idAdmin, true));
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

  private async prepararFaltante(reclamo: Reclamo): Promise<ReclamoRespuestaDto> {
    const respuesta = this.prepararRespuesta(reclamo);
    if (reclamo.solicitud_cancelacion_id == null || reclamo.categoria === 'DEMORA_ADMINISTRATIVA') return respuesta;
    return { ...respuesta, devolucion_cancelacion: await this.cancelaciones.saldoDevolucion(reclamo.reserva) };
  }

  /** Registra la decisión del administrador sobre el reclamo; las asignaciones viven en el servicio. */
  private registrarDecision(reclamo: Reclamo, resolucion: ResolucionReclamo, importe: number | null, idAdmin: number | null): Reclamo {
    reclamo.estado = resolucion === ResolucionReclamo.SIN_DEVOLUCION
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

  private verificarParticipante(reclamo: Reclamo, idUsuario: number): void {
    if (
      reclamo.inquilino?.id !== idUsuario &&
      reclamo.anunciante?.id !== idUsuario
    )
      throw new ForbiddenException('No formás parte de este reclamo');
  }

  private sinNotasInternas(reclamo: Reclamo): Reclamo {
    reclamo.mensajes = (reclamo.mensajes ?? []).filter(
      (mensaje) => mensaje.visible_para === VisibilidadMensajeReclamo.TODOS,
    );
    return this.prepararRespuesta(reclamo);
  }

  private prepararRespuesta(reclamo: Reclamo): Reclamo {
    return Object.assign(reclamo, {
      reserva: this.reservas.prepararRespuesta(reclamo.reserva),
    });
  }

  private fueraDePlazo(fechaFin: string, hoy: string): boolean {
    const fin = new Date(`${fechaFin}T12:00:00Z`).getTime();
    const actual = new Date(`${hoy}T12:00:00Z`).getTime();
    return actual > fin + DIAS_RECLAMO * 86_400_000;
  }
}
