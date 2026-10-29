import { type IMailService, MAIL_SERVICE } from '../../mail/mail.interface';
import {
  type IVerificacionRepository,
  VERIFICACION_REPOSITORY,
} from '../repository/verificacion.repository.interface';
import { AnunciantesService } from '../../anunciantes/service/anunciantes.service';
import {
  type IArchivoRepository,
  ARCHIVO_REPOSITORY,
} from '../../common/almacenamiento/archivo.repository.interface';
import { randomUUID } from 'node:crypto';
import {
  Inject,
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SolicitarAnuncianteDto } from '../dto/solicitar-anunciante.dto';
import { UsuariosService } from '../../usuarios/service/usuarios.service';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import {
  EstadoVerificacion,
  SolicitudVerificacion,
} from '../entity/solicitud-verificacion.entity';

import { RechazarVerificacionDto } from '../dto/rechazar-verificacion.dto';
import { PruebaVidaService } from './prueba-vida.service';
import { DatosInmobiliariaDto } from '../dto/datos-inmobiliaria.dto';
import type { RevisarVerificacionDto } from '../dto/revisar-verificacion.dto';
import sharp from 'sharp';

@Injectable()
export class VerificacionAnuncianteService {
  private readonly logger = new Logger(VerificacionAnuncianteService.name);

  constructor(
    private readonly anunciantesService: AnunciantesService,
    private readonly usuariosService: UsuariosService,
    private readonly catalogosService: CatalogosService,
    @Inject(VERIFICACION_REPOSITORY)
    private readonly verificacionRepo: IVerificacionRepository,
    @Inject(MAIL_SERVICE)
    private readonly mailService: IMailService,
    @Inject(ARCHIVO_REPOSITORY)
    private readonly archivosRepo: IArchivoRepository,
    private readonly pruebaVidaService: PruebaVidaService,
  ) {}

  /** Guarda los datos como borrador y evita que un usuario tenga dos solicitudes. */
  async solicitarAlta(idUsuario: number, dto: SolicitarAnuncianteDto) {
    const usuario = await this.usuariosService.buscarPorId(idUsuario);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const existeAnunciante =
      await this.anunciantesService.buscarPorUsuario(idUsuario);
    // La PK coincide con el usuario, por lo que solo puede existir una solicitud por persona.
    if (existeAnunciante)
      throw new ConflictException('El usuario ya solicitó ser anunciante');

    const tipoAnunciante = await this.catalogosService.getTipoAnunciantePorId(
      dto.idTipoAnunciante,
    );

    if (!tipoAnunciante)
      throw new NotFoundException('Tipo de anunciante no válido');

    const datosEmpresa = this.datosEmpresa(
      dto,
      tipoAnunciante.esInmobiliaria(),
    );
    // El anunciante se crea primero para poder asociarle la solicitud de identidad.
    const anunciante = await this.anunciantesService.crearPendiente({
      usuario,
      cuit_cuil: dto.cuit,
      numero_contacto: dto.numero_contacto,
      tipoAnunciante,
    });
    // Todavía no llega a administración: queda como borrador hasta que la
    // prueba de vida y la carga documental sean exitosas.
    const solicitud = this.verificacionRepo.crearSolicitud({
      anunciante,
      estado: EstadoVerificacion.BORRADOR,
      numero_revision: 1,
      ...datosEmpresa,
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

  actualizarDatosInmobiliaria(idUsuario: number, dto: DatosInmobiliariaDto) {
    return this.verificacionRepo.conSolicitudBloqueada(
      idUsuario,
      async (solicitud, persistencia) => {
        if (
          !solicitud ||
          !solicitud.anunciante.tipoAnunciante?.esInmobiliaria()
        ) {
          throw new NotFoundException(
            'No hay una solicitud de inmobiliaria para esta cuenta',
          );
        }
        if (!solicitud.puedeRecibirDocumentos(solicitud.estaRechazada())) {
          throw new ConflictException(
            'Solo podés corregir datos antes de enviarlos o después de un rechazo',
          );
        }
        Object.assign(solicitud, this.datosEmpresa(dto, true));
        return persistencia.guardarSolicitud(solicitud);
      },
    );
  }

  /** Carga y valida los tres documentos obligatorios de identidad. */
  async subirDocumentos(
    idUsuario: number,
    archivos: {
      dni_frente?: Express.Multer.File[];
      dni_dorso?: Express.Multer.File[];
      rostro?: Express.Multer.File[];
      matricula?: Express.Multer.File[];
      constancia_cuit?: Express.Multer.File[];
    },
    verificationToken: string,
    reenvio = false,
  ) {
    // Se recupera la solicitud vigente y se impide modificar una ya aprobada.
    const solicitud = await this.obtenerSolicitud(idUsuario);
    if (solicitud.estaAprobada()) {
      throw new ConflictException('La identidad ya fue aprobada');
    }
    if (!solicitud.puedeRecibirDocumentos(reenvio)) {
      throw new ConflictException(
        'La solicitud no admite documentos nuevos en su estado actual',
      );
    }

    const esEmpresa =
      solicitud.anunciante.tipoAnunciante?.esInmobiliaria() ?? false;
    if (
      esEmpresa &&
      (!solicitud.tieneDatosInmobiliaria() ||
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
        !actual.puedeRecibirDocumentos(reenvio) ||
        !actual.autorizacionPruebaVidaVigente(
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
          vigente.presentarDocumentos(
            {
              dniFrente: subidos[0],
              dniDorso: subidos[1],
              rostro: subidos[2],
            },
            reenvio,
          );
          if (esEmpresa) {
            if (!vigente.tieneDatosInmobiliaria())
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
          subidos.map((url) => this.archivosRepo.eliminarDocumentoPropio(url)),
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
      const email = solicitud.emailSolicitante();
      if (!email)
        throw new Error('El solicitante no tiene un correo registrado');
      const administradores =
        await this.usuariosService.emailsAdministradores();
      await this.mailService.enviarSolicitudParaRevision(
        administradores,
        solicitud.nombreSolicitante(),
        email,
      );
    } catch (error) {
      this.logger.error(
        'No se pudo avisar al equipo administrador sobre la solicitud',
        error as Error,
      );
    }
    return guardada;
  }

  /** Solo una resolución administrativa habilita a publicar. */
  async aprobar(
    idAnunciante: number,
    idAdministrador: number,
    dto: RevisarVerificacionDto,
  ): Promise<Anunciante> {
    const solicitud = await this.resolverRevision(
      idAnunciante,
      idAdministrador,
      dto.numero_revision,
      EstadoVerificacion.APROBADA,
    );
    await this.notificarResolucion(solicitud, true);
    return solicitud.anunciante;
  }

  async rechazar(
    idAnunciante: number,
    idAdministrador: number,
    dto: RechazarVerificacionDto,
  ): Promise<{ mensaje: string }> {
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
    await this.notificarResolucion(solicitud, false);
    return { mensaje: 'Solicitud de verificación rechazada' };
  }

  private resolverRevision(
    idAnunciante: number,
    idAdministrador: number,
    numeroRevision: number,
    estado: EstadoVerificacion.APROBADA | EstadoVerificacion.RECHAZADA,
    motivo: string | null = null,
  ): Promise<SolicitudVerificacion> {
    return this.verificacionRepo.conSolicitudBloqueada(
      idAnunciante,
      async (solicitud, persistencia) => {
        if (!solicitud)
          throw new NotFoundException(
            'Solicitud de verificación no encontrada',
          );
        if (!solicitud.estaPendienteDeRevision()) {
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
            !solicitud.tieneDocumentacionCompleta() ||
            !solicitud.tienePruebaVidaPresentada()
          ) {
            throw new ConflictException(
              'Falta documentación o una prueba de vida registrada. Solicitá una nueva captura',
            );
          }
          if (
            solicitud.anunciante.tipoAnunciante?.esInmobiliaria() &&
            !solicitud.tieneDocumentacionInmobiliaria()
          ) {
            throw new ConflictException(
              'Faltan datos o constancias de la inmobiliaria',
            );
          }
          solicitud.aprobar();
          solicitud.anunciante.verificar();
          await persistencia.guardarAnunciante(solicitud.anunciante);
        } else {
          solicitud.rechazar(motivo!);
        }
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

  private async notificarResolucion(
    solicitud: SolicitudVerificacion,
    aprobada: boolean,
  ) {
    try {
      const email = solicitud.emailSolicitante();
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

  async buscarSolicitudConHistorial(idUsuario: number) {
    // Expone la solicitud y las decisiones administrativas anteriores.
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

  private async subirConstancia(
    archivo: Express.Multer.File,
    idUsuario: number,
    nombre: string,
  ) {
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
      return this.archivosRepo.subir(
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

  private async subirDocumento(
    archivo: Express.Multer.File,
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
