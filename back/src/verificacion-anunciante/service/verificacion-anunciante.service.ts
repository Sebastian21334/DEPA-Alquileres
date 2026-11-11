import { EstadoVerificacion } from '../../catalogos/estados';
import { type IMailService, MAIL_SERVICE } from '../../mail/mail.interface';
import {
  type IVerificacionRepository,
  VERIFICACION_REPOSITORY,
} from '../repository/verificacion.repository.interface';
import { AnunciantesService } from '../../anunciantes/service/anunciantes.service';
import { AlmacenamientoService } from '../../almacenamiento/service/almacenamiento.service';
import { randomUUID } from 'node:crypto';
import {
  Inject,
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SolicitarAnuncianteDto } from '../dto/solicitar-anunciante.dto';
import { UsuariosService } from '../../usuarios/service/usuarios.service';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import { SolicitudVerificacion } from '../entity/solicitud-verificacion.entity';

import { RechazarVerificacionDto } from '../dto/rechazar-verificacion.dto';
import { PruebaVidaService } from './prueba-vida.service';
import { DatosInmobiliariaDto } from '../dto/datos-inmobiliaria.dto';
import type { RevisarVerificacionDto } from '../dto/revisar-verificacion.dto';
import sharp from 'sharp';
import { EliminacionDocumentosService } from './eliminacion-documentos.service';
import {
  CAMPOS_PRUEBA_PRIVADOS,
  type SolicitudVerificacionRespuestaDto,
} from '../dto/solicitud-verificacion-respuesta.dto';

@Injectable()
export class VerificacionAnuncianteService {
  private readonly logger = new Logger(VerificacionAnuncianteService.name);

  constructor(private readonly anunciantesService: AnunciantesService, private readonly usuariosService: UsuariosService, private readonly catalogosService: CatalogosService, @Inject(VERIFICACION_REPOSITORY) private readonly verificacionRepo: IVerificacionRepository, @Inject(MAIL_SERVICE) private readonly mailService: IMailService, private readonly almacenamientoService: AlmacenamientoService, private readonly pruebaVidaService: PruebaVidaService, private readonly eliminacionDocumentos: EliminacionDocumentosService) {}

  /** Guarda los datos como borrador y evita que un usuario tenga dos solicitudes. */
  async solicitarAlta(idUsuario: number, dto: SolicitarAnuncianteDto) {
    const tipoAnunciante = await this.catalogosService.getTipoAnunciantePorId(
      dto.idTipoAnunciante,
    );

    if (!tipoAnunciante)
      throw new NotFoundException('Tipo de anunciante no válido');

    const datosEmpresa = this.datosEmpresa(
      dto,
      this.catalogosService.esInmobiliaria(tipoAnunciante),
    );
    let anunciante: Anunciante;
    try {
      anunciante = await this.verificacionRepo.conTransaccion(async (transaccion) => {
        // El bloqueo coordina el alta con otra solicitud o con una baja de la cuenta.
        const usuario = await this.usuariosService.bloquearParaAltaAnunciante(idUsuario, transaccion);
        if (await this.anunciantesService.buscarPorUsuario(idUsuario, transaccion)) {
          throw new ConflictException('El usuario ya solicitó ser anunciante');
        }
        const nuevo = await this.anunciantesService.crearPendiente({
          usuario,
          cuit_cuil: dto.cuit,
          numero_contacto: dto.numero_contacto,
          tipoAnunciante,
        }, transaccion);
        const solicitud = this.verificacionRepo.crearSolicitud({
          anunciante: nuevo,
          estado: EstadoVerificacion.BORRADOR,
          numero_revision: 1,
          ...datosEmpresa,
        });
        await this.verificacionRepo.guardarSolicitud(solicitud, transaccion);
        return nuevo;
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('No se pudo guardar la solicitud de anunciante');
      throw new InternalServerErrorException('No se pudo iniciar la solicitud. Intentá nuevamente.');
    }
    const { usuario } = anunciante;
    if (usuario.email) {
      try {
        await this.mailService.enviarSolicitudAnunciante(usuario.email);
      } catch (error) {
        this.logger.error(
          `No se pudo confirmar la solicitud de anunciante a ${usuario.email}`,
          error as Error,
        );
      }
    }
    return anunciante;
  }

  private datosEmpresa(dto: Partial<DatosInmobiliariaDto>, requerida: boolean) {
    const datos = {
      razon_social: dto.razon_social?.trim() || null,
      matricula_profesional: dto.matricula_profesional?.trim() || null,
      colegio_profesional: dto.colegio_profesional?.trim() || null,
      domicilio_comercial: dto.domicilio_comercial?.trim() || null,
      dni_corredor: dto.dni_corredor?.trim() || null,
    };
    if (
      requerida &&
      (Object.values(datos).some((valor) => !valor) ||
        !/^\d{7,8}$/.test(datos.dni_corredor ?? ''))
    ) {
      throw new BadRequestException(
        'Completá razón social, matrícula, colegio, domicilio comercial y DNI del corredor responsable',
      );
    }
    return requerida ? datos : {};
  }

  async actualizarDatosInmobiliaria(idUsuario: number, dto: DatosInmobiliariaDto) {
    const guardada = await this.verificacionRepo.conSolicitudBloqueada(
      idUsuario,
      async (solicitud, persistencia) => {
        if (
          !solicitud ||
          !this.catalogosService.esInmobiliaria(solicitud.anunciante.tipoAnunciante)
        ) {
          throw new NotFoundException(
            'No hay una solicitud de inmobiliaria para esta cuenta',
          );
        }
        if (!this.pruebaVidaService.puedeRecibirDocumentos(solicitud, solicitud.estado === EstadoVerificacion.RECHAZADA)) {
          throw new ConflictException(
            'Solo podés corregir datos antes de enviarlos o después de un rechazo',
          );
        }
        Object.assign(solicitud, this.datosEmpresa(dto, true));
        return persistencia.guardarSolicitud(solicitud);
      },
    );
    return this.respuestaSolicitud(guardada);
  }

  /** Carga y valida los tres documentos obligatorios de identidad. */
  async subirDocumentos(idUsuario: number, archivos: { dni_frente?: Express.Multer.File[]; dni_dorso?: Express.Multer.File[]; rostro?: Express.Multer.File[]; matricula?: Express.Multer.File[]; constancia_cuit?: Express.Multer.File[]; }, verificationToken: string, reenvio = false) {
    // Se recupera la solicitud vigente y se impide modificar una ya aprobada.
    const solicitud = await this.obtenerSolicitud(idUsuario);
    if (solicitud.estado === EstadoVerificacion.APROBADA) {
      throw new ConflictException('La identidad ya fue aprobada');
    }
    if (!this.pruebaVidaService.puedeRecibirDocumentos(solicitud, reenvio)) {
      throw new ConflictException(
        'La solicitud no admite documentos nuevos en su estado actual',
      );
    }

    const esEmpresa =
      this.catalogosService.esInmobiliaria(solicitud.anunciante.tipoAnunciante);
    if (
      esEmpresa &&
      (!this.tieneDatosInmobiliaria(solicitud) ||
        !archivos.matricula?.[0] ||
        !archivos.constancia_cuit?.[0])
    ) {
      throw new BadRequestException(
        'La inmobiliaria debe completar sus datos y adjuntar matrícula y constancia de CUIT',
      );
    }
    if (
      !esEmpresa &&
      (archivos.matricula?.length || archivos.constancia_cuit?.length)
    ) {
      throw new BadRequestException(
        'Las constancias institucionales corresponden a inmobiliarias',
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
    const autorizacion =
      await this.pruebaVidaService.verificarCapturaAutorizada(
        idUsuario,
        verificationToken,
        rostro.buffer,
      );
    const comprobarAutorizacion = (actual: SolicitudVerificacion | null) => {
      if (
        !actual ||
        actual.id !== autorizacion.solicitudId ||
        !this.pruebaVidaService.puedeRecibirDocumentos(actual, reenvio) ||
        !this.pruebaVidaService.autorizacionPruebaVidaVigente(
          actual,
          autorizacion.jti,
          autorizacion.revision,
          autorizacion.livePhotoHash,
        )
      )
        throw new ConflictException(
          'La autorización de prueba de vida venció, fue utilizada o pertenece a otra revisión',
        );
      return actual;
    };
    await this.verificacionRepo.conSolicitudBloqueada(
      idUsuario,
      async (actual) => {
        comprobarAutorizacion(actual);
      },
    );

    // El almacenamiento externo queda fuera del bloqueo. Antes de confirmar
    // se verifica otra vez la autorización y se consume en la misma transacción.
    const subidos: string[] = [];
    let confirmacionIniciada = false;
    let guardada: SolicitudVerificacion;
    try {
      for (const [archivo, nombre] of [
        [frente, 'dni-frente'],
        [dorso, 'dni-dorso'],
        [rostro, 'rostro'],
      ] as const)
        subidos.push(await this.subirDocumento(archivo, idUsuario, nombre));
      if (esEmpresa) {
        subidos.push(
          await this.subirConstancia(
            archivos.matricula![0],
            idUsuario,
            'matricula',
          ),
        );
        subidos.push(
          await this.subirConstancia(
            archivos.constancia_cuit![0],
            idUsuario,
            'constancia-cuit',
          ),
        );
      }
      confirmacionIniciada = true;
      guardada = await this.verificacionRepo.conSolicitudBloqueada(
        idUsuario,
        async (actual, persistencia) => {
          const vigente = comprobarAutorizacion(actual);
          this.presentarDocumentos(
            vigente,
            {
              dniFrente: subidos[0],
              dniDorso: subidos[1],
              rostro: subidos[2],
            },
            reenvio,
          );
          if (esEmpresa) {
            if (!this.tieneDatosInmobiliaria(vigente))
              throw new ConflictException('Faltan datos de la inmobiliaria');
            vigente.matricula_url = subidos[3];
            vigente.constancia_cuit_url = subidos[4];
          }
          vigente.prueba_vida_consumida_en = new Date();
          return persistencia.guardarSolicitud(vigente);
        },
      );
    } catch (error) {
      // Un error de conexión durante COMMIT puede tener un resultado incierto.
      // No borrar archivos que podrían haber quedado vinculados a la solicitud.
      if (!confirmacionIniciada || error instanceof ConflictException) {
        const limpieza = await Promise.allSettled(
          subidos.map((url) => this.almacenamientoService.eliminarDocumentoPropio(url)),
        );
        if (limpieza.some((resultado) => resultado.status === 'rejected')) {
          this.logger.error(
            'Quedó pendiente limpiar documentos de una presentación fallida',
          );
        }
      }
      throw error;
    }
    try {
      const { nombre, email } = this.anunciantesService.datosContacto(
        solicitud.anunciante,
      );
      if (!email)
        throw new Error('El solicitante no tiene un correo registrado');
      const administradores =
        await this.usuariosService.emailsAdministradores();
      await this.mailService.enviarSolicitudParaRevision(
        administradores,
        nombre,
        email,
      );
    } catch (error) {
      this.logger.error(
        'No se pudo avisar al equipo administrador sobre la solicitud',
        error as Error,
      );
    }
    return this.respuestaSolicitud(guardada);
  }

  /** Solo una resolución administrativa habilita a publicar. */
  async aprobar(idAnunciante: number, idAdministrador: number, dto: RevisarVerificacionDto): Promise<Anunciante> {
    const solicitud = await this.resolverRevision(
      idAnunciante,
      idAdministrador,
      dto.numero_revision,
      EstadoVerificacion.APROBADA,
    );
    await this.eliminacionDocumentos.ejecutar();
    await this.notificarResolucion(solicitud, true);
    return solicitud.anunciante;
  }

  async rechazar(idAnunciante: number, idAdministrador: number, dto: RechazarVerificacionDto): Promise<{ mensaje: string }> {
    const motivo = dto.motivo.trim();
    if (motivo.length < 5 || motivo.length > 500) {
      throw new BadRequestException(
        'El motivo debe contener entre 5 y 500 caracteres',
      );
    }
    const solicitud = await this.resolverRevision(
      idAnunciante,
      idAdministrador,
      dto.numero_revision,
      EstadoVerificacion.RECHAZADA,
      motivo,
    );
    await this.eliminacionDocumentos.ejecutar();
    await this.notificarResolucion(solicitud, false);
    return { mensaje: 'Solicitud de verificación rechazada' };
  }

  private resolverRevision(idAnunciante: number, idAdministrador: number, numeroRevision: number, estado: typeof EstadoVerificacion.APROBADA | typeof EstadoVerificacion.RECHAZADA, motivo: string | null = null): Promise<SolicitudVerificacion> {
    return this.verificacionRepo.conSolicitudBloqueada(
      idAnunciante,
      async (solicitud, persistencia, transaccion) => {
        if (!solicitud)
          throw new NotFoundException(
            'Solicitud de verificación no encontrada',
          );
        if (!this.estaPendienteDeRevision(solicitud)) {
          throw new ConflictException(
            'La solicitud ya fue resuelta o no está pendiente de revisión',
          );
        }
        if (solicitud.numero_revision !== numeroRevision) {
          throw new ConflictException(
            'La documentación cambió. Actualizá la solicitud antes de resolverla',
          );
        }
        if (estado === EstadoVerificacion.APROBADA) {
          if (
            !this.tieneDocumentacionCompleta(solicitud) ||
            !this.pruebaVidaService.tienePruebaVidaPresentada(solicitud)
          ) {
            throw new ConflictException(
              'Falta documentación o una prueba de vida registrada. Solicitá una nueva captura',
            );
          }
          if (
            this.catalogosService.esInmobiliaria(solicitud.anunciante.tipoAnunciante) &&
            !this.tieneDocumentacionInmobiliaria(solicitud)
          ) {
            throw new ConflictException(
              'Faltan datos o constancias de la inmobiliaria',
            );
          }
          this.marcarAprobada(solicitud);
          await this.anunciantesService.verificar(solicitud.anunciante, transaccion,);

        } else {
          this.marcarRechazada(solicitud, motivo!);
        }
        // La cola y la resolución se confirman juntas. Azure se procesa después
        // del COMMIT: una transacción fallida nunca borra evidencia pendiente.
        await persistencia.programarEliminacionDocumentos(
          this.retirarDocumentos(solicitud),
        );
        await persistencia.guardarSolicitud(solicitud);
        await persistencia.guardarRevision(
          this.verificacionRepo.crearRevision({
            anunciante: solicitud.anunciante,
            numero_revision: solicitud.numero_revision,
            estado,
            motivo,
            id_administrador: idAdministrador,
          }),
        );
        return solicitud;
      },
    );
  }

  private tieneDatosInmobiliaria(solicitud: SolicitudVerificacion): boolean {
    return !!(
      solicitud.razon_social?.trim() &&
      solicitud.matricula_profesional?.trim() &&
      solicitud.colegio_profesional?.trim() &&
      solicitud.domicilio_comercial?.trim() &&
      solicitud.dni_corredor?.trim()
    );
  }

  private tieneDocumentacionInmobiliaria(solicitud: SolicitudVerificacion): boolean {
    return (
      this.tieneDatosInmobiliaria(solicitud) &&
      !!solicitud.matricula_url &&
      !!solicitud.constancia_cuit_url
    );
  }

  private estaPendienteDeRevision(solicitud: SolicitudVerificacion): boolean {
    return solicitud.estado === EstadoVerificacion.PENDIENTE ||
      solicitud.estado === EstadoVerificacion.REENVIADA;
  }

  private tieneDocumentacionCompleta(solicitud: SolicitudVerificacion): boolean {
    return !!(solicitud.dni_frente_url && solicitud.dni_dorso_url && solicitud.rostro_url);
  }

  private retirarDocumentos(solicitud: SolicitudVerificacion): string[] {
    const documentos = [
      solicitud.dni_frente_url,
      solicitud.dni_dorso_url,
      solicitud.rostro_url,
      solicitud.matricula_url,
      solicitud.constancia_cuit_url,
    ].filter((url): url is string => !!url);
    solicitud.dni_frente_url = null;
    solicitud.dni_dorso_url = null;
    solicitud.rostro_url = null;
    solicitud.matricula_url = null;
    solicitud.constancia_cuit_url = null;
    solicitud.prueba_vida_desafio = null;
    solicitud.prueba_vida_revision = null;
    solicitud.prueba_vida_rostro_hash = null;
    solicitud.prueba_vida_vence_en = null;
    solicitud.prueba_vida_consumida_en = null;
    return [...new Set(documentos)];
  }

  private presentarDocumentos(solicitud: SolicitudVerificacion, urls: { dniFrente: string; dniDorso: string; rostro: string }, reenvio: boolean): void {
    solicitud.dni_frente_url = urls.dniFrente;
    solicitud.dni_dorso_url = urls.dniDorso;
    solicitud.rostro_url = urls.rostro;
    if (reenvio) solicitud.numero_revision += 1;
    solicitud.estado = reenvio
      ? EstadoVerificacion.REENVIADA
      : EstadoVerificacion.PENDIENTE;
    solicitud.motivo_rechazo = null;
    solicitud.actualizada_en = new Date();
  }

  private marcarAprobada(solicitud: SolicitudVerificacion): void {
    solicitud.estado = EstadoVerificacion.APROBADA;
    solicitud.motivo_rechazo = null;
    solicitud.actualizada_en = new Date();
  }

  private marcarRechazada(solicitud: SolicitudVerificacion, motivo: string): void {
    solicitud.estado = EstadoVerificacion.RECHAZADA;
    solicitud.motivo_rechazo = motivo.trim();
    solicitud.actualizada_en = new Date();
  }

  private async notificarResolucion(solicitud: SolicitudVerificacion, aprobada: boolean) {
    try {
      const { email } = this.anunciantesService.datosContacto(
        solicitud.anunciante,
      );
      if (!email)
        throw new Error('El solicitante no tiene un correo registrado');
      await this.mailService.enviarResultadoVerificacion(
        email,
        aprobada,
        solicitud.motivo_rechazo ?? undefined,
      );
    } catch (error) {
      // La decisión ya está confirmada. Un fallo de correo no la revierte.
      this.logger.error(
        'No se pudo notificar la resolución de verificación',
        error as Error,
      );
    }
  }

  private respuestaSolicitud(solicitud: SolicitudVerificacion): SolicitudVerificacionRespuestaDto {
    const privados: readonly string[] = CAMPOS_PRUEBA_PRIVADOS;
    return Object.fromEntries(
      Object.entries(solicitud).filter(([campo]) => !privados.includes(campo)),
    ) as SolicitudVerificacionRespuestaDto;
  }

  /** Devuelve las solicitudes que todavia requieren una decision administrativa. */
  async getPendientes() {
    const solicitudes = await this.verificacionRepo.buscarPendientes();
    // El contenedor de documentos es privado: la URL guardada no se puede abrir
    // directamente, así que al administrador se le entregan URLs firmadas temporales.
    return Promise.all(
      solicitudes.map(async (solicitud) => ({
        ...this.respuestaSolicitud(solicitud),
        dni_frente_url: await this.firmarUrlDocumento(solicitud.dni_frente_url),
        dni_dorso_url: await this.firmarUrlDocumento(solicitud.dni_dorso_url),
        rostro_url: await this.firmarUrlDocumento(solicitud.rostro_url),
        matricula_url: await this.firmarUrlDocumento(solicitud.matricula_url),
        constancia_cuit_url: await this.firmarUrlDocumento(
          solicitud.constancia_cuit_url,
        ),
      })),
    );
  }

  /** Genera una URL SAS de solo lectura válida por 15 minutos para un documento privado. */
  private async firmarUrlDocumento(url: string | null): Promise<string | null> {
    if (!url) return null;
    try {
      return await this.almacenamientoService.firmarDocumento(url);
    } catch {
      // Sin AccountKey en la connection string no se puede firmar; no se rompe el listado.
      this.logger.error('No se pudo firmar la URL del documento de verificación');
      return url;
    }
  }

  async buscarSolicitudConHistorial(idUsuario: number) {
    // Expone la solicitud y las decisiones administrativas anteriores.
    const solicitud =
      await this.verificacionRepo.buscarSolicitudPorAnunciante(idUsuario);
    if (!solicitud) return null;
    return {
      ...this.respuestaSolicitud(solicitud),
      revisiones: await this.verificacionRepo.buscarRevisiones(idUsuario),
    };
  }

  private async obtenerSolicitud(idUsuario: number): Promise<SolicitudVerificacion> {
    const solicitud =
      await this.verificacionRepo.buscarSolicitudPorAnunciante(idUsuario);
    if (!solicitud)
      throw new NotFoundException('No solicitaste ser anunciante todavía');
    return solicitud;
  }

  private async subirConstancia(archivo: Express.Multer.File, idUsuario: number, nombre: string) {
    if (
      archivo.size > 5 * 1024 * 1024 ||
      archivo.buffer.length > 5 * 1024 * 1024
    ) {
      throw new BadRequestException('La constancia no puede superar 5 MB');
    }
    if (archivo.mimetype === 'application/pdf') {
      if (
        archivo.buffer.subarray(0, 5).toString() !== '%PDF-' ||
        !archivo.buffer.subarray(-1024).includes(Buffer.from('%%EOF'))
      ) {
        throw new BadRequestException(
          'La constancia PDF no tiene un formato válido',
        );
      }
      return this.almacenamientoService.subir(
        'verificaciones',
        `usuarios/${idUsuario}/${nombre}-${randomUUID()}.pdf`,
        archivo.buffer,
        'application/pdf',
      );
    }
    if (!['image/jpeg', 'image/png'].includes(archivo.mimetype)) {
      throw new BadRequestException('Adjuntá la constancia en PDF, JPG o PNG');
    }
    return this.subirDocumento(archivo, idUsuario, nombre);
  }

  private async subirDocumento(archivo: Express.Multer.File, idUsuario: number, tipo: string): Promise<string> {
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
    return this.almacenamientoService.subir(
      'verificaciones',
      `usuarios/${idUsuario}/${tipo}-${randomUUID()}.jpg`,
      contenido,
      'image/jpeg',
    );
  }
}
