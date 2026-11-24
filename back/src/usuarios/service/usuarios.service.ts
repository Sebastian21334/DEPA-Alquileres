import { ROL } from '../../catalogos/codigos-catalogo';
import { OperacionesCuentaService } from './operaciones-cuenta.service';
import type { ParticipacionEnReserva } from '../../common/persistence/participacion-en-reserva';
import { UsuariosCredencialesService } from './usuarios-credenciales.service';
import { ListarAdministracionDto } from '../../common/dto/listar-administracion.dto';
import { AlmacenamientoService } from '../../almacenamiento/service/almacenamiento.service';
import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  ConflictException,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { USUARIOS_REPOSITORY } from '../repository/usuarios.repository.interface';
import type { IUsuariosRepository } from '../repository/usuarios.repository.interface';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Usuario, type DetalleBloqueo } from '../entity/usuario.entity';
import { ActualizarUsuarioDto } from '../dto/actualizar-usuario.dto';
import { PreparacionImagenesService } from '../../almacenamiento/service/preparacion-imagenes.service';
import type { EntityManager } from 'typeorm';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { AnunciantesService } from '../../anunciantes/service/anunciantes.service';
import type { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import { fechaArgentina } from '../../common/utils/fechas';
import { formatearNombreCompleto } from '../../common/utils/nombres';
import { ValorDuplicadoError } from '../../common/persistence/valor-duplicado.error';

import type { IMailCuenta } from '../../mail/mail.interface';
import { MAIL_SERVICE } from '../../mail/mail.interface';

/**
 * Tiempo durante el cual un checkout sin pago iniciado sigue impidiendo la
 * baja: cubre los 15 minutos de la preferencia y notificaciones demoradas.
 */
const MARGEN_CHECKOUT_SIN_PAGO_MS = 24 * 60 * 60 * 1000;
const AUDIENCIA_BAJA = 'confirmar-baja-propia';

type ConfirmacionBaja = { usuarioId: number; huella: string; exp: number };
const ENLACE_REACTIVACION_INVALIDO = {
  statusCode: HttpStatus.BAD_REQUEST,
  codigo: 'ENLACE_REACTIVACION_INVALIDO',
  message: 'El enlace de recuperación es inválido, venció o ya fue utilizado.',
};

/** Datos admitidos por el alta; el rol y los secretos se asignan en el servicio. */
type CrearUsuarioDatos = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  contrasenia: string;
};

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(@Inject(USUARIOS_REPOSITORY) private readonly usuariosRepo: IUsuariosRepository, private readonly catalogosService: CatalogosService, private readonly credencialesService: UsuariosCredencialesService, @Inject(MAIL_SERVICE) private readonly mailService: IMailCuenta, private readonly almacenamientoService: AlmacenamientoService, private readonly publicacionesService: PublicacionesService, private readonly anunciantesService: AnunciantesService, private readonly jwtService: JwtService, private readonly operacionesCuenta: OperacionesCuentaService, private readonly preparacionImagenes: PreparacionImagenesService) {}

  /** Busca un usuario por correo para validar duplicados o iniciar sesion. */
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepo.buscarPorEmail(email);
  }

  /** Busca un usuario por su clave primaria. */
  async buscarPorId(id: number, transaccion?: EntityManager): Promise<Usuario | null> {
    return this.usuariosRepo.buscarPorId(id, transaccion);
  }

  /** Busca al usuario por ID con su rol y versión de sesión para validar el token. */
  buscarParaSesion(idUsuario: number): Promise<Usuario | null> {
    return this.usuariosRepo.buscarParaSesion(idUsuario);
  }

  async bloquearParaAltaAnunciante(idUsuario: number, transaccion: EntityManager): Promise<Usuario> {
    const usuario = await this.usuariosRepo.buscarBloqueado(idUsuario, transaccion, true);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (!usuario.activa || usuario.bloqueado) {
      throw new ForbiddenException('La cuenta no está habilitada');
    }
    return usuario;
  }

  async cambiarPausaActividades(idUsuario: number, pausadas: boolean): Promise<{ actividades_pausadas: boolean }> {
    return this.usuariosRepo.conTransaccion(async (transaccion) => {
      const usuario = await this.usuariosRepo.buscarBloqueado(idUsuario, transaccion);
      if (!usuario?.activa || usuario.bloqueado) {
        throw new ForbiddenException('La cuenta debe estar habilitada');
      }

      await this.anunciantesService.cambiarPausaActividades(idUsuario, pausadas, transaccion);
      return { actividades_pausadas: pausadas };
    });
  }

  /** Registra el bloqueo o archiva su detalle al desbloquear. Evalúa los pendientes al bloquear para decidir el acceso limitado. */
  async cambiarBloqueoAdministrativo(idUsuario: number, bloqueado: boolean, idOperador: number, motivo?: string) {
    if (idUsuario === idOperador)
      throw new BadRequestException('No podés bloquearte o habilitarte a vos mismo');

    const motivoNormalizado = motivo?.trim();
    return this.usuariosRepo.conTransaccion(async (transaccion) => {
      const usuario = await this.usuariosRepo.buscarConBloqueo(idUsuario, transaccion);
      if (!usuario) throw new NotFoundException('Usuario no encontrado');
      if (!usuario.activa)
        throw new ConflictException('La cuenta fue dada de baja: no se puede bloquear ni habilitar');
      if (usuario.bloqueado === bloqueado) return { usuario, cambio: false };

      await this.publicacionesService.bloquearPublicacionesParaCambioDeCuenta(idUsuario, transaccion);
      usuario.bloqueado = bloqueado;
      if (bloqueado) {
        const accesoLimitado = await this.evaluarPendientesDeBloqueo(idUsuario, transaccion);
        usuario.bloqueoDetalle = {
          id: randomUUID(),
          motivo: motivoNormalizado || null,
          administradorId: idOperador,
          fecha: new Date().toISOString(),
          accesoLimitado: accesoLimitado !== null,
        };
      } else if (usuario.bloqueoDetalle) {
        usuario.historialBloqueos = [...(usuario.historialBloqueos ?? []), {
          ...usuario.bloqueoDetalle, fechaDesbloqueo: new Date().toISOString(), desbloqueadoPorId: idOperador,
        }];
      }
      await this.usuariosRepo.guardar(usuario, transaccion);
      return { usuario, cambio: true };
    });

  }

  /** Reevalúa el bloqueo vigente. Si ya no quedan pendientes, registra que terminó el acceso limitado. */
  async verificarAccesoLimitado(usuario: Usuario): Promise<{ anuncianteVerificado: boolean } | null> {
    const detalle = usuario.bloqueoDetalle;
    if (!usuario.activa || !usuario.bloqueado || !detalle || detalle.accesoLimitado === false) return null;

    return this.usuariosRepo.conTransaccion(async (transaccion) => {
      const vigente = await this.usuariosRepo.buscarConBloqueo(usuario.id, transaccion);
      if (!vigente?.activa || !vigente.bloqueado || vigente.bloqueoDetalle?.id !== detalle.id ||
          vigente.bloqueoDetalle.accesoLimitado === false) return null;

      const accesoLimitado = await this.evaluarPendientesDeBloqueo(vigente.id, transaccion);
      const permiteAcceso = accesoLimitado !== null;
      if (vigente.bloqueoDetalle.accesoLimitado !== permiteAcceso) {
        vigente.bloqueoDetalle.accesoLimitado = permiteAcceso;
        await this.usuariosRepo.guardar(vigente, transaccion);
      }
      return accesoLimitado;
    });
  }

  /** Consulta el acceso limitado dentro de la transacción del llamador. Si un bloqueo antiguo no trae ese dato, lo calcula. */
  async consultarAccesoPendiente(idUsuario: number, transaccion: EntityManager): Promise<boolean> {
    const usuario = await this.usuariosRepo.buscarConBloqueo(idUsuario, transaccion, false);
    if (!usuario?.activa || !usuario.bloqueado || !usuario.bloqueoDetalle) return false;
    return usuario.bloqueoDetalle.accesoLimitado ??
      (await this.evaluarPendientesDeBloqueo(idUsuario, transaccion) !== null);
  }

  /** Comprueba si una cuenta activa puede seguir conversando por estar habilitada o conservar acceso limitado. */
  async puedeContinuarConversaciones(usuario: Usuario, transaccion?: EntityManager): Promise<boolean> {
    if (!usuario.activa) return false;
    if (!usuario.bloqueado) return true;
    if (!transaccion) {
      const vigente = await this.usuariosRepo.buscarConBloqueo(usuario.id);
      return Boolean(vigente?.activa && (!vigente.bloqueado || await this.verificarAccesoLimitado(vigente)));
    }
    const vigente = await this.usuariosRepo.buscarConBloqueo(usuario.id, transaccion, false);
    return Boolean(vigente?.activa && (!vigente.bloqueado ||
      (vigente.bloqueoDetalle && vigente.bloqueoDetalle.accesoLimitado !== false &&
        await this.evaluarPendientesDeBloqueo(usuario.id, transaccion))));
  }

  async validarCuentaParaNuevaReserva(idUsuario: number, transaccion: EntityManager): Promise<void> {
    const usuario = await this.usuariosRepo.buscarBloqueado(idUsuario, transaccion);
    if (!usuario?.activa || usuario.bloqueado) {
      throw new ForbiddenException('La cuenta no puede iniciar nuevas reservas');
    }
  }

  nombreCompleto(usuario: Usuario): string {
    return formatearNombreCompleto(usuario.nombre, usuario.apellido);
  }

  /** Actualiza datos personales propios o de otro usuario cuando opera un administrador. */
  async actualizarDatosPersonales(idUsuario: number, dto: ActualizarUsuarioDto, idOperador: number, rolOperador?: string) {
    if (idUsuario !== idOperador && rolOperador !== ROL.ADMINISTRADOR) {
      throw new ForbiddenException('Solo podés modificar tus propios datos');
    }

    const usuario = await this.usuariosRepo.buscarPorId(idUsuario);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (dto.nombre !== undefined) usuario.nombre = dto.nombre.trim();
    if (dto.apellido !== undefined) usuario.apellido = dto.apellido.trim();
    if (dto.telefono !== undefined) usuario.telefono = dto.telefono.trim();

    const usuarioActualizado = await this.usuariosRepo.guardar(usuario);
    return this.usuarioSinSecretos(usuarioActualizado);
  }

  async solicitarBajaPropia(idUsuario: number, origen?: string): Promise<{ mensaje: string }> {
    const { email, huella, esAnunciante } = await this.usuariosRepo.conTransaccion(async (transaccion) => {
      const usuario = await this.usuariosRepo.buscarBloqueado(idUsuario, transaccion, false, true);
      if (!usuario?.activa || usuario.bloqueado || !usuario.email || !usuario.email_verificado)
        throw new ForbiddenException('Necesitás una cuenta habilitada y un correo verificado para solicitar la baja');

      await this.validarBajaEnCurso(idUsuario, transaccion);
      const anunciante = await this.anunciantesService.buscarPorUsuario(idUsuario, transaccion);
      return { email: usuario.email, huella: this.huellaBaja(usuario), esAnunciante: anunciante?.verificado === true };
    });

    // El identificador usa un campo propio para que el enlace nunca sirva para iniciar sesión.
    const token = await this.jwtService.signAsync({ usuarioId: idUsuario, huella, esAnunciante }, {
      audience: AUDIENCIA_BAJA, algorithm: 'HS256', expiresIn: '30m',
    });
    try {
      await this.mailService.enviarConfirmacionBaja(email, token, origen);
    } catch {
      this.logger.warn(`Falló el correo de confirmación de baja para el usuario ${idUsuario}`);
      throw new ServiceUnavailableException('No pudimos enviar el correo de confirmación. Volvé a intentarlo.');
    }
    return { mensaje: 'Te enviamos un enlace de confirmación. Tu cuenta sigue activa.' };
  }

  async confirmarBajaPropia(token: string): Promise<{ mensaje: string; usuarioId: number }> {
    let confirmacion: ConfirmacionBaja;
    try {
      confirmacion = await this.jwtService.verifyAsync<ConfirmacionBaja>(token, {
        audience: AUDIENCIA_BAJA, algorithms: ['HS256'],
      });
    } catch {
      throw new BadRequestException('El enlace de baja es inválido, venció o ya fue utilizado');
    }
    if (!Number.isInteger(confirmacion.usuarioId) || confirmacion.usuarioId < 1 ||
        confirmacion.usuarioId > 2_147_483_647 || !Number.isInteger(confirmacion.exp) || typeof confirmacion.huella !== 'string')
      throw new BadRequestException('El enlace de baja es inválido, venció o ya fue utilizado');

    const resultado = await this.darDeBajaCuenta(confirmacion.usuarioId, confirmacion);
    return { ...resultado, usuarioId: confirmacion.usuarioId };
  }

  private huellaBaja(usuario: Usuario): string {
    const datos = [usuario.id, usuario.email, usuario.bloqueoDetalle?.id ?? null];
    if (usuario.version_sesion) datos.push(usuario.version_sesion);
    return createHmac('sha256', usuario.contrasenia)
      .update(JSON.stringify(datos))
      .digest('base64url');
  }

  /** El panel administrativo aplica la misma baja lógica; no borra relaciones. */
  async eliminar(idUsuario: number, idOperador: number) {
    if (idUsuario === idOperador) {
      throw new BadRequestException(
        'No podés dar de baja tu cuenta desde el panel administrativo',
      );
    }
    return this.darDeBajaCuenta(idUsuario);
  }

  private async darDeBajaCuenta(idUsuario: number, confirmacion?: ConfirmacionBaja) {
    await this.usuariosRepo.conTransaccion(async (transaccion) => {
      const usuario = await this.usuariosRepo.buscarBloqueado(idUsuario, transaccion, false, !!confirmacion);
      if (confirmacion && (!usuario?.activa || usuario.bloqueado || !usuario.email || !usuario.email_verificado ||
        confirmacion.exp * 1_000 <= Date.now() || this.huellaBaja(usuario) !== confirmacion.huella))
        throw new BadRequestException('El enlace de baja es inválido, venció o ya fue utilizado');
      if (!usuario) throw new NotFoundException('Usuario no encontrado');
      if (!usuario.activa) throw new ConflictException('La cuenta ya está inactiva');

      await this.validarBajaEnCurso(idUsuario, transaccion);

      await this.publicacionesService.desactivarPorBajaDeCuenta(idUsuario, transaccion);
      await this.anunciantesService.archivarCuitPorBajaDeCuenta(idUsuario, transaccion);

      // La baja lógica conserva el correo en el historial y libera el original.
      usuario.activa = false;
      usuario.fecha_baja = new Date();
      usuario.baja_recuperable = !!confirmacion;
      if (usuario.email) {
        usuario.email_historico = usuario.email;
        usuario.email = null;
      }
      usuario.token_verificacion = null;
      usuario.token_verificacion_expira = null;
      usuario.token_recuperacion = null;
      usuario.token_recuperacion_expira = null;
      await this.usuariosRepo.guardar(usuario, transaccion);
    });

    return { mensaje: 'Tu cuenta fue dada de baja correctamente' };
  }

  async generarTokenReactivacion(email: string): Promise<string | null> {
    if (await this.usuariosRepo.buscarPorEmail(email)) return null;
    const anterior = await this.usuariosRepo.buscarBajaRecuperable(email);
    if (!anterior) return null;

    const token = randomBytes(32).toString('hex');
    const vence = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const guardado = await this.usuariosRepo.guardarTokenReactivacion(
      anterior.id, email, createHash('sha256').update(token).digest('hex'), vence,
    );
    return guardado ? token : null;
  }

  async reactivarCuenta(token: string): Promise<void> {
    const hashToken = createHash('sha256').update(token).digest('hex');
    const candidato = await this.usuariosRepo.buscarPorTokenReactivacion(hashToken);
    const email = candidato?.email_historico;
    if (!candidato || !email) throw new BadRequestException(ENLACE_REACTIVACION_INVALIDO);
    try {
      await this.usuariosRepo.conTransaccion(async (transaccion) => {
        const reactivada = await this.usuariosRepo.reactivar(
          candidato.id, email, candidato.contrasenia, hashToken, randomUUID(), transaccion,
        );
        if (!reactivada) throw new BadRequestException(ENLACE_REACTIVACION_INVALIDO);
        await this.anunciantesService.restaurarCuitPorReactivacion(candidato.id, transaccion);
      });
    } catch (error) {
      if (error instanceof ValorDuplicadoError) {
        throw new ConflictException('El email ya está en uso en otra cuenta.');
      }
      throw error;
    }
  }

  /** Bloquea las publicaciones antes de verificar si la cuenta se puede dar de baja. */
  private async validarBajaEnCurso(idUsuario: number, transaccion: EntityManager): Promise<void> {
    // Comparte el bloqueo de publicaciones con el calendario de reservas.
    const tienePublicaciones = await this.publicacionesService
      .bloquearPublicacionesParaCambioDeCuenta(idUsuario, transaccion);
    await this.validarOperacionesResueltas(transaccion, idUsuario, tienePublicaciones);
  }

  /** Impide la baja cuando quedan operaciones pendientes e informa los motivos por rol. */
  private async validarOperacionesResueltas(transaccion: EntityManager, idUsuario: number, tienePublicaciones: boolean): Promise<void> {
    const pendientes = await this.obtenerOperacionesPendientes(idUsuario, tienePublicaciones, transaccion);
    if (pendientes.length) {
      throw new ConflictException(
        'No se puede dar de baja la cuenta porque tiene operaciones sin resolver ' +
        `(${pendientes.join('; ')}). ` +
        'Primero resolvé las reservas, los pagos, las liquidaciones y los reclamos pendientes.',
      );
    }
  }

  /** Agrupa los motivos pendientes como inquilino y, cuando corresponde, como anunciante. */
  private async obtenerOperacionesPendientes(idUsuario: number, tienePublicaciones: boolean, transaccion: EntityManager): Promise<string[]> {
    const pendientes: string[] = [];
    if (tienePublicaciones) {
      const anunciante = await this.pendientesCuenta(idUsuario, 'Anunciante', transaccion);
      if (anunciante.length) pendientes.push(`como Anunciante: ${anunciante.join(', ')}`);
    }
    const inquilino = await this.pendientesCuenta(idUsuario, 'Inquilino', transaccion);
    if (inquilino.length) pendientes.push(`como Inquilino: ${inquilino.join(', ')}`);

    return pendientes;
  }

  /** Devuelve si el anunciante está verificado cuando quedan pendientes. Si todo está resuelto, devuelve null. */
  private async evaluarPendientesDeBloqueo(idUsuario: number, transaccion: EntityManager): Promise<{ anuncianteVerificado: boolean } | null> {
    const perfil = await this.anunciantesService.buscarPorUsuario(idUsuario, transaccion);
    const anuncianteVerificado = perfil?.verificado === true;
    if ((await this.obtenerOperacionesPendientes(idUsuario, anuncianteVerificado, transaccion)).length > 0) {
      return { anuncianteVerificado };
    }
    // Aunque no haya reservas, pagos o liquidaciones pendientes, la cuenta todavía puede tener trámites que resolver.
    const tramitesPendientes = await this.operacionesCuenta.tieneTramitesPendientes(idUsuario, anuncianteVerificado, transaccion, {
      reclamos: [
        this.catalogosService.codigoEstado('RECLAMO', 'ABIERTO'),
        this.catalogosService.codigoEstado('RECLAMO', 'EN_REVISION'),
      ],
      reembolsos: [
        this.catalogosService.codigoEstado('REEMBOLSO', 'PENDIENTE'),
        this.catalogosService.codigoEstado('REEMBOLSO', 'FALLIDO'),
      ],
      reembolsoAprobado: this.catalogosService.codigoEstado('REEMBOLSO', 'APROBADO'),
    });
    return tramitesPendientes ? { anuncianteVerificado } : null;
  }

  /** Convierte los conteos de reservas, liquidaciones y pagos en motivos para el rol evaluado. */
  private async pendientesCuenta(idUsuario: number, participacion: ParticipacionEnReserva, transaccion: EntityManager): Promise<string[]> {
    const {
      reservasPendientes, estadiasVigentes, liquidacionesPendientes, pagosSinConciliar,
    } = await this.operacionesCuenta.contarOperacionesPendientes(
      idUsuario,
      participacion,
      fechaArgentina(),
      new Date(Date.now() - MARGEN_CHECKOUT_SIN_PAGO_MS),
      transaccion,
      {
        pagoPendiente: this.catalogosService.codigoEstado('PAGO_RESERVA', 'PENDIENTE'),
        pagoAprobado: this.catalogosService.codigoEstado('PAGO_RESERVA', 'APROBADO'),
        // Con una devolución parcial al anunciante todavía le queda cobrar el resto.
        liquidacionesResueltas: [
          this.catalogosService.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO'),
          this.catalogosService.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_INQUILINO'),
        ],
        enRevision: this.catalogosService.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION'),
      },
    );
    const motivos: string[] = [];
    if (reservasPendientes) motivos.push(`${reservasPendientes} reserva(s) pendiente(s) de pago`);
    if (participacion === 'Inquilino' && pagosSinConciliar)
      motivos.push(`${pagosSinConciliar} pago(s) en proceso en Mercado Pago`);
    if (estadiasVigentes) motivos.push(`${estadiasVigentes} estadía(s) vigente(s) o futura(s)`);
    if (liquidacionesPendientes)
      motivos.push(participacion === 'Anunciante'
        ? `${liquidacionesPendientes} liquidación(es) sin resolver`
        : `${liquidacionesPendientes} reclamo(s) en revisión`);
    if (participacion === 'Anunciante' && pagosSinConciliar)
      motivos.push(`${pagosSinConciliar} pago(s) sin conciliar con Mercado Pago`);
    return motivos;
  }

  async listarBloqueados() {
    const bloqueos = await this.usuariosRepo.listarBloqueados();
    return Promise.all(bloqueos.map(async bloqueo => ({
      ...bloqueo, detalle: { ...bloqueo.detalle, mensajes: await this.firmarImagenesApelacion(bloqueo.detalle.mensajes) },
    })));
  }

  async listarHistorialBloqueos() {
    const usuarios = await this.usuariosRepo.listarHistorialBloqueos();
    const registros = usuarios.flatMap(({ usuario, historial }) => historial.map(detalle => ({ usuario, detalle })));
    const ids = [...new Set(registros.map(({ detalle }) => detalle.administradorId).filter((id): id is number => id != null))];
    const administradores = new Map(await Promise.all(ids.map(async id => {
      const usuario = await this.usuariosRepo.buscarPorId(id);
      return [id, usuario ? { nombre: usuario.nombre, apellido: usuario.apellido } : null] as const;
    })));
    return Promise.all(registros.map(async ({ usuario, detalle }) => ({
      usuario, administrador: detalle.administradorId == null ? null : administradores.get(detalle.administradorId) ?? null,
      detalle: { ...detalle, mensajes: await this.firmarImagenesApelacion(detalle.mensajes) },
    })));
  }

  private bloqueoVigente(usuario: Usuario | null, idBloqueo?: string): DetalleBloqueo {
    if (!usuario?.activa || !usuario.bloqueado || !usuario.bloqueoDetalle ||
        (idBloqueo === undefined ? !usuario.bloqueoDetalle.accesoLimitado : usuario.bloqueoDetalle.id !== idBloqueo)) {
      throw new ForbiddenException('El bloqueo ya no está vigente. Volvé a ingresar.');
    }
    return usuario.bloqueoDetalle;
  }

  private async firmarImagenesApelacion(mensajes: DetalleBloqueo['mensajes']): Promise<DetalleBloqueo['mensajes']> {
    if (!mensajes) return undefined;
    return Promise.all(mensajes.map(async mensaje => ({ ...mensaje,
      imagen: mensaje.imagen ? await this.almacenamientoService.firmarArchivo('reclamos', mensaje.imagen) : undefined,
    })));
  }

  private async vistaBloqueo(detalle: DetalleBloqueo) {
    const { motivo, fecha, apelacion, respuesta, mensajes } = detalle;
    return { motivo, fecha, apelacion: apelacion ?? null,
      respuesta: respuesta ? { texto: respuesta.texto, fecha: respuesta.fecha } : null,
      mensajes: (await this.firmarImagenesApelacion(mensajes))?.map(({ id, autor, texto, fecha, imagen }) => ({ id, autor, texto, fecha, imagen })) ?? null };
  }

  private mensajesApelacion(detalle: DetalleBloqueo): NonNullable<DetalleBloqueo['mensajes']> {
    if (detalle.mensajes) return detalle.mensajes;
    const mensajes: NonNullable<DetalleBloqueo['mensajes']> = [];
    if (detalle.apelacion) mensajes.push({ id: randomUUID(), autor: 'usuario', ...detalle.apelacion });
    if (detalle.respuesta) mensajes.push({ id: randomUUID(), autor: 'administracion', ...detalle.respuesta });
    return mensajes;
  }

  async consultarBloqueo(idUsuario: number, idBloqueo?: string) {
    const usuario = await this.usuariosRepo.buscarConBloqueo(idUsuario);
    return this.vistaBloqueo(this.bloqueoVigente(usuario, idBloqueo));
  }

  async apelarBloqueo(idUsuario: number, idBloqueo: string | undefined, texto: string, archivo?: Express.Multer.File) {
    return this.conImagenApelacion(archivo, async imagen => this.usuariosRepo.conTransaccion(async (transaccion) => {
      const usuario = await this.usuariosRepo.buscarConBloqueo(idUsuario, transaccion);
      const detalle = this.bloqueoVigente(usuario, idBloqueo);
      const fecha = new Date().toISOString();
      detalle.mensajes = this.mensajesApelacion(detalle);
      detalle.mensajes.push({ id: randomUUID(), autor: 'usuario', texto, fecha, imagen });
      detalle.apelacion ??= { texto, fecha };
      delete detalle.respuesta;
      await this.usuariosRepo.guardar(usuario!, transaccion);
      return this.vistaBloqueo(detalle);
    }));
  }

  async responderApelacion(idUsuario: number, idBloqueo: string, administradorId: number, texto: string, archivo?: Express.Multer.File) {
    return this.conImagenApelacion(archivo, async imagen => this.usuariosRepo.conTransaccion(async (transaccion) => {
      const usuario = await this.usuariosRepo.buscarConBloqueo(idUsuario, transaccion);
      const detalle = this.bloqueoVigente(usuario, idBloqueo);
      if (!detalle.apelacion) throw new ConflictException('No hay una apelación para responder.');
      const fecha = new Date().toISOString();
      detalle.mensajes = this.mensajesApelacion(detalle);
      detalle.mensajes.push({ id: randomUUID(), autor: 'administracion', texto, fecha, administradorId, imagen });
      detalle.respuesta = { texto, fecha, administradorId };
      await this.usuariosRepo.guardar(usuario!, transaccion);
      return { mensaje: 'Respuesta registrada.' };
    }));
  }

  private async conImagenApelacion<T>(archivo: Express.Multer.File | undefined, operar: (imagen?: string) => Promise<T>): Promise<T> {
    if (!archivo) return operar();
    if (archivo.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png'].includes(archivo.mimetype))
      throw new BadRequestException('La imagen debe ser JPEG o PNG y pesar hasta 5 MB');
    let contenido: Buffer;
    try { contenido = await this.preparacionImagenes.preparar(archivo.buffer, 'apelacion'); }
    catch { throw new BadRequestException('La imagen no es válida'); }
    const imagen = await this.almacenamientoService.subir('reclamos', `apelaciones/${randomUUID()}.jpg`, contenido, 'image/jpeg');
    try { return await operar(imagen); }
    catch (error) {
      try { await this.almacenamientoService.eliminarArchivo('reclamos', imagen); }
      catch { this.logger.warn('No se pudo eliminar una imagen de apelación no guardada'); }
      throw error;
    }
  }

  /** Devuelve los datos del usuario autenticado sin exponer secretos de cuenta. */
  async obtenerPerfil(idUsuario: number) {
    const usuario = await this.usuariosRepo.buscarPorId(idUsuario);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.usuarioSinSecretos(usuario);
  }

  /** Procesa y guarda la foto de perfil del usuario, reemplazando la anterior. */
  async actualizarFoto(idUsuario: number, archivo: Express.Multer.File) {
    const usuario = await this.usuariosRepo.buscarPorId(idUsuario);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    let contenido: Buffer;
    try {
      // Sharp valida que sea una imagen real y la recorta cuadrada para el avatar.
      contenido = await this.preparacionImagenes.preparar(archivo.buffer, 'avatar');
    } catch {
      throw new BadRequestException('El archivo no es una imagen válida');
    }

    // Va al mismo contenedor público que las fotos de publicaciones, así la URL
    // es permanente y se puede mostrar sin firmar.
    const url = await this.almacenamientoService.subir(
      'imagenes',
      `usuarios/${idUsuario}/perfil-${randomUUID()}.jpg`,
      contenido,
      'image/jpeg',
    );

    const anterior = usuario.foto_url;
    usuario.foto_url = url;
    const actualizado = await this.usuariosRepo.guardar(usuario);
    await this.borrarFotoAnterior(anterior);
    return this.usuarioSinSecretos(actualizado);
  }

  /** Quita la foto de perfil y vuelve a mostrarse la inicial. */
  async eliminarFoto(idUsuario: number) {
    const usuario = await this.usuariosRepo.buscarPorId(idUsuario);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const anterior = usuario.foto_url;
    usuario.foto_url = null;
    const actualizado = await this.usuariosRepo.guardar(usuario);
    await this.borrarFotoAnterior(anterior);
    return this.usuarioSinSecretos(actualizado);
  }

  private async borrarFotoAnterior(url: string | null) {
    if (!url) return;
    try {
      await this.almacenamientoService.eliminarImagenPropia(url);
    } catch {
      // La foto nueva ya quedó guardada; un blob huérfano no debe romper la operación.
      this.logger.warn('No se pudo borrar la foto de perfil anterior');
    }
  }

  /** Lista usuarios para el panel administrativo sin exponer secretos de cuenta. */
  async listarTodos() {
    const usuarios = await this.usuariosRepo.listarTodos();

    return usuarios.map((usuario) => this.usuarioSinSecretos(usuario));
  }

  async listarAdministracion(consulta: ListarAdministracionDto) {
    const [resultado, totalRegistros] = await Promise.all([
      this.usuariosRepo.listarAdministracion(consulta),
      this.usuariosRepo.contarUsuarios(),
    ]);
    return {
      ...resultado,
      datos: resultado.datos.map((usuario) => this.usuarioSinSecretos(usuario)),
      totalRegistros,
    };
  }

  /** Correos de las cuentas con permiso de administración para notificaciones internas. */
  async emailsAdministradores(): Promise<string[]> {
    const usuarios = await this.usuariosRepo.listarTodos();
    return usuarios
      .filter((usuario) => usuario.rol?.nombre === ROL.ADMINISTRADOR && usuario.activa && !usuario.bloqueado && !usuario.fecha_baja)
      .map((usuario) => usuario.email)
      .filter((email): email is string => !!email);
  }

  private usuarioSinSecretos(usuario: Usuario) {
    // El listado administrativo agrega el anunciante con leftJoinAndMapOne.
    const anunciante = (usuario as Usuario & { anunciante?: Anunciante | null })
      .anunciante;
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      email_historico: usuario.email_historico,
      ...(anunciante !== undefined && {
        cuit_cuil: anunciante?.cuit_cuil ?? null,
        cuit_cuil_historico: anunciante?.cuit_cuil_historico ?? null,
      }),
      telefono: usuario.telefono,
      bloqueado: usuario.bloqueado,
      activa: usuario.activa,
      fecha_baja: usuario.fecha_baja,
      email_verificado: usuario.email_verificado,
      foto_url: usuario.foto_url,
      rol: usuario.rol
        ? {
            id: usuario.rol.id,
            nombre: usuario.rol.nombre,
          }
        : null,
    };
  }

  /** Persiste el alta y su token de verificación. Devuelve null si falta elegir cómo continuar. */
  async crear(datos: CrearUsuarioDatos, crearCuentaNueva = false): Promise<string | null> {
    if (await this.usuariosRepo.buscarPorEmail(datos.email)) {
      throw new ConflictException('El email ya está registrado');
    }
    if (!crearCuentaNueva && await this.usuariosRepo.buscarBajaRecuperable(datos.email)) {
      return null;
    }

    const contraseniaHash = await this.credencialesService.hashearContrasenia(
      datos.contrasenia,
    );

    // El cliente nunca manda el rol: el primer usuario administra el sistema y
    // todos los siguientes comienzan como usuarios normales.
    const cantidadUsuarios = await this.usuariosRepo.contarUsuarios();
    const nombreRol = cantidadUsuarios === 0 ? ROL.ADMINISTRADOR : ROL.INQUILINO;

    const rol = await this.catalogosService.getRolPorNombre(nombreRol);
    if (!rol) {
      throw new InternalServerErrorException(`Falta el rol inicial ${nombreRol}. Ejecutá npm run db:seed.`);
    }

    const { token, expira } = this.credencialesService.nuevoTokenVerificacion();
    const nuevoUsuario = this.usuariosRepo.crear({
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      telefono: datos.telefono,
      contrasenia: contraseniaHash,
      token_verificacion: token,
      token_verificacion_expira: expira,
      rol,
    });
    try {
      await this.usuariosRepo.guardar(nuevoUsuario);
    } catch (error) {
      if (error instanceof ValorDuplicadoError) {
        throw new ConflictException('El email ya está registrado');
      }
      throw error;
    }
    return token;
  }

}
