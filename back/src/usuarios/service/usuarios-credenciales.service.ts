import {
  BadRequestException,
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
  constructor(
    @Inject(USUARIOS_REPOSITORY)
    private readonly usuariosRepo: IUsuariosRepository,
    private readonly configService: ConfigService,
  ) {}

  hashearContrasenia(contrasenia: string): Promise<string> {
    const rounds = Number(
      this.configService.get<string>('BCRYPT_COST') ?? '12',
    );
    return bcrypt.hash(contrasenia, rounds);
  }

  async validarCredenciales(email: string, contrasenia: string) {
    const user = await this.usuariosRepo.buscarParaLogin(email);
    if (!user || !(await bcrypt.compare(contrasenia, user.contrasenia))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (user.bloqueado)
      throw new ForbiddenException('Tu usuario está bloqueado');
    return user;
  }

  /** Genera un token de verificación, lo persiste en el usuario y lo devuelve. */
  async generarTokenVerificacion(usuario: Usuario): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    usuario.iniciarVerificacionEmail(token);
    await this.usuariosRepo.guardar(usuario);
    return token;
  }

  /** Marca la cuenta como verificada y consume el token (uso único). */
  async verificarCuenta(token: string): Promise<void> {
    const usuario = await this.usuariosRepo.buscarPorTokenVerificacion(token);
    if (!usuario) {
      throw new BadRequestException('Token de verificación inválido');
    }

    usuario.confirmarEmail();
    await this.usuariosRepo.guardar(usuario);
  }

  /**
   * Genera un token de recuperación si el email existe. Devuelve null si no existe,
   * para que AuthService pueda responder siempre igual y no filtrar qué emails están registrados.
   */
  async generarTokenRecuperacion(
    email: string,
  ): Promise<{ token: string; usuario: Usuario } | null> {
    const usuario = await this.usuariosRepo.buscarPorEmail(email);
    if (!usuario) return null;

    const token = crypto.randomBytes(32).toString('hex');
    usuario.iniciarRecuperacion(token, new Date(Date.now() + 60 * 60 * 1000)); // 1 hora
    await this.usuariosRepo.guardar(usuario);

    return { token, usuario };
  }

  /** Valida el token de recuperación (existencia y vigencia) y setea la nueva contraseña hasheada. */
  async restablecerContrasenia(
    token: string,
    nuevaContrasenia: string,
  ): Promise<void> {
    const usuario = await this.usuariosRepo.buscarPorTokenRecuperacion(token);

    if (!usuario?.recuperacionVigente()) {
      throw new BadRequestException('Token inválido o expirado');
    }

    usuario.cambiarContrasenia(await this.hashearContrasenia(nuevaContrasenia));
    await this.usuariosRepo.guardar(usuario);
  }
}
