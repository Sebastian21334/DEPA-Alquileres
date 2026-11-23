import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HASH_CONTRASENIAS, type IHashContrasenias } from '../proveedor/contrasenias.interface';
import * as crypto from 'crypto';
import { Usuario } from '../entity/usuario.entity';
import {
  USUARIOS_REPOSITORY,
  type IUsuariosCredencialesRepository,
} from '../repository/usuarios.repository.interface';

@Injectable()
export class UsuariosCredencialesService {
  constructor(@Inject(USUARIOS_REPOSITORY) private readonly usuariosRepo: IUsuariosCredencialesRepository, @Inject(HASH_CONTRASENIAS) private readonly hash: IHashContrasenias) {}

  hashearContrasenia(contrasenia: string): Promise<string> {
    return this.hash.hashear(contrasenia);
  }

  coincideContrasenia(contrasenia: string, hash: string): Promise<boolean> {
    return this.hash.coincide(contrasenia, hash);
  }

  async validarCredenciales(email: string, contrasenia: string, permitirBloqueado = false) {
    const user = await this.usuariosRepo.buscarParaLogin(email);
    if (!user || !(await this.coincideContrasenia(contrasenia, user.contrasenia))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (!user.activa)
      throw new ForbiddenException('Tu cuenta está inactiva');
    if (user.bloqueado && !permitirBloqueado)
      throw new ForbiddenException('Tu usuario está bloqueado');
    return user;
  }

  /** Genera un token de verificación, lo persiste en el usuario y lo devuelve. */
  async generarTokenVerificacion(id: number, email: string): Promise<string | null> {
    const token = crypto.randomBytes(32).toString('hex');
    return await this.usuariosRepo.guardarTokenVerificacion(id, email, token) ? token : null;
  }

  /** Marca la cuenta como verificada y consume el token (uso único). */
  async verificarCuenta(token: string): Promise<void> {
    if (!(await this.usuariosRepo.verificarCuenta(token))) {
      throw new BadRequestException('Token de verificación inválido');
    }
  }

  /**
   * Genera un token de recuperación si el email existe. Devuelve null si no existe,
   * para que AuthService pueda responder siempre igual y no filtrar qué emails están registrados.
   */
  async generarTokenRecuperacion(email: string): Promise<{ token: string; usuario: Usuario } | null> {
    const usuario = await this.usuariosRepo.buscarPorEmail(email);

    if (!usuario || !usuario.activa || usuario.bloqueado) return null;

    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 2 * 60 * 60 * 1000); // RN-30: 2 horas
    const guardado = await this.usuariosRepo.guardarTokenRecuperacion(usuario.id, email, token, expira);
    return guardado ? { token, usuario } : null;
  }

  /** Valida el token de recuperación (existencia y vigencia) y setea la nueva contraseña hasheada. */
  async restablecerContrasenia(token: string, nuevaContrasenia: string): Promise<{ email: string | null }> {
    const usuario = await this.usuariosRepo.buscarPorTokenRecuperacion(token);

    if (!usuario?.token_recuperacion_expira ||
        !(usuario.token_recuperacion_expira > new Date()) || usuario.bloqueado) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const actualizado = await this.usuariosRepo.restablecerContrasenia(
      token,
      await this.hashearContrasenia(nuevaContrasenia),
    );
    if (!actualizado) throw new BadRequestException('Token inválido o expirado');
    return { email: usuario.email };
  }

  async cambiarContrasenia(id: number, contraseniaActual: string, nuevaContrasenia: string): Promise<{ email: string | null }> {
    const usuario = await this.usuariosRepo.buscarCredencialesPorId(id);
    if (!usuario || usuario.bloqueado) {
      throw new ForbiddenException('No podés cambiar la contraseña de esta cuenta');
    }
    if (!(await this.coincideContrasenia(contraseniaActual, usuario.contrasenia))) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }
    if (await this.coincideContrasenia(nuevaContrasenia, usuario.contrasenia)) {
      throw new BadRequestException('La nueva contraseña debe ser distinta de la actual');
    }
    const actualizado = await this.usuariosRepo.cambiarContrasenia(
      id,
      usuario.contrasenia,
      await this.hashearContrasenia(nuevaContrasenia),
    );
    if (!actualizado) {
      throw new ConflictException('La cuenta cambió mientras guardabas. Volvé a intentarlo.');
    }
    return { email: usuario.email };
  }
}
