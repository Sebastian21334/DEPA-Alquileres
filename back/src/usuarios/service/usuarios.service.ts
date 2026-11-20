import { UsuariosCredencialesService } from './usuarios-credenciales.service';
import { ListarAdministracionDto } from '../../common/dto/listar-administracion.dto';
import { AlmacenamientoService } from '../../almacenamiento/service/almacenamiento.service';
import { createHmac, randomUUID } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  ConflictException,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { USUARIOS_REPOSITORY } from '../repository/usuarios.repository.interface';
import type { IUsuariosRepository, ParticipacionEnReserva } from '../repository/usuarios.repository.interface';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Usuario, type DetalleBloqueo } from '../entity/usuario.entity';
import { ActualizarUsuarioDto } from '../dto/actualizar-usuario.dto';
import sharp from 'sharp';
import type { EntityManager } from 'typeorm';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { AnunciantesService } from '../../anunciantes/service/anunciantes.service';
import type { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import { fechaArgentina } from '../../common/utils/fechas';
import { formatearNombreCompleto } from '../../common/utils/nombres';

import type { IMailService } from '../../mail/mail.interface';
import { MAIL_SERVICE } from '../../mail/mail.interface';

/**
 * Tiempo durante el cual un checkout sin pago iniciado sigue impidiendo la
 * baja: cubre los 15 minutos de la preferencia y notificaciones demoradas.
 */
const MARGEN_CHECKOUT_SIN_PAGO_MS = 24 * 60 * 60 * 1000;
const AUDIENCIA_BAJA = 'confirmar-baja-propia';

type ConfirmacionBaja = { usuarioId: number; huella: string; exp: number };

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

  constructor(@Inject(USUARIOS_REPOSITORY) private readonly usuariosRepo: IUsuariosRepository, private readonly catalogosService: CatalogosService, private readonly credencialesService: UsuariosCredencialesService, @Inject(MAIL_SERVICE) private readonly mailService: IMailService, private readonly almacenamientoService: AlmacenamientoService, private readonly publicacionesService: PublicacionesService, private readonly anunciantesService: AnunciantesService, private readonly jwtService: JwtService) {}

  /** Busca un usuario por correo para validar duplicados o iniciar sesion. */
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepo.buscarPorEmail(email);
  }

  /** Busca un usuario por su clave primaria. */
  async buscarPorId(id: number, transaccion?: EntityManager): Promise<Usuario | null> {
    return this.usuariosRepo.buscarPorId(id, transaccion);
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

  async cambiarBloqueoAdministrativo(idUsuario: number, bloqueado: boolean, idOperador: number, motivo?: string) {
    if (idUsuario === idOperador)
      throw new BadRequestException('No podés bloquearte o habilitarte a vos mismo');

    const motivoNormalizado = motivo?.trim();
    return this.usuariosRepo.conTransaccion(async (transaccion) => {
      const usuario = await this.usuariosRepo.buscarBloqueado(idUsuario, transaccion, true);
      if (!usuario) throw new NotFoundException('Usuario no encontrado');
      if (!usuario.activa)
        throw new ConflictException('La cuenta fue dada de baja: no se puede bloquear ni habilitar');
      if (usuario.bloqueado === bloqueado) return { usuario, cambio: false };

      await this.publicacionesService.bloquearPublicacionesParaCambioDeCuenta(idUsuario, transaccion);
      usuario.bloqueado = bloqueado;
      if (bloqueado) {
        usuario.bloqueoDetalle = {
          id: randomUUID(),
          motivo: motivoNormalizado || null,
          administradorId: idOperador,
          fecha: new Date().toISOString(),
        };
      }
      await this.usuariosRepo.guardar(usuario, transaccion);
      return { usuario, cambio: true };
    });

  }

  nombreCompleto(usuario: Usuario): string {
    return formatearNombreCompleto(usuario.nombre, usuario.apellido);
  }

  /** Actualiza datos personales propios o de otro usuario cuando opera un administrador. */
  async actualizarDatosPersonales(idUsuario: number, dto: ActualizarUsuarioDto, idOperador: number, rolOperador?: string) {
    if (idUsuario !== idOperador && rolOperador !== 'Administrador') {
      throw new ForbiddenException('Solo podés modificar tus propios datos');
    }

    const usuario = await this.usuariosRepo.buscarPorId(idUsuario);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const email = dto.email ? dto.email.trim().toLowerCase() : undefined;
    if (email) {
      const usuarioConEmail = await this.usuariosRepo.buscarPorEmail(email);
      if (usuarioConEmail && usuarioConEmail.id !== idUsuario) {
        throw new ConflictException('El email ya está registrado');
      }
    }
    if (email !== undefined) usuario.email = email;
    if (dto.nombre !== undefined) usuario.nombre = dto.nombre.trim();
    if (dto.apellido !== undefined) usuario.apellido = dto.apellido.trim();
    if (dto.telefono !== undefined) usuario.telefono = dto.telefono.trim();

    const usuarioActualizado = await this.usuariosRepo.guardar(usuario);
    return this.usuarioSinSecretos(usuarioActualizado);
  }

  async solicitarBajaPropia(idUsuario: number): Promise<{ mensaje: string }> {
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
      await this.mailService.enviarConfirmacionBaja(email, token);
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
    return createHmac('sha256', usuario.contrasenia)
      .update(JSON.stringify([usuario.id, usuario.email, usuario.bloqueoDetalle?.id ?? null]))
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
      if (usuario.email) {
        usuario.email_historico = usuario.email;
        usuario.email = null;
      }
      usuario.token_verificacion = null;
      usuario.token_recuperacion = null;
      usuario.token_recuperacion_expira = null;
      await this.usuariosRepo.guardar(usuario, transaccion);
    });

    return { mensaje: 'Tu cuenta fue dada de baja correctamente' };
  }

  private async validarBajaEnCurso(idUsuario: number, transaccion: EntityManager): Promise<void> {
    // Comparte el bloqueo de publicaciones con el calendario de reservas.
    const tienePublicaciones = await this.publicacionesService
      .bloquearPublicacionesParaCambioDeCuenta(idUsuario, transaccion);
    await this.validarOperacionesResueltas(transaccion, idUsuario, tienePublicaciones);
  }

  private async validarOperacionesResueltas(transaccion: EntityManager, idUsuario: number, tienePublicaciones: boolean): Promise<void> {
    const pendientes: string[] = [];
    if (tienePublicaciones) {
      const anunciante = await this.pendientesCuenta(idUsuario, 'Anunciante', transaccion);
      if (anunciante.length) pendientes.push(`como Anunciante: ${anunciante.join(', ')}`);
    }
    const inquilino = await this.pendientesCuenta(idUsuario, 'Inquilino', transaccion);
    if (inquilino.length) pendientes.push(`como Inquilino: ${inquilino.join(', ')}`);

    if (pendientes.length) {
      throw new ConflictException(
        'No se puede dar de baja la cuenta porque tiene operaciones sin resolver ' +
        `(${pendientes.join('; ')}). ` +
        'Primero resolvé las reservas, los pagos, las liquidaciones y los reclamos pendientes.',
      );
    }
  }

  private async pendientesCuenta(idUsuario: number, participacion: ParticipacionEnReserva, transaccion: EntityManager): Promise<string[]> {
    const {
      reservasPendientes, estadiasVigentes, liquidacionesPendientes, pagosSinConciliar,
    } = await this.usuariosRepo.contarOperacionesPendientes(
      idUsuario,
      participacion,
      fechaArgentina(),
      new Date(Date.now() - MARGEN_CHECKOUT_SIN_PAGO_MS),
      transaccion,
      {
        pagoPendiente: this.catalogosService.codigoEstado('PAGO_RESERVA', 'PENDIENTE'),
        pagoAprobado: this.catalogosService.codigoEstado('PAGO_RESERVA', 'APROBADO'),
        liquidacionesResueltas: [
          this.catalogosService.codigoEstado('LIQUIDACION_RESERVA', 'PAGADO_PROPIETARIO'),
          this.catalogosService.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_INQUILINO'),
          this.catalogosService.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_PARCIAL_INQUILINO'),
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

  listarBloqueados() {
    return this.usuariosRepo.listarBloqueados();
  }

  private bloqueoVigente(usuario: Usuario | null, idBloqueo: string): DetalleBloqueo {
    if (!usuario?.activa || !usuario.bloqueado || usuario.bloqueoDetalle?.id !== idBloqueo) {
      throw new ForbiddenException('El bloqueo ya no está vigente. Volvé a ingresar.');
    }
    return usuario.bloqueoDetalle;
  }

  private vistaBloqueo(detalle: DetalleBloqueo) {
    const { motivo, fecha, apelacion, respuesta } = detalle;
    return { motivo, fecha, apelacion: apelacion ?? null,
      respuesta: respuesta ? { texto: respuesta.texto, fecha: respuesta.fecha } : null };
  }

  async consultarBloqueo(idUsuario: number, idBloqueo: string) {
    const usuario = await this.usuariosRepo.buscarConBloqueo(idUsuario);
    return this.vistaBloqueo(this.bloqueoVigente(usuario, idBloqueo));
  }

  async apelarBloqueo(idUsuario: number, idBloqueo: string, texto: string) {
    return this.usuariosRepo.conTransaccion(async (transaccion) => {
      const usuario = await this.usuariosRepo.buscarConBloqueo(idUsuario, transaccion);
      const detalle = this.bloqueoVigente(usuario, idBloqueo);
      if (detalle.apelacion) throw new ConflictException('Ya enviaste una apelación para este bloqueo.');
      detalle.apelacion = { texto, fecha: new Date().toISOString() };
      await this.usuariosRepo.guardar(usuario!, transaccion);
      return this.vistaBloqueo(detalle);
    });
  }

  async responderApelacion(idUsuario: number, idBloqueo: string, administradorId: number, texto: string) {
    return this.usuariosRepo.conTransaccion(async (transaccion) => {
      const usuario = await this.usuariosRepo.buscarConBloqueo(idUsuario, transaccion);
      const detalle = this.bloqueoVigente(usuario, idBloqueo);
      if (!detalle.apelacion || detalle.respuesta) throw new ConflictException('La apelación ya no está pendiente.');
      detalle.respuesta = { texto, fecha: new Date().toISOString(), administradorId };
      await this.usuariosRepo.guardar(usuario!, transaccion);
      return { mensaje: 'Respuesta registrada.' };
    });
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
      contenido = await sharp(archivo.buffer)
        .rotate()
        .resize(400, 400, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();
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
      .filter((usuario) => usuario.rol?.nombre === 'Administrador' && usuario.activa && !usuario.bloqueado && !usuario.fecha_baja)
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

  /** Hashea la contrasenia, asigna el rol inicial y persiste el usuario. */
  async crear(datos: CrearUsuarioDatos): Promise<Usuario> {
    const contraseniaHash = await this.credencialesService.hashearContrasenia(
      datos.contrasenia,
    );

    // El cliente nunca manda el rol: el primer usuario administra el sistema y
    // todos los siguientes comienzan como usuarios normales.
    const cantidadUsuarios = await this.usuariosRepo.contarUsuarios();
    const nombreRol = cantidadUsuarios === 0 ? 'Administrador' : 'Inquilino';

    const rol = await this.catalogosService.getRolPorNombre(nombreRol);
    if (!rol) {
      throw new InternalServerErrorException(`Falta el rol inicial ${nombreRol}. Ejecutá npm run db:seed.`);
    }

    const nuevoUsuario = this.usuariosRepo.crear({
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      telefono: datos.telefono,
      contrasenia: contraseniaHash,
      rol,
    });
    return this.usuariosRepo.guardar(nuevoUsuario);
  }

  /** Cambia el rol de un usuario, evitando escrituras innecesarias. */
  async cambiarRol(idUsuario: number, nombreRolNuevo: string) {
    const usuario = await this.usuariosRepo.buscarPorId(idUsuario);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const rolNuevo =
      await this.catalogosService.getRolPorNombre(nombreRolNuevo);
    if (!rolNuevo) {
      throw new NotFoundException(`El rol '${nombreRolNuevo}' no existe`);
    }

    if (usuario.rol?.id === rolNuevo.id) {
      throw new ConflictException(
        `El usuario ya tiene el rol '${nombreRolNuevo}'`,
      );
    }

    usuario.rol = rolNuevo;
    const usuarioActualizado = await this.usuariosRepo.guardar(usuario);
    return this.usuarioSinSecretos(usuarioActualizado);
  }
}
