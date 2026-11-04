import { UsuariosCredencialesService } from './usuarios-credenciales.service';
import { ARCHIVO_REPOSITORY } from '../../common/almacenamiento/archivo.repository.interface';
import type { IArchivoRepository } from '../../common/almacenamiento/archivo.repository.interface';
import { randomUUID } from 'node:crypto';
import {
  Injectable,
  ConflictException,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { USUARIOS_REPOSITORY } from '../repository/usuarios.repository.interface';
import type { IUsuariosRepository } from '../repository/usuarios.repository.interface';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Usuario } from '../entity/usuario.entity';
import { ActualizarUsuarioDto } from '../dto/actualizar-usuario.dto';
import sharp from 'sharp';
import { DataSource, EntityManager } from 'typeorm';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';
import {
  EstadoLiquidacionReserva,
  EstadoPagoReserva,
  Reserva,
} from '../../reservas/entity/reserva.entity';
import { Pago } from '../../pagos/entity/pago.entity';
import { fechaArgentina } from '../../common/utils/fechas';

import type { IMailService } from '../../mail/mail.interface';
import { MAIL_SERVICE } from '../../mail/mail.interface';

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

  constructor(
    @Inject(USUARIOS_REPOSITORY)
    private readonly usuariosRepo: IUsuariosRepository,

    private readonly catalogosService: CatalogosService,
    private readonly credencialesService: UsuariosCredencialesService,
    private readonly dataSource: DataSource,
    @Inject(MAIL_SERVICE) private readonly mailService: IMailService,
    @Inject(ARCHIVO_REPOSITORY)
    private readonly archivosRepo: IArchivoRepository,
  ) {}

  /** Busca un usuario por correo para validar duplicados o iniciar sesion. */
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepo.buscarPorEmail(email);
  }

  /** Busca un usuario por su clave primaria. */
  async buscarPorId(id: number): Promise<Usuario | null> {
    return this.usuariosRepo.buscarPorId(id);
  }

  /** Actualiza datos personales propios o de otro usuario cuando opera un administrador. */
  async actualizarDatosPersonales(
    idUsuario: number,
    dto: ActualizarUsuarioDto,
    idOperador: number,
    rolOperador?: string,
  ) {
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
    usuario.actualizarDatosPersonales({
      email,
      nombre: dto.nombre,
      apellido: dto.apellido,
      telefono: dto.telefono,
    });

    const usuarioActualizado = await this.usuariosRepo.guardar(usuario);
    return this.usuarioSinSecretos(usuarioActualizado);
  }

  /** Da de baja la cuenta autenticada sin borrar publicaciones ni historial. */
  darDeBajaPropia(idUsuario: number) {
    return this.darDeBajaCuenta(idUsuario);
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

  private async darDeBajaCuenta(idUsuario: number) {
    await this.dataSource.transaction(async (manager) => {
      const usuario = await manager.getRepository(Usuario)
        .createQueryBuilder('usuario')
        .where('usuario.id = :idUsuario', { idUsuario })
        .setLock('pessimistic_write')
        .getOne();

      if (!usuario) throw new NotFoundException('Usuario no encontrado');
      if (!usuario.activa) {
        throw new ConflictException('La cuenta ya está inactiva');
      }

      // El calendario también bloquea la fila Publicacion al crear reservas.
      // Se toman los mismos bloqueos antes de verificar operaciones pendientes,
      // para impedir nuevas reservas mientras se tramita la baja.
      const publicaciones = await manager.getRepository(Publicacion)
        .createQueryBuilder('publicacion')
        .select('publicacion.id')
        .where('publicacion.id_anunciante = :idUsuario', { idUsuario })
        .orderBy('publicacion.id', 'ASC')
        .setLock('pessimistic_write')
        .getMany();

      if (publicaciones.length > 0) {
        await this.validarOperacionesResueltas(manager, idUsuario);
      }

      // UPDATE directo: conserva publicaciones, fechas, reservas, pagos e historial.
      await manager.createQueryBuilder()
        .update(Publicacion)
        .set({ activa: false })
        .where('id_anunciante = :idUsuario', { idUsuario })
        .execute();

      usuario.darDeBaja();
      await manager.getRepository(Usuario).save(usuario);
    });

    return { mensaje: 'Tu cuenta fue dada de baja correctamente' };
  }

  /**
   * La baja se rechaza si un anunciante tiene compromisos por resolver.
   * Se ejecuta dentro de la transacción que bloquea sus publicaciones.
   * Los estados históricos (reservas cerradas y pagos conciliados) no bloquean.
   */
  private async validarOperacionesResueltas(
    manager: EntityManager,
    idUsuario: number,
  ): Promise<void> {
    const consultasReservas = () => manager.getRepository(Reserva)
      .createQueryBuilder('reserva')
      .innerJoin('reserva.publicacion', 'publicacion')
      .where('publicacion.id_anunciante = :idUsuario', { idUsuario });

    // No se permite la baja con un checkout pendiente, incluso si el plazo
    // de 15 minutos venció: primero debe quedar cancelado o conciliado.
    const reservasPendientes = await consultasReservas()
      .andWhere('reserva.estado_pago = :pendiente', {
        pendiente: EstadoPagoReserva.PENDIENTE,
      })
      .getCount();

    // También se impide la baja con una reserva pagada para hoy o el futuro,
    // incluso si su liquidación figura como resuelta por alguna anomalía.
    const hoy = fechaArgentina();
    const estadiasVigentes = await consultasReservas()
      .andWhere('reserva.estado_pago = :aprobado', {
        aprobado: EstadoPagoReserva.APROBADO,
      })
      .andWhere('reserva.cancelada = false')
      .andWhere('reserva.finalizada = false')
      .andWhere(`(
        reserva.fecha_inicio IS NULL OR reserva.fecha_fin IS NULL
        OR reserva.fecha_inicio > reserva.fecha_fin
        OR reserva.fecha_fin >= :hoy
      )`, { hoy })
      .getCount();

    // Incluye dinero retenido, pagos al propietario todavía no registrados,
    // reclamos en revisión y cualquier otro estado no resuelto.
    const liquidacionesPendientes = await consultasReservas()
      .andWhere('reserva.estado_pago = :aprobado', {
        aprobado: EstadoPagoReserva.APROBADO,
      })
      .andWhere('reserva.estado_liquidacion NOT IN (:...resueltas)', {
        resueltas: [
          EstadoLiquidacionReserva.PAGADO_PROPIETARIO,
          EstadoLiquidacionReserva.DEVUELTO_INQUILINO,
        ],
      })
      .getCount();

    // Evita dar de baja al anunciante si Mercado Pago aún puede notificar
    // una aprobación tardía, aun cuando la reserva ya se haya cancelado.
    const pagosSinConciliar = await manager.getRepository(Pago)
      .createQueryBuilder('pago')
      .innerJoin('pago.reserva', 'reserva')
      .innerJoin('reserva.publicacion', 'publicacion')
      .where('publicacion.id_anunciante = :idUsuario', { idUsuario })
      .andWhere('pago.status NOT IN (:...finales)', {
        // Un charged_back abierto sigue siendo una operación sin conciliar.
        finales: ['approved', 'rejected', 'cancelled', 'refunded'],
      })
      .getCount();

    const motivos: string[] = [];
    if (reservasPendientes) motivos.push(`${reservasPendientes} reserva(s) pendiente(s) de pago`);
    if (estadiasVigentes) motivos.push(`${estadiasVigentes} estadía(s) vigente(s) o futura(s)`);
    if (liquidacionesPendientes) motivos.push(`${liquidacionesPendientes} liquidación(es) sin resolver`);
    if (pagosSinConciliar) motivos.push(`${pagosSinConciliar} pago(s) sin conciliar con Mercado Pago`);

    if (motivos.length) {
      throw new ConflictException(
        `No se puede dar de baja la cuenta porque tiene ${motivos.join(', ')}. ` +
        'Primero resolvé las reservas, los pagos y las liquidaciones pendientes.',
      );
    }
  }

  /** Bloquea o habilita el acceso de un usuario desde el panel administrativo. */
  async cambiarBloqueo(
    idUsuario: number,
    bloqueado: boolean,
    idOperador: number,
    motivo?: string,
  ) {
    if (idUsuario === idOperador) {
      throw new BadRequestException(
        'No podés bloquearte o habilitarte a vos mismo',
      );
    }

    const usuario = await this.usuariosRepo.buscarPorId(idUsuario);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    usuario.cambiarBloqueo(bloqueado);
    await this.usuariosRepo.guardar(usuario);

    try {
      await this.mailService.enviarCambioBloqueo(
        usuario.email,
        bloqueado,
        motivo?.trim(),
      );
    } catch (error) {
      this.logger.error(
        `No se pudo notificar el cambio de acceso a ${usuario.email}`,
        error as Error,
      );
    }

    return {
      mensaje: bloqueado
        ? 'Usuario bloqueado correctamente'
        : 'Usuario habilitado correctamente',
    };
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
    const url = await this.archivosRepo.subir(
      'imagenes',
      `usuarios/${idUsuario}/perfil-${randomUUID()}.jpg`,
      contenido,
      'image/jpeg',
    );

    const anterior = usuario.cambiarFoto(url);
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
    const anterior = usuario.cambiarFoto(null);
    const actualizado = await this.usuariosRepo.guardar(usuario);
    await this.borrarFotoAnterior(anterior);
    return this.usuarioSinSecretos(actualizado);
  }

  private async borrarFotoAnterior(url: string | null) {
    if (!url) return;
    try {
      await this.archivosRepo.eliminarImagenPropia(url);
    } catch (error) {
      // La foto nueva ya quedó guardada; un blob huérfano no debe romper la operación.
      this.logger.warn(
        `No se pudo borrar la foto anterior ${url}: ${(error as Error).message}`,
      );
    }
  }

  /** Lista usuarios para el panel administrativo sin exponer secretos de cuenta. */
  async listarTodos() {
    const usuarios = await this.usuariosRepo.listarTodos();

    return usuarios.map((usuario) => this.usuarioSinSecretos(usuario));
  }

  /** Correos de las cuentas con permiso de administración para notificaciones internas. */
  async emailsAdministradores(): Promise<string[]> {
    const usuarios = await this.usuariosRepo.listarTodos();
    return usuarios
      .filter((usuario) => usuario.rol?.nombre === 'Administrador')
      .map((usuario) => usuario.email)
      .filter(Boolean);
  }

  private usuarioSinSecretos(usuario: Usuario) {
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
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

    const rol =
      (await this.catalogosService.getRolPorNombre(nombreRol)) ??
      (await this.catalogosService.crearRol({ nombre: nombreRol }));

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

    if (usuario.tieneRol(rolNuevo)) {
      throw new ConflictException(
        `El usuario ya tiene el rol '${nombreRolNuevo}'`,
      );
    }

    usuario.asignarRol(rolNuevo);
    const usuarioActualizado = await this.usuariosRepo.guardar(usuario);
    return this.usuarioSinSecretos(usuarioActualizado);
  }
}
