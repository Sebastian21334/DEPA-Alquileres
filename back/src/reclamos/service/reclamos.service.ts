import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { fechaArgentina } from '../../common/utils/fechas';
import {
  ARCHIVO_REPOSITORY,
  type IArchivoRepository,
} from '../../common/almacenamiento/archivo.repository.interface';
import {
  EstadoLiquidacionReserva,
  EstadoPagoReserva,
  Reserva,
} from '../../reservas/entity/reserva.entity';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import {
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

const DIAS_RECLAMO = 7;
const MAX_EVIDENCIAS = 5;
const MAX_BYTES = 5 * 1024 * 1024;

@Injectable()
export class ReclamosService {
  constructor(
    @InjectRepository(Reclamo)
    private readonly reclamos: Repository<Reclamo>,
    @InjectRepository(ReclamoEvidencia)
    private readonly evidencias: Repository<ReclamoEvidencia>,
    @InjectRepository(ReclamoMensaje)
    private readonly mensajes: Repository<ReclamoMensaje>,
    @InjectRepository(Reserva)
    private readonly reservas: Repository<Reserva>,
    private readonly reembolsos: ReembolsosService,
    @Inject(ARCHIVO_REPOSITORY)
    private readonly archivos: IArchivoRepository,
  ) {}

  async crear(dto: CrearReclamoDto, idUsuario: number): Promise<Reclamo> {
    const reserva = await this.reservas.findOne({
      where: { id: dto.id_reserva },
      relations: {
        usuario: true,
        publicacion: { anunciante: { usuario: true } },
      },
    });
    if (!reserva) throw new NotFoundException('No se encontró la reserva');
    if (!reserva.esDelInquilino(idUsuario))
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

    const abierto = await this.reclamos.findOne({
      where: {
        reserva: { id: reserva.id },
        estado: In([EstadoReclamo.ABIERTO, EstadoReclamo.EN_REVISION]),
      },
    });
    if (abierto)
      throw new ConflictException('La reserva ya tiene un reclamo abierto');

    const reclamo = this.reclamos.create({
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
    reserva.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
    reserva.observacion_liquidacion = 'Reclamo del inquilino en revisión';
    reserva.fecha_resolucion_liquidacion = null;
    await this.reservas.save(reserva);
    return this.reclamos.save(reclamo);
  }

  async listarMios(idUsuario: number): Promise<Reclamo[]> {
    return this.reclamos.find({
      where: [{ inquilino: { id: idUsuario } }, { anunciante: { id: idUsuario } }],
      relations: {
        reserva: { publicacion: { anunciante: { usuario: true } }, usuario: true },
        inquilino: true,
        anunciante: true,
        evidencias: true,
        mensajes: { autor: true },
      },
      order: { id: 'DESC' },
    });
  }

  async listarAdministracion(): Promise<Reclamo[]> {
    return this.reclamos.find({
      relations: {
        reserva: { publicacion: { anunciante: { usuario: true } }, usuario: true },
        inquilino: true,
        anunciante: true,
        evidencias: true,
        mensajes: { autor: true },
      },
      order: { id: 'DESC' },
      take: 200,
    });
  }

  async obtener(id: number, idUsuario: number, esAdmin: boolean): Promise<Reclamo> {
    const reclamo = await this.reclamos.findOne({
      where: { id },
      relations: {
        reserva: { publicacion: { anunciante: { usuario: true } }, usuario: true },
        inquilino: true,
        anunciante: true,
        evidencias: { usuario: true },
        mensajes: { autor: true },
      },
    });
    if (!reclamo) throw new NotFoundException('Reclamo no encontrado');
    if (!esAdmin) this.verificarParticipante(reclamo, idUsuario);
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
    const existentes = await this.evidencias.count({
      where: { reclamo: { id } },
    });
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
      const evidencia = this.evidencias.create({
        reclamo,
        usuario: { id: idUsuario } as never,
        url,
        nombre_archivo: archivo.originalname.slice(0, 255),
        tipo: 'image/jpeg',
      });
      guardadas.push(await this.evidencias.save(evidencia));
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
    const evidencia = await this.evidencias.findOne({
      where: { id: idEvidencia, reclamo: { id: idReclamo } },
    });
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
    const mensaje = this.mensajes.create({
      reclamo,
      autor: { id: idUsuario } as never,
      texto: dto.texto.trim(),
      visible_para: dto.visible_para ?? VisibilidadMensajeReclamo.TODOS,
    });
    if (esAdmin && reclamo.estado === EstadoReclamo.ABIERTO) {
      reclamo.estado = EstadoReclamo.EN_REVISION;
      await this.reclamos.save(reclamo);
    }
    return this.mensajes.save(mensaje);
  }

  async listarMensajes(
    id: number,
    idUsuario: number,
    esAdmin: boolean,
  ): Promise<ReclamoMensaje[]> {
    const reclamo = await this.obtener(id, idUsuario, esAdmin);
    return reclamo.mensajes
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
      [EstadoReclamo.RESUELTO_INQUILINO, EstadoReclamo.RESUELTO_ANUNCIANTE, EstadoReclamo.CERRADO].includes(
        reclamo.estado,
      )
    )
      throw new ConflictException('El reclamo ya fue resuelto');
    const reserva = reclamo.reserva;

    if (dto.resolucion === ResolucionReclamo.SIN_DEVOLUCION) {
      reserva.estado_liquidacion = reserva.codigoValidado()
        ? EstadoLiquidacionReserva.PENDIENTE_PAGO_PROPIETARIO
        : EstadoLiquidacionReserva.RETENIDO;
      reserva.observacion_liquidacion =
        dto.observacion?.trim() || 'Reclamo resuelto a favor del Anunciante';
      await this.reservas.save(reserva);
      reclamo.estado = EstadoReclamo.RESUELTO_ANUNCIANTE;
      reclamo.resolucion = ResolucionReclamo.SIN_DEVOLUCION;
    } else {
      const pago = await this.reembolsos.buscarPagoPorReserva(reserva.id);
      if (!pago)
        throw new ConflictException('La reserva no tiene un pago registrado');
      const saldo = pago.saldoReembolsable();
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
        dto.referencia?.trim() || `reclamo-${reclamo.id}`,
        idAdmin,
      );
      if (dto.resolucion === ResolucionReclamo.DEVOLUCION_TOTAL)
        reserva.aplicarReembolsoTotal();
      else reserva.aplicarReembolsoParcial();
      reserva.observacion_liquidacion =
        dto.observacion?.trim() || 'Reclamo resuelto a favor del Inquilino';
      await this.reservas.save(reserva);
      reclamo.estado = EstadoReclamo.RESUELTO_INQUILINO;
      reclamo.resolucion = dto.resolucion;
      reclamo.importe_reembolso = importe;
    }

    reclamo.administrador_resolucion = { id: idAdmin } as never;
    reclamo.resuelto_en = new Date();
    return this.reclamos.save(reclamo);
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
