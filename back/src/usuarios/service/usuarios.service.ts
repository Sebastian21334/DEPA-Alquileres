import { Injectable, ConflictException, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { USUARIOS_REPOSITORY } from '../repository/usuarios.repository.interface';
import type { IUsuariosRepository } from '../repository/usuarios.repository.interface';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Usuario } from '../entity/usuario.entity';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UsuariosService {
  constructor(
    @Inject(USUARIOS_REPOSITORY)
    private usuariosRepo: IUsuariosRepository,

    private catalogosService: CatalogosService,
    private configService: ConfigService,
  ) {}

  /** Busca un usuario por correo para validar duplicados o iniciar sesion. */
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepo.buscarPorEmail(email);
  }

  /** Busca un usuario por su clave primaria. */
   async buscarPorId(id: number): Promise<Usuario | null> {
    return this.usuariosRepo.buscarPorId(id);
  }

  /** Hashea la contrasenia, asigna el rol inicial y persiste el usuario. */
  async crear(datos: any): Promise<Usuario> {
    // 1. Costo desde env (fallback 12)
    const rounds = Number(this.configService.get<string>('BCRYPT_COST') ?? '12');

    // 2. Hashear la contraseña en texto plano
    const contraseniaHash = await bcrypt.hash(datos.contrasenia, rounds);

    // El cliente nunca manda el rol: el primer usuario administra el sistema y
    // todos los siguientes comienzan como usuarios normales.
    const cantidadUsuarios = await this.usuariosRepo.contarUsuarios();
    const nombreRol = cantidadUsuarios === 0 ? 'Administrador' : 'Usuario';

    let rol = await this.catalogosService.getRolPorNombre(nombreRol);

    // El primer intento cubre el caso habitual. El segundo bloque conserva la
    // posibilidad de crear el rol inicial si la base estaba completamente vacia.
    if (!rol) {
      rol = await this.catalogosService.crearRol({ nombre: nombreRol });
    }
    
    if (!rol) {
      if (cantidadUsuarios === 0) {
        rol = await this.catalogosService.crearRol({ nombre: nombreRol });
        
      } else {
        throw new ConflictException(`No existe el rol '${nombreRol}'`);
      }
    }

    // Se quita la contrasenia original para que solo el hash llegue a la entidad.
    const { contrasenia, ...resto } = datos;
    const nuevoUsuario = this.usuariosRepo.crear({
      ...resto,
      contrasenia: contraseniaHash,
      rol,
    });
    return this.usuariosRepo.guardar(nuevoUsuario);
  }

  /** Obtiene el usuario con su hash; la comparacion se hace en AuthService. */
  async validarUsuarioParaLogin(email: string, password: string): Promise<Usuario | null> {
    // Solo busca — la comparación bcrypt vive en AuthService.login
    return this.usuariosRepo.buscarParaLogin(email);
  }

  /** Cambia el rol de un usuario, evitando escrituras innecesarias. */
  async cambiarRol(idUsuario: number, nombreRolNuevo: string): Promise<Usuario> {
  const usuario = await this.usuariosRepo.buscarPorId(idUsuario);
  if (!usuario) {
    throw new NotFoundException('Usuario no encontrado');
  }

  const rolNuevo = await this.catalogosService.getRolPorNombre(nombreRolNuevo);
  if (!rolNuevo) {
    throw new NotFoundException(`El rol '${nombreRolNuevo}' no existe`);
  }

  if (usuario.rol.id === rolNuevo.id) {
    throw new ConflictException(`El usuario ya tiene el rol '${nombreRolNuevo}'`);
  }

  usuario.rol = rolNuevo;
    return this.usuariosRepo.guardar(usuario);
  }

  /** Genera un token de verificación, lo persiste en el usuario y lo devuelve. */
async generarTokenVerificacion(usuario: Usuario): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  usuario.token_verificacion = token;
  usuario.email_verificado = false;
  await this.usuariosRepo.guardar(usuario);
  return token;
}

/** Marca la cuenta como verificada y consume el token (uso único). */
async verificarCuenta(token: string): Promise<void> {
  const usuario = await this.usuariosRepo.buscarPorTokenVerificacion(token);
  if (!usuario) {
    throw new BadRequestException('Token de verificación inválido');
  }

  usuario.email_verificado = true;
  usuario.token_verificacion = null;
  await this.usuariosRepo.guardar(usuario);
}

/**
 * Genera un token de recuperación si el email existe. Devuelve null si no existe,
 * para que AuthService pueda responder siempre igual y no filtrar qué emails están registrados.
 */
async generarTokenRecuperacion(email: string): Promise<{ token: string; usuario: Usuario } | null> {
  const usuario = await this.usuariosRepo.buscarPorEmail(email);
  if (!usuario) return null;

  const token = crypto.randomBytes(32).toString('hex');
  usuario.token_recuperacion = token;
  usuario.token_recuperacion_expira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
  await this.usuariosRepo.guardar(usuario);

  return { token, usuario };
}

/** Valida el token de recuperación (existencia y vigencia) y setea la nueva contraseña hasheada. */
async restablecerContrasenia(token: string, nuevaContrasenia: string): Promise<void> {
  const usuario = await this.usuariosRepo.buscarPorTokenRecuperacion(token);

  if (!usuario || !usuario.token_recuperacion_expira || usuario.token_recuperacion_expira < new Date()) {
    throw new BadRequestException('Token inválido o expirado');
  }

  const rounds = Number(this.configService.get<string>('BCRYPT_COST') ?? '12');
  usuario.contrasenia = await bcrypt.hash(nuevaContrasenia, rounds);
  usuario.token_recuperacion = null;
  usuario.token_recuperacion_expira = null;
  await this.usuariosRepo.guardar(usuario);
}

  
}