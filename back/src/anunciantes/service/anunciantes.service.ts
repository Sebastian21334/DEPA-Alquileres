import { ARCHIVO_REPOSITORY } from '../../common/almacenamiento/archivo.repository.interface';
import type { IArchivoRepository } from '../../common/almacenamiento/archivo.repository.interface';
import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import sharp from 'sharp';
import { ANUNCIANTES_REPOSITORY } from '../repository/anunciantes.repository.interface';
import type { IAnunciantesRepository } from '../repository/anunciantes.repository.interface';
import { SolicitarAnuncianteDto } from '../dto/solicitar-anunciante.dto';
import { UsuariosService } from '../../usuarios/service/usuarios.service';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Anunciante } from '../entity/anunciante.entity';
import {
  EstadoVerificacion,
  SolicitudVerificacion,
} from '../entity/solicitud-verificacion.entity';
import type { IVerificacionRepository } from '../repository/verificacion.repository.interface';
import { VERIFICACION_REPOSITORY } from '../repository/verificacion.repository.interface';
import type { ArchivoSubido } from '../../common/interfaces/archivo-subido.interface';
import type { IMailService } from '../../mail/mail.interface';
import { MAIL_SERVICE } from '../../mail/mail.interface';
import { RechazarVerificacionDto } from '../dto/rechazar-verificacion.dto';
import { VerificacionFacialService } from './verificacion-facial.service';

@Injectable()
export class AnunciantesService {
  private readonly logger = new Logger(AnunciantesService.name);

  constructor(
    @Inject(ANUNCIANTES_REPOSITORY)
    private readonly anunciantesRepo: IAnunciantesRepository,
    private readonly usuariosService: UsuariosService,
    private readonly catalogosService: CatalogosService,
    @Inject(VERIFICACION_REPOSITORY)
    private readonly verificacionRepo: IVerificacionRepository,
    @Inject(MAIL_SERVICE)
    private readonly mailService: IMailService,
    @Inject(ARCHIVO_REPOSITORY)
    private readonly archivosRepo: IArchivoRepository,
    private readonly verificacionFacialService: VerificacionFacialService,
  ) {}

  /** Guarda los datos como borrador y evita que un usuario tenga dos solicitudes. */
  async solicitarAlta(idUsuario: number, dto: SolicitarAnuncianteDto) {
    const usuario = await this.usuariosService.buscarPorId(idUsuario);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const existeAnunciante =
      await this.anunciantesRepo.buscarPorUsuario(idUsuario);
    // La PK coincide con el usuario, por lo que solo puede existir una solicitud por persona.
    if (existeAnunciante)
      throw new ConflictException('El usuario ya solicitó ser anunciante');

    const tipoAnunciante = await this.catalogosService.getTipoAnunciantePorId(
      dto.idTipoAnunciante,
    );

    if (!tipoAnunciante)
      throw new NotFoundException('Tipo de anunciante no válido');

    // El anunciante se crea primero para poder asociarle la solicitud de identidad.
    const nuevoAnunciante = this.anunciantesRepo.crear({
      idUsuario,
      usuario,
      cuit_cuil: dto.cuit,
      numero_contacto: dto.numero_contacto,
      tipoAnunciante,
      verificado: false,
    });

    const anunciante = await this.anunciantesRepo.guardar(nuevoAnunciante);
    // Todavía no llega a administración: queda como borrador hasta que la
    // vitalidad, la coincidencia facial y la carga documental sean exitosas.
    const solicitud = this.verificacionRepo.crearSolicitud({
      anunciante,
      estado: EstadoVerificacion.BORRADOR,
      numero_revision: 1,
    });
    await this.verificacionRepo.guardarSolicitud(solicitud);
    try {
      await this.mailService.enviarSolicitudAnunciante(usuario.email);
    } catch (error) {
      this.logger.error(
        `No se pudo confirmar la solicitud de anunciante a ${usuario.email}`,
        error as Error,
      );
    }
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
    verificationToken: string,
    reenvio = false,
  ) {
    // Se recupera la solicitud vigente y se impide modificar una ya aprobada.
    const solicitud = await this.obtenerSolicitud(idUsuario);
    if (solicitud.estado === EstadoVerificacion.APROBADA) {
      throw new ConflictException('La identidad ya fue aprobada');
    }
    if (reenvio && solicitud.estado !== EstadoVerificacion.RECHAZADA) {
      throw new ConflictException(
        'Solo se puede reenviar una solicitud rechazada',
      );
    }

    // FileFieldsInterceptor entrega cada archivo dentro de un arreglo.
    const frente = archivos?.dni_frente?.[0];
    const dorso = archivos?.dni_dorso?.[0];
    const rostro = archivos?.rostro?.[0];
    if (!frente || !dorso || !rostro) {
      throw new BadRequestException(
        'Se requieren las capturas de DNI frente, DNI dorso y rostro',
      );
    }

    if (
      [frente, dorso, rostro].some(
        (archivo) => archivo.mimetype !== 'image/jpeg',
      )
    ) {
      throw new BadRequestException(
        'Las tres fotos deben capturarse en el momento desde la cámara.',
      );
    }

    // La autorización está firmada y ligada al hash exacto de la captura final:
    // no se puede reemplazar por un archivo elegido después de superar la prueba.
    await this.verificacionFacialService.verificarCapturaAutorizada(
      idUsuario,
      verificationToken,
      rostro.buffer,
    );
    const comparacion =
      await this.verificacionFacialService.compararConDocumento(
        frente.buffer,
        rostro.buffer,
      );
    if (!comparacion.match) {
      throw new BadRequestException(
        `El rostro no coincide con la foto del DNI. Posibles causas: el documento no pertenece a la persona frente a la cámara, la foto está borrosa, tiene reflejos o hay poca luz. Distancia: ${comparacion.distance.toFixed(3)}.`,
      );
    }

    // Recién después de validar vitalidad y coincidencia se persisten los archivos.
    solicitud.dni_frente_url = await this.subirDocumento(
      frente,
      idUsuario,
      'dni-frente',
    );
    solicitud.dni_dorso_url = await this.subirDocumento(
      dorso,
      idUsuario,
      'dni-dorso',
    );
    solicitud.rostro_url = await this.subirDocumento(
      rostro,
      idUsuario,
      'rostro',
    );
    // Un reenvío representa una nueva revisión independiente en el historial.
    if (reenvio) solicitud.numero_revision += 1;
    solicitud.estado = reenvio
      ? EstadoVerificacion.REENVIADA
      : EstadoVerificacion.PENDIENTE;
    solicitud.motivo_rechazo = null;
    solicitud.actualizada_en = new Date();

    const guardada = await this.verificacionRepo.guardarSolicitud(solicitud);
    try {
      const administradores =
        await this.usuariosService.emailsAdministradores();
      await this.mailService.enviarSolicitudParaRevision(
        administradores,
        `${solicitud.anunciante.usuario.nombre} ${solicitud.anunciante.usuario.apellido}`.trim(),
        solicitud.anunciante.usuario.email,
      );
    } catch (error) {
      this.logger.error(
        'No se pudo avisar al equipo administrador sobre la solicitud',
        error as Error,
      );
    }
    return guardada;
  }

  /** Marca una solicitud completa como verificada y habilita publicaciones. */
  async aprobar(idAnunciante: number): Promise<Anunciante> {
    const anunciante = await this.anunciantesRepo.buscarPorId(idAnunciante);
    if (!anunciante)
      throw new NotFoundException('Solicitud de anunciante no encontrada');
    if (anunciante.verificado)
      throw new ConflictException('El anunciante ya está verificado');

    // No se puede aprobar una solicitud que no tenga los tres documentos.
    const solicitud =
      await this.verificacionRepo.buscarSolicitudPorAnunciante(idAnunciante);
    if (
      !solicitud ||
      !solicitud.dni_frente_url ||
      !solicitud.dni_dorso_url ||
      !solicitud.rostro_url
    ) {
      throw new ConflictException(
        'La solicitud todavía no tiene toda la documentación requerida',
      );
    }
    if (
      ![EstadoVerificacion.PENDIENTE, EstadoVerificacion.REENVIADA].includes(
        solicitud.estado,
      )
    ) {
      throw new ConflictException(
        'La solicitud no está pendiente de aprobación',
      );
    }

    // El booleano existente se mantiene como dato rápido para AnuncianteGuard.
    anunciante.verificado = true;
    const actualizado = await this.anunciantesRepo.guardar(anunciante);
    solicitud.estado = EstadoVerificacion.APROBADA;
    solicitud.motivo_rechazo = null;
    solicitud.actualizada_en = new Date();
    await this.verificacionRepo.guardarSolicitud(solicitud);
    // Se registra también la aprobación para conservar auditoría completa.
    await this.guardarRevision(solicitud, EstadoVerificacion.APROBADA);

    // La aprobación ya quedó persistida (anunciante.verificado = true). Si
    // el mail de notificación falla o el proveedor rate-limitea, no debe
    // revertirse ni reportarse como error: el anunciante ya puede publicar.
    try {
      await this.mailService.enviarResultadoVerificacion(
        anunciante.usuario.email,
        true,
      );
    } catch (error) {
      this.logger.error(
        `No se pudo enviar el mail de aprobación a ${anunciante.usuario.email}`,
        error as Error,
      );
    }

    return actualizado;
  }

  /** Rechaza una solicitud conservando el motivo y permitiendo reenviarla. */
  async rechazar(
    idAnunciante: number,
    dto: RechazarVerificacionDto,
  ): Promise<{ mensaje: string }> {
    const anunciante = await this.anunciantesRepo.buscarPorId(idAnunciante);
    if (!anunciante)
      throw new NotFoundException('Solicitud de anunciante no encontrada');
    if (anunciante.verificado)
      throw new ConflictException(
        'El anunciante ya está verificado, no se puede rechazar',
      );

    const solicitud =
      await this.verificacionRepo.buscarSolicitudPorAnunciante(idAnunciante);
    if (!solicitud)
      throw new NotFoundException('Solicitud de verificación no encontrada');

    // Rechazar ya no elimina al anunciante: conserva la solicitud y habilita corregirla.
    solicitud.estado = EstadoVerificacion.RECHAZADA;
    solicitud.motivo_rechazo = dto.motivo.trim();
    solicitud.actualizada_en = new Date();
    await this.verificacionRepo.guardarSolicitud(solicitud);
    await this.guardarRevision(
      solicitud,
      EstadoVerificacion.RECHAZADA,
      solicitud.motivo_rechazo,
    );

    // Mismo criterio que en aprobar(): el rechazo ya quedó persistido.
    try {
      await this.mailService.enviarResultadoVerificacion(
        anunciante.usuario.email,
        false,
        solicitud.motivo_rechazo,
      );
    } catch (error) {
      this.logger.error(
        `No se pudo enviar el mail de rechazo a ${anunciante.usuario.email}`,
        error as Error,
      );
    }

    return { mensaje: 'Solicitud de verificación rechazada' };
  }

  /** Devuelve las solicitudes que todavia requieren una decision administrativa. */
  async getPendientes() {
    const solicitudes = await this.verificacionRepo.buscarPendientes();
    // El contenedor de documentos es privado: la URL guardada no se puede abrir
    // directamente, así que al administrador se le entregan URLs firmadas temporales.
    return Promise.all(
      solicitudes.map(async (solicitud) => ({
        ...solicitud,
        dni_frente_url: await this.firmarUrlDocumento(solicitud.dni_frente_url),
        dni_dorso_url: await this.firmarUrlDocumento(solicitud.dni_dorso_url),
        rostro_url: await this.firmarUrlDocumento(solicitud.rostro_url),
      })),
    );
  }

  /** Genera una URL SAS de solo lectura válida por 15 minutos para un documento privado. */
  private async firmarUrlDocumento(url: string | null): Promise<string | null> {
    if (!url) return null;
    try {
      return await this.archivosRepo.firmarDocumento(url);
    } catch (error) {
      // Sin AccountKey en la connection string no se puede firmar; no se rompe el listado.
      this.logger.error(
        `No se pudo firmar la URL del documento ${url}`,
        error as Error,
      );
      return url;
    }
  }

  /** Busca la solicitud asociada a un usuario concreto. */
  async buscarPorUsuario(idUsuario: number) {
    return this.anunciantesRepo.buscarPorUsuario(idUsuario);
  }

  async buscarSolicitudConHistorial(idUsuario: number) {
    // El guard sigue usando buscarPorUsuario; este método expone además documentación e historial.
    const solicitud =
      await this.verificacionRepo.buscarSolicitudPorAnunciante(idUsuario);
    if (!solicitud) return null;
    return {
      ...solicitud,
      revisiones: await this.verificacionRepo.buscarRevisiones(idUsuario),
    };
  }

  private async obtenerSolicitud(
    idUsuario: number,
  ): Promise<SolicitudVerificacion> {
    const solicitud =
      await this.verificacionRepo.buscarSolicitudPorAnunciante(idUsuario);
    if (!solicitud)
      throw new NotFoundException('No solicitaste ser anunciante todavía');
    return solicitud;
  }

  private async guardarRevision(
    solicitud: SolicitudVerificacion,
    estado: EstadoVerificacion,
    motivo: string | null = null,
  ) {
    // Cada cambio de estado se convierte en una entrada independiente de auditoría.
    const revision = this.verificacionRepo.crearRevision({
      anunciante: solicitud.anunciante,
      numero_revision: solicitud.numero_revision,
      estado,
      motivo,
    });
    return this.verificacionRepo.guardarRevision(revision);
  }

  private async subirDocumento(
    archivo: ArchivoSubido,
    idUsuario: number,
    tipo: string,
  ): Promise<string> {
    if (archivo.size > 5 * 1024 * 1024) {
      throw new BadRequestException(
        `El archivo de ${tipo} supera el tamaño máximo de 5 MB`,
      );
    }
    let contenido: Buffer;
    try {
      contenido = await sharp(archivo.buffer).jpeg({ quality: 80 }).toBuffer();
    } catch {
      throw new BadRequestException(
        `El archivo de ${tipo} no es una imagen válida`,
      );
    }
    return this.archivosRepo.subir(
      'verificaciones',
      `usuarios/${idUsuario}/${tipo}-${randomUUID()}.jpg`,
      contenido,
      'image/jpeg',
    );
  }
}
