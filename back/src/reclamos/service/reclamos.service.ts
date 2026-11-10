import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { fechaArgentina } from '../../common/utils/fechas';
import {
  ARCHIVO_REPOSITORY,
  type IArchivoRepository,
} from '../../common/almacenamiento/archivo.repository.interface';
import { EstadoPagoReserva } from '../../reservas/entity/reserva.entity';
import { ReservaCancelacionesService } from '../../reservas/service/reserva-cancelaciones.service';
import { ReservaCicloVidaService } from '../../reservas/service/reserva-ciclo-vida.service';
import { ReservaEstadoService } from '../../reservas/service/reserva-estado.service';
import { PagosService } from '../../pagos/service/pagos.service';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import {
  EstadoReembolso,
  OrigenReembolso,
  TipoReembolso,
} from '../../reembolsos/entity/reembolso.entity';
import {
  EstadoReclamo,
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
import {
  RECLAMOS_REPOSITORY,
  type IReclamosRepository,
} from '../repository/reclamos.repository.interface';
import { TOLERANCIA_MONETARIA } from '../../common/utils/dinero';
import { referenciaUsuario } from '../../usuarios/usuario-referencia';
import {
  RECLAMOS_UOW,
  type IReclamosUnitOfWork,
} from '../persistence/reclamos.unit-of-work.interface';
import { NotificacionesService } from '../../notificaciones/service/notificaciones.service';

const DIAS_RECLAMO = 7;
const MAX_EVIDENCIAS = 5;
const MAX_BYTES = 5 * 1024 * 1024;

@Injectable()
export class ReclamosService {
  constructor(
    @Inject(RECLAMOS_REPOSITORY)
    private readonly reclamos: IReclamosRepository,
    private readonly cancelaciones: ReservaCancelacionesService,
    private readonly pagosService: PagosService,
    private readonly reembolsos: ReembolsosService,
    private readonly ciclo: ReservaCicloVidaService,
    private readonly estado: ReservaEstadoService,
    @Inject(ARCHIVO_REPOSITORY)
    private readonly archivos: IArchivoRepository,
    @Inject(RECLAMOS_UOW)
    private readonly uow: IReclamosUnitOfWork,
    @Optional()
    private readonly notificaciones?: NotificacionesService,
  ) {}

  async crear(dto: CrearReclamoDto, idUsuario: number): Promise<Reclamo> {
    const creado = await this.uow.ejecutar(async ({ reclamos, reservas }) => {
      const reserva = await reservas.buscarPorId(dto.id_reserva);
      if (!reserva)
        throw new NotFoundException('No se encontró la reserva del reclamo');
      if (reserva.usuario?.id !== idUsuario)
        throw new ForbiddenException(
          'Solo el Inquilino de la reserva puede iniciar un reclamo',
        );
      if (reserva.estado_pago !== EstadoPagoReserva.APROBADO)
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

      const abierto = await reclamos.buscarAbiertoPorReserva(reserva.id);
      if (abierto)
        throw new ConflictException('La reserva ya tiene un reclamo abierto');

      const reclamo = reclamos.crear({
        reserva,
        inquilino: reserva.usuario,
        anunciante: reserva.publicacion?.anunciante?.usuario ?? undefined,
        categoria: dto.categoria,
        descripcion: dto.descripcion.trim(),
        estado: EstadoReclamo.ABIERTO,
        resolucion: null,
        importe_reembolso: null,
        administrador_resolucion: null,
        resuelto_en: null,
      });

      // Si el dinero todavía no se pagó al propietario, el reclamo congela la
      // liquidación. Si ya se pagó, el reclamo se crea igual y el Administrador
      // decide si corresponde un ajuste posterior.
      if (!this.estado.liquidacionResuelta(reserva)) {
        this.ciclo.marcarEnRevisionPorReclamo(
          reserva,
          'Reclamo del inquilino en revisión',
        );
        await reservas.guardar(reserva);
      }
      return reclamos.guardar(reclamo);
    });
    const completo = await this.reclamos.buscarPorId(creado.id);
    if (!completo) throw new NotFoundException('Reclamo no encontrado');
    await this.notificaciones?.reclamoCreado(completo);
    return completo;
  }

  async listarMios(idUsuario: number): Promise<Reclamo[]> {
    const reclamos = await this.reclamos.buscarPorUsuario(idUsuario);
    return reclamos.map((reclamo) => this.filtrarMensajes(reclamo, false));
  }

  async listarAdministracion(): Promise<Reclamo[]> {
    return this.reclamos.listarAdministracion();
  }

  async obtener(
    id: number,
    idUsuario: number,
    esAdmin: boolean,
  ): Promise<Reclamo> {
    const reclamo = await this.reclamos.buscarPorId(id);
    if (!reclamo) throw new NotFoundException('Reclamo no encontrado');
    if (!esAdmin) {
      this.verificarParticipante(reclamo, idUsuario);
      this.filtrarMensajes(reclamo, false);
    }
    return reclamo;
  }

  async subirEvidencias(
    id: number,
    idUsuario: number,
    esAdmin: boolean,
    archivos: Express.Multer.File[],
  ): Promise<ReclamoEvidencia[]> {
    const reclamo = await this.obtener(id, idUsuario, esAdmin);
    if (!archivos?.length)
      throw new BadRequestException('No se recibieron imágenes');
    if (reclamo.estado === EstadoReclamo.CERRADO)
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
      const url = await this.archivos.subir(
        'reclamos',
        `reservas/${reclamo.reserva.id}/reclamos/${id}-${randomUUID()}.jpg`,
        contenido,
        'image/jpeg',
      );
      const evidencia = this.reclamos.crearEvidencia({
        reclamo,
        usuario: referenciaUsuario(idUsuario),
        url,
        nombre_archivo: archivo.originalname.slice(0, 255),
        tipo: 'image/jpeg',
      });
      guardadas.push(await this.reclamos.guardarEvidencia(evidencia));
    }
    return guardadas;
  }

  async urlEvidencia(
    idReclamo: number,
    idEvidencia: number,
    idUsuario: number,
    esAdmin: boolean,
  ): Promise<{ url: string }> {
    await this.obtener(idReclamo, idUsuario, esAdmin);
    const evidencia = await this.reclamos.buscarEvidencia(
      idReclamo,
      idEvidencia,
    );
    if (!evidencia) throw new NotFoundException('Evidencia no encontrada');
    return { url: await this.archivos.firmarArchivo('reclamos', evidencia.url) };
  }

  async enviarMensaje(
    id: number,
    dto: EnviarMensajeReclamoDto,
    idUsuario: number,
    esAdmin: boolean,
  ): Promise<ReclamoMensaje> {
    const reclamo = await this.obtener(id, idUsuario, esAdmin);
    if (reclamo.estado === EstadoReclamo.CERRADO)
      throw new ConflictException('El reclamo está cerrado');
    if (dto.visible_para === VisibilidadMensajeReclamo.ADMIN && !esAdmin)
      throw new ForbiddenException('Solo el Administrador puede dejar notas internas');
    const mensaje = this.reclamos.crearMensaje({
      reclamo,
      autor: referenciaUsuario(idUsuario),
      texto: dto.texto.trim(),
      visible_para: dto.visible_para ?? VisibilidadMensajeReclamo.TODOS,
    });
    if (esAdmin && reclamo.estado === EstadoReclamo.ABIERTO) {
      reclamo.estado = EstadoReclamo.EN_REVISION;
      await this.reclamos.guardar(reclamo);
    }
    const guardado = await this.reclamos.guardarMensaje(mensaje);
    await this.notificaciones?.reclamoMensaje(
      reclamo,
      idUsuario,
      dto.texto.trim(),
    );
    return guardado;
  }

  async listarMensajes(
    id: number,
    idUsuario: number,
    esAdmin: boolean,
  ): Promise<ReclamoMensaje[]> {
    const reclamo = await this.obtener(id, idUsuario, esAdmin);
    return (reclamo.mensajes ?? [])
      .filter(
        (mensaje) =>
          esAdmin || mensaje.visible_para === VisibilidadMensajeReclamo.TODOS,
      )
      .sort((a, b) => a.id - b.id);
  }

  async resolver(
    id: number,
    dto: ResolverReclamoDto,
    idAdmin: number,
  ): Promise<Reclamo> {
    const reclamo = await this.obtener(id, idAdmin, true);
    if (
      [
        EstadoReclamo.RESUELTO_INQUILINO,
        EstadoReclamo.RESUELTO_ANUNCIANTE,
        EstadoReclamo.CERRADO,
      ].includes(reclamo.estado)
    )
      throw new ConflictException('El reclamo ya fue resuelto');

    if (dto.resolucion === ResolucionReclamo.SIN_DEVOLUCION) {
      const reembolsos = await this.reembolsos.listarPorReserva(
        reclamo.reserva.id,
      );
      if (
        reembolsos.some((reembolso) =>
          [
            EstadoReembolso.PENDIENTE,
            EstadoReembolso.EN_PROCESO,
            EstadoReembolso.FALLIDO,
            EstadoReembolso.APROBADO,
          ].includes(reembolso.estado),
        )
      )
        throw new ConflictException(
          'El reclamo tiene una devolución asociada; resolvela antes de cerrarlo sin devolución',
        );
      const resuelto = await this.uow.ejecutar(
        async ({ reclamos, reservas }) => {
          const actualReclamo = await reclamos.buscarPorIdConBloqueo(id);
          if (!actualReclamo)
            throw new NotFoundException('Reclamo no encontrado');
          if (
            [
              EstadoReclamo.RESUELTO_INQUILINO,
              EstadoReclamo.RESUELTO_ANUNCIANTE,
              EstadoReclamo.CERRADO,
            ].includes(actualReclamo.estado)
          )
            throw new ConflictException('El reclamo ya fue resuelto');

          const reserva = await reservas.buscarPorId(
            actualReclamo.reserva.id,
          );
          if (!reserva)
            throw new NotFoundException('Reserva del reclamo no encontrada');
          if (!this.estado.liquidacionResuelta(reserva)) {
            this.ciclo.resolverReclamoSinDevolucion(
              reserva,
              dto.observacion?.trim() ||
                'Reclamo resuelto a favor del Anunciante',
            );
            await reservas.guardar(reserva);
          }

          actualReclamo.estado = EstadoReclamo.RESUELTO_ANUNCIANTE;
          actualReclamo.resolucion = ResolucionReclamo.SIN_DEVOLUCION;
          actualReclamo.administrador_resolucion = referenciaUsuario(idAdmin);
          actualReclamo.resuelto_en = new Date();
          return reclamos.guardar(actualReclamo);
        },
      );
      const completo = await this.reclamos.buscarPorId(resuelto.id);
      if (!completo) throw new NotFoundException('Reclamo no encontrado');
      await this.notificaciones?.reclamoResuelto(completo);
      return completo;
    }

    const preparado = await this.uow.ejecutar(
      async ({ reclamos, reservas }) => {
        const actualReclamo = await reclamos.buscarPorIdConBloqueo(id);
        if (!actualReclamo)
          throw new NotFoundException('Reclamo no encontrado');
        if (
          [
            EstadoReclamo.RESUELTO_INQUILINO,
            EstadoReclamo.RESUELTO_ANUNCIANTE,
            EstadoReclamo.CERRADO,
          ].includes(actualReclamo.estado)
        )
          throw new ConflictException('El reclamo ya fue resuelto');

        const reserva = await reservas.buscarPorId(actualReclamo.reserva.id);
        if (!reserva)
          throw new NotFoundException('Reserva del reclamo no encontrada');
        if (!this.estado.liquidacionResuelta(reserva)) {
          // Bloquea la reserva y la deja en revisión antes de mover dinero:
          // impide que un pago al propietario gane la carrera contra la devolución.
          this.ciclo.marcarEnRevisionPorReclamo(
            reserva,
            'Devolución de reclamo en ejecución',
          );
          await reservas.guardar(reserva);
        }
        actualReclamo.estado = EstadoReclamo.EN_REVISION;
        return {
          reclamo: await reclamos.guardar(actualReclamo),
          reserva,
        };
      },
    );

    const pago = await this.pagosService.buscarPorReserva(
      preparado.reserva.id,
    );
    if (!pago)
      throw new ConflictException('La reserva no tiene un pago registrado');
    const saldo = this.pagosService.saldoReembolsable(pago);
    const importe =
      dto.resolucion === ResolucionReclamo.DEVOLUCION_TOTAL
        ? saldo
        : Number(dto.importe ?? 0);
    if (!Number.isFinite(importe) || importe <= 0)
      throw new BadRequestException(
        'Indicá el importe de la devolución parcial',
      );
    if (importe > saldo + TOLERANCIA_MONETARIA)
      throw new ConflictException('La devolución supera el saldo del pago');

    const reembolso = await this.reembolsos.crearSolicitud({
      reserva: preparado.reserva,
      pago,
      tipo:
        dto.resolucion === ResolucionReclamo.DEVOLUCION_TOTAL
          ? TipoReembolso.TOTAL
          : TipoReembolso.PARCIAL,
      origen: OrigenReembolso.RECLAMO,
      importe,
      motivo: `Reclamo #${reclamo.id}: ${
        dto.observacion ?? 'resolución favorable al inquilino'
      }`,
      idSolicitadoPor: idAdmin,
      idempotencyKey: `reclamo:${reclamo.id}`,
    });
    const ejecutado = await this.reembolsos.registrarOejecutar(
      reembolso.id,
      dto.referencia,
      idAdmin,
    );
    if (ejecutado.estado !== EstadoReembolso.APROBADO)
      throw new ConflictException(
        'La devolución no quedó aprobada; el reclamo permanece en revisión',
      );
    await this.cancelaciones.aplicarReembolsoConfirmado(reembolso.id);

    const resuelto = await this.uow.ejecutar(
      async ({ reclamos, reservas }) => {
        const actualReclamo = await reclamos.buscarPorIdConBloqueo(id);
        if (!actualReclamo)
          throw new NotFoundException('Reclamo no encontrado');
        if (
          [
            EstadoReclamo.RESUELTO_INQUILINO,
            EstadoReclamo.RESUELTO_ANUNCIANTE,
            EstadoReclamo.CERRADO,
          ].includes(actualReclamo.estado)
        )
          throw new ConflictException('El reclamo ya fue resuelto');

        const reserva = await reservas.buscarPorId(
          actualReclamo.reserva.id,
        );
        if (!reserva)
          throw new NotFoundException('Reserva del reclamo no encontrada');
        reserva.observacion_liquidacion =
          dto.observacion?.trim() ||
          'Reclamo resuelto a favor del Inquilino';
        await reservas.guardar(reserva);

        actualReclamo.estado = EstadoReclamo.RESUELTO_INQUILINO;
        actualReclamo.resolucion = dto.resolucion;
        actualReclamo.importe_reembolso = importe;
        actualReclamo.administrador_resolucion = referenciaUsuario(idAdmin);
        actualReclamo.resuelto_en = new Date();
        return reclamos.guardar(actualReclamo);
      },
    );
    const completo = await this.reclamos.buscarPorId(resuelto.id);
    if (!completo) throw new NotFoundException('Reclamo no encontrado');
    await this.notificaciones?.reclamoResuelto(completo);
    return completo;
  }

  async cerrar(id: number, idAdmin: number): Promise<Reclamo> {
    const cerrado = await this.uow.ejecutar(async ({ reclamos }) => {
      const reclamo = await reclamos.buscarPorIdConBloqueo(id);
      if (!reclamo) throw new NotFoundException('Reclamo no encontrado');
      if (reclamo.estado === EstadoReclamo.CERRADO)
        return reclamo;
      if (
        ![
          EstadoReclamo.RESUELTO_INQUILINO,
          EstadoReclamo.RESUELTO_ANUNCIANTE,
        ].includes(reclamo.estado)
      )
        throw new ConflictException(
          'Solo puede cerrarse un reclamo que ya fue resuelto',
        );
      reclamo.estado = EstadoReclamo.CERRADO;
      reclamo.administrador_resolucion =
        reclamo.administrador_resolucion ?? referenciaUsuario(idAdmin);
      return reclamos.guardar(reclamo);
    });
    const completo = await this.reclamos.buscarPorId(cerrado.id);
    if (!completo) throw new NotFoundException('Reclamo no encontrado');
    await this.notificaciones?.reclamoCerrado(completo);
    return completo;
  }

  private filtrarMensajes(reclamo: Reclamo, esAdmin: boolean): Reclamo {
    if (!esAdmin) {
      reclamo.mensajes = (reclamo.mensajes ?? []).filter(
        (mensaje) => mensaje.visible_para === VisibilidadMensajeReclamo.TODOS,
      );
    }
    return reclamo;
  }

  private verificarParticipante(reclamo: Reclamo, idUsuario: number): void {
    if (
      reclamo.inquilino?.id !== idUsuario &&
      reclamo.anunciante?.id !== idUsuario
    )
      throw new ForbiddenException('No formás parte de este reclamo');
  }

  private fueraDePlazo(fechaFin: string, hoy: string): boolean {
    const fin = new Date(`${fechaFin}T12:00:00Z`).getTime();
    const actual = new Date(`${hoy}T12:00:00Z`).getTime();
    return actual > fin + DIAS_RECLAMO * 86_400_000;
  }
}
