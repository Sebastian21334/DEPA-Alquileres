import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient } from '@azure/storage-blob';
import sharp from 'sharp';
import { ANUNCIANTES_REPOSITORY } from '../repository/anunciantes.repository.interface';
import type { IAnunciantesRepository } from '../repository/anunciantes.repository.interface';
import { SolicitarAnuncianteDto } from '../dto/solicitar-anunciante.dto';
import { UsuariosService } from '../../usuarios/service/usuarios.service';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Anunciante } from '../entity/anunciante.entity';
import { EstadoVerificacion, SolicitudVerificacion } from '../entity/solicitud-verificacion.entity';
import type { IVerificacionRepository } from '../repository/verificacion.repository.interface';
import { VERIFICACION_REPOSITORY } from '../repository/verificacion.repository.interface';
import type { ArchivoSubido } from '../../common/interfaces/archivo-subido.interface';
import type { IMailService } from '../../mail/mail.interface';
import { MAIL_SERVICE } from '../../mail/mail.interface';
import { RechazarVerificacionDto } from '../dto/rechazar-verificacion.dto';

@Injectable()
export class AnunciantesService {
  constructor(
    @Inject(ANUNCIANTES_REPOSITORY)
    private readonly anunciantesRepo: IAnunciantesRepository,
    private usuariosService: UsuariosService,
    private catalogosService: CatalogosService,
    @Inject(VERIFICACION_REPOSITORY)
    private readonly verificacionRepo: IVerificacionRepository,
    @Inject(MAIL_SERVICE)
    private readonly mailService: IMailService,
    private readonly configService: ConfigService,
  ) {
    const connectionString = this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING');
    if (!connectionString) throw new Error('Falta AZURE_STORAGE_CONNECTION_STRING');
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.containerName = this.configService.get<string>('AZURE_VERIFICACION_CONTAINER') ?? 'verificaciones';
  }

  private readonly blobServiceClient: BlobServiceClient;
  private readonly containerName: string;

  /** Crea una solicitud pendiente y evita que un usuario tenga dos solicitudes. */
  async solicitarAlta(idUsuario: number, dto: SolicitarAnuncianteDto) {
    const usuario = await this.usuariosService.buscarPorId(idUsuario);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const existeAnunciante = await this.anunciantesRepo.buscarPorUsuario(idUsuario);
    // La PK coincide con el usuario, por lo que solo puede existir una solicitud por persona.
    if (existeAnunciante) throw new ConflictException('El usuario ya solicitó ser anunciante');

    const tipoAnunciante = await this.catalogosService.getTipoAnunciantePorId(dto.idTipoAnunciante);
    
    if (!tipoAnunciante) throw new NotFoundException('Tipo de anunciante no válido');

    // La solicitud comienza pendiente; aprobarla es lo que habilita publicar.
    const nuevoAnunciante = this.anunciantesRepo.crear({
      idUsuario,
      usuario,
      cuit_cuil: dto.cuit,
      numero_contacto: dto.numero_contacto,
      tipoAnunciante,
      verificado: false,
    });

    const anunciante = await this.anunciantesRepo.guardar(nuevoAnunciante);
    const solicitud = this.verificacionRepo.crearSolicitud({
      anunciante,
      estado: EstadoVerificacion.PENDIENTE,
      numero_revision: 1,
    });
    await this.verificacionRepo.guardarSolicitud(solicitud);
    return anunciante;
  }

  /** Carga y valida los tres documentos obligatorios de identidad. */
  async subirDocumentos(
    idUsuario: number,
    archivos: {
      dni_frente?: ArchivoSubido[];
      dni_dorso?: ArchivoSubido[];
      rostro?: ArchivoSubido[];
    },
    reenvio = false,
  ) {
    const solicitud = await this.obtenerSolicitud(idUsuario);
    if (solicitud.estado === EstadoVerificacion.APROBADA) {
      throw new ConflictException('La identidad ya fue aprobada');
    }
    if (reenvio && solicitud.estado !== EstadoVerificacion.RECHAZADA) {
      throw new ConflictException('Solo se puede reenviar una solicitud rechazada');
    }

    const frente = archivos.dni_frente?.[0];
    const dorso = archivos.dni_dorso?.[0];
    const rostro = archivos.rostro?.[0];
    if (!frente || !dorso || !rostro) {
      throw new BadRequestException('Se requieren DNI frente, DNI dorso y foto o video facial');
    }

    solicitud.dni_frente_url = await this.subirDocumento(frente, idUsuario, 'dni-frente');
    solicitud.dni_dorso_url = await this.subirDocumento(dorso, idUsuario, 'dni-dorso');
    solicitud.rostro_url = await this.subirDocumento(rostro, idUsuario, 'rostro');
    if (reenvio) solicitud.numero_revision += 1;
    solicitud.estado = reenvio ? EstadoVerificacion.REENVIADA : EstadoVerificacion.PENDIENTE;
    solicitud.motivo_rechazo = null;
    solicitud.actualizada_en = new Date();

    return this.verificacionRepo.guardarSolicitud(solicitud);
  }

  /** Marca una solicitud completa como verificada y habilita publicaciones. */
  async aprobar(idAnunciante: number): Promise<Anunciante> {
    const anunciante = await this.anunciantesRepo.buscarPorId(idAnunciante);
    if (!anunciante) throw new NotFoundException('Solicitud de anunciante no encontrada');
    if (anunciante.verificado) throw new ConflictException('El anunciante ya está verificado');

    const solicitud = await this.verificacionRepo.buscarSolicitudPorAnunciante(idAnunciante);
    if (!solicitud || !solicitud.dni_frente_url || !solicitud.dni_dorso_url || !solicitud.rostro_url) {
      throw new ConflictException('La solicitud todavía no tiene toda la documentación requerida');
    }
    if (![EstadoVerificacion.PENDIENTE, EstadoVerificacion.REENVIADA].includes(solicitud.estado)) {
      throw new ConflictException('La solicitud no está pendiente de aprobación');
    }

    anunciante.verificado = true;
    const actualizado = await this.anunciantesRepo.guardar(anunciante);
    solicitud.estado = EstadoVerificacion.APROBADA;
    solicitud.motivo_rechazo = null;
    solicitud.actualizada_en = new Date();
    await this.verificacionRepo.guardarSolicitud(solicitud);
    await this.guardarRevision(solicitud, EstadoVerificacion.APROBADA);
    await this.mailService.enviarResultadoVerificacion(anunciante.usuario.email, true);
    return actualizado;
  }

  /** Rechaza una solicitud conservando el motivo y permitiendo reenviarla. */
  async rechazar(idAnunciante: number, dto: RechazarVerificacionDto): Promise<{ mensaje: string }> {
    const anunciante = await this.anunciantesRepo.buscarPorId(idAnunciante);
    if (!anunciante) throw new NotFoundException('Solicitud de anunciante no encontrada');
    if (anunciante.verificado) throw new ConflictException('El anunciante ya está verificado, no se puede rechazar');

    const solicitud = await this.verificacionRepo.buscarSolicitudPorAnunciante(idAnunciante);
    if (!solicitud) throw new NotFoundException('Solicitud de verificación no encontrada');

    solicitud.estado = EstadoVerificacion.RECHAZADA;
    solicitud.motivo_rechazo = dto.motivo.trim();
    solicitud.actualizada_en = new Date();
    await this.verificacionRepo.guardarSolicitud(solicitud);
    await this.guardarRevision(solicitud, EstadoVerificacion.RECHAZADA, solicitud.motivo_rechazo);
    await this.mailService.enviarResultadoVerificacion(anunciante.usuario.email, false, solicitud.motivo_rechazo);
    return { mensaje: 'Solicitud de verificación rechazada' };
  }

  /** Devuelve las solicitudes que todavia requieren una decision administrativa. */
  async getPendientes() {
    return this.verificacionRepo.buscarPendientes();
  }

  /** Busca la solicitud asociada a un usuario concreto. */
  async buscarPorUsuario(idUsuario: number) {
    return this.anunciantesRepo.buscarPorUsuario(idUsuario);
  }

  async buscarSolicitudConHistorial(idUsuario: number) {
    const solicitud = await this.verificacionRepo.buscarSolicitudPorAnunciante(idUsuario);
    if (!solicitud) return null;
    return {
      ...solicitud,
      revisiones: await this.verificacionRepo.buscarRevisiones(idUsuario),
    };
  }

  private async obtenerSolicitud(idUsuario: number): Promise<SolicitudVerificacion> {
    const solicitud = await this.verificacionRepo.buscarSolicitudPorAnunciante(idUsuario);
    if (!solicitud) throw new NotFoundException('No solicitaste ser anunciante todavía');
    return solicitud;
  }

  private async guardarRevision(
    solicitud: SolicitudVerificacion,
    estado: EstadoVerificacion,
    motivo: string | null = null,
  ) {
    const revision = this.verificacionRepo.crearRevision({
      anunciante: solicitud.anunciante,
      numero_revision: solicitud.numero_revision,
      estado,
      motivo,
    });
    return this.verificacionRepo.guardarRevision(revision);
  }

  private async subirDocumento(archivo: ArchivoSubido, idUsuario: number, tipo: string): Promise<string> {
    const esVideo = archivo.mimetype.startsWith('video/');
    const limite = esVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
    if (archivo.size > limite) {
      throw new BadRequestException(
        `El archivo de ${tipo} supera el tamaño máximo de ${esVideo ? '20 MB' : '5 MB'}`,
      );
    }
    const permitidos = esVideo
      ? ['video/mp4', 'video/webm', 'video/quicktime']
      : ['image/jpeg', 'image/png', 'image/webp'];
    if (!permitidos.includes(archivo.mimetype)) {
      throw new BadRequestException(`Formato no permitido para ${tipo}`);
    }

    let contenido = archivo.buffer;
    const extension = esVideo ? 'mp4' : 'jpg';
    if (!esVideo) {
      try {
        contenido = await sharp(archivo.buffer).jpeg({ quality: 80 }).toBuffer();
      } catch {
        throw new BadRequestException(`El archivo de ${tipo} no es una imagen válida`);
      }
    }

    const blob = this.blobServiceClient
      .getContainerClient(this.containerName)
      .getBlockBlobClient(`usuarios/${idUsuario}/${tipo}-${Date.now()}.${extension}`);
    await blob.uploadData(contenido, {
      blobHTTPHeaders: { blobContentType: esVideo ? archivo.mimetype : 'image/jpeg' },
    });
    return blob.url;
  }

}