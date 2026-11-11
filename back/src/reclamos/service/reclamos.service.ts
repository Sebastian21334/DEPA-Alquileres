import { EstadoPagoReserva, EstadoReclamo } from '../../catalogos/estados';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { fechaArgentina } from '../../common/utils/fechas';
import { AlmacenamientoService } from '../../almacenamiento/service/almacenamiento.service';
import { ReservasService } from '../../reservas/service/reservas.service';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import {
  OrigenReembolso,
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
  constructor(@Inject(RECLAMOS_REPOSITORY) private readonly reclamos: IReclamosRepository, private readonly reservas: ReservasService, private readonly reembolsos: ReembolsosService, private readonly almacenamientoService: AlmacenamientoService) {}

  async crear(dto: CrearReclamoDto, idUsuario: number): Promise<Reclamo> {
    const reclamo = await this.reservas.conReservaParaReclamo(dto.id_reserva, async (reserva, transaccion) => {
      const reclamos = this.reclamos.enTransaccion(transaccion);
      if (!this.reservas.esDelInquilino(reserva, idUsuario))
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

      if (await reclamos.existeAbierto(reserva.id))
        throw new ConflictException('La reserva ya tiene un reclamo abierto');

      return reclamos.guardar({
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
    });
    return this.prepararRespuesta(reclamo);
  }

  async listarMios(idUsuario: number): Promise<Reclamo[]> {
    const reclamos = await this.reclamos.listarPorParticipante(idUsuario);
    return reclamos.map((reclamo) => this.sinNotasInternas(reclamo));
  }

  async listarAdministracion(): Promise<Reclamo[]> {
    const reclamos = await this.reclamos.listarAdministracion();
    return reclamos.map((reclamo) => this.prepararRespuesta(reclamo));
  }

  async obtener(id: number, idUsuario: number, esAdmin: boolean): Promise<Reclamo> {
    const reclamo = await this.reclamos.buscarPorId(id);
    if (!reclamo) throw new NotFoundException('Reclamo no encontrado');
    if (esAdmin) return this.prepararRespuesta(reclamo);
    this.verificarParticipante(reclamo, idUsuario);
    return this.sinNotasInternas(reclamo);
  }

  async subirEvidencias(id: number, idUsuario: number, esAdmin: boolean, archivos: Express.Multer.File[]): Promise<ReclamoEvidencia[]> {
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
      const url = await this.almacenamientoService.subir(
        'reclamos',
        `reservas/${reclamo.reserva.id}/reclamos/${id}-${randomUUID()}.jpg`,
        contenido,
        'image/jpeg',
      );
      const evidencia = await this.reclamos.guardarEvidencia({
        reclamo,
        usuario: { id: idUsuario } as never,
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
    if (reclamo.estado === EstadoReclamo.CERRADO)
      throw new ConflictException('El reclamo está cerrado');
    if (dto.visible_para === VisibilidadMensajeReclamo.ADMIN && !esAdmin)
      throw new ForbiddenException('Solo el Administrador puede dejar notas internas');
    if (esAdmin && reclamo.estado === EstadoReclamo.ABIERTO) {
      reclamo.estado = EstadoReclamo.EN_REVISION;
      await this.reclamos.guardar(reclamo);
    }
    const mensaje = await this.reclamos.guardarMensaje({
      reclamo,
      autor: { id: idUsuario } as never,
      texto: dto.texto.trim(),
      visible_para: dto.visible_para ?? VisibilidadMensajeReclamo.TODOS,
    });
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
    const estadosCerrados: EstadoReclamo[] = [
      EstadoReclamo.RESUELTO_INQUILINO,
      EstadoReclamo.RESUELTO_ANUNCIANTE,
      EstadoReclamo.CERRADO,
    ];
    if (estadosCerrados.includes(reclamo.estado))
      throw new ConflictException('El reclamo ya fue resuelto');
    const reserva = reclamo.reserva;

    if (dto.resolucion === ResolucionReclamo.SIN_DEVOLUCION) {
      await this.reservas.resolverReclamoSinDevolucion(reserva, dto.observacion);
      reclamo.estado = EstadoReclamo.RESUELTO_ANUNCIANTE;
      reclamo.resolucion = ResolucionReclamo.SIN_DEVOLUCION;
    } else {
      if (!this.reembolsos.ejecucionAutomaticaHabilitada && !dto.referencia?.trim())
        throw new BadRequestException('La referencia del comprobante de devolución es obligatoria');
      const pago = await this.reembolsos.buscarPagoPorReserva(reserva.id);
      if (!pago)
        throw new ConflictException('La reserva no tiene un pago registrado');
      const saldo = this.reembolsos.saldoReembolsable(pago);
      const importe =
        dto.resolucion === ResolucionReclamo.DEVOLUCION_TOTAL
          ? saldo
          : Number(dto.importe ?? 0);
      if (!Number.isFinite(importe) || importe <= 0)
        throw new BadRequestException('Indicá el importe de la devolución parcial');
      if (importe > saldo + 0.009)
        throw new ConflictException('La devolución supera el saldo del pago');
      const reembolso = await this.reembolsos.crearSolicitud({
        reserva,
        pago,
        tipo:
          dto.resolucion === ResolucionReclamo.DEVOLUCION_TOTAL
            ? TipoReembolso.TOTAL
            : TipoReembolso.PARCIAL,
        origen: OrigenReembolso.RECLAMO,
        importe,
        motivo: `Reclamo #${reclamo.id}: ${dto.observacion ?? 'resolución favorable al inquilino'}`,
        idSolicitadoPor: idAdmin,
      });
      await this.reembolsos.registrarOejecutar(
        reembolso.id,
        dto.referencia?.trim(),
        idAdmin,
      );
      await this.reservas.resolverReclamoConDevolucion(
        reserva,
        dto.resolucion === ResolucionReclamo.DEVOLUCION_TOTAL,
        dto.observacion,
      );
      reclamo.estado = EstadoReclamo.RESUELTO_INQUILINO;
      reclamo.resolucion = dto.resolucion;
      reclamo.importe_reembolso = importe;
    }

    reclamo.administrador_resolucion = { id: idAdmin } as never;
    reclamo.resuelto_en = new Date();
    return this.prepararRespuesta(await this.reclamos.guardar(reclamo));
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
