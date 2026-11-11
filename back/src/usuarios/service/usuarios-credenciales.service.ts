import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Usuario } from '../entity/usuario.entity';
import {
  USUARIOS_REPOSITORY,
  type IUsuariosRepository,
} from '../repository/usuarios.repository.interface';

@Injectable()
export class UsuariosCredencialesService {
  constructor(@Inject(USUARIOS_REPOSITORY) private readonly usuariosRepo: IUsuariosRepository, private readonly configService: ConfigService) {}

  hashearContrasenia(contrasenia: string): Promise<string> {
    const rounds = Number(this.configService.get<string>('BCRYPT_COST') ?? '12',);
    if (!Number.isInteger(rounds) || rounds < 12 || rounds > 31) {
      throw new Error('BCRYPT_COST debe ser un entero entre 12 y 31');
    }
    return bcrypt.hash(contrasenia, rounds);
  }

  async validarCredenciales(email: string, contrasenia: string, permitirBloqueado = false) {
    const user = await this.usuariosRepo.buscarParaLogin(email);
    if (!user || !(await bcrypt.compare(contrasenia, user.contrasenia))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (!user.activa)
      throw new ForbiddenException('Tu cuenta está inactiva');
    if (user.bloqueado && !permitirBloqueado)
      throw new ForbiddenException('Tu usuario está bloqueado');
    return user;
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

    if (!usuario || !usuario.activa || usuario.bloqueado) return null;

    const token = crypto.randomBytes(32).toString('hex');
    usuario.token_recuperacion = token;
    usuario.token_recuperacion_expira = new Date(Date.now() + 2 * 60 * 60 * 1000); // RN-30: 2 horas
    await this.usuariosRepo.guardar(usuario);

    return { token, usuario };
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
    if (!(await bcrypt.compare(contraseniaActual, usuario.contrasenia))) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }
    if (await bcrypt.compare(nuevaContrasenia, usuario.contrasenia)) {
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
