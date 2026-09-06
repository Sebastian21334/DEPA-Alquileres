import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../../usuarios/service/usuarios.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import type { IMailService } from '../../mail/mail.interface';
import { MAIL_SERVICE } from '../../mail/mail.interface';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
    @Inject(MAIL_SERVICE)
    private mailService: IMailService,
  ) {}

  /** Registra un usuario nuevo, genera el token de verificación y dispara el mail. */
  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const existe = await this.usuariosService.buscarPorEmail(email);
    if (existe) {
      throw new ConflictException('El email ya está registrado');
    }

    const usuario = await this.usuariosService.crear({
      ...dto,
      email,
    });

    const token = await this.usuariosService.generarTokenVerificacion(usuario);
    await this.mailService.enviarVerificacion(usuario.email, token);

    return { mensaje: 'Usuario registrado exitosamente, revisá tu email para verificar la cuenta' };
  }

  /** Verifica las credenciales y devuelve un JWT con la identidad y el rol. */
  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.usuariosService.validarUsuarioParaLogin(email, dto.contrasenia);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passValida = await bcrypt.compare(dto.contrasenia, user.contrasenia);
    if (!passValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Se chequea después de la contraseña, para no revelar el estado de
    // verificación de una cuenta con credenciales incorrectas
    if (!user.email_verificado) {
      throw new ForbiddenException('Tenés que verificar tu email antes de iniciar sesión');
    }

    const payload = { sub: user.id, email: user.email, rol: user.rol?.nombre };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async verificarCuenta(token: string) {
    await this.usuariosService.verificarCuenta(token);
    return { mensaje: 'Cuenta verificada correctamente' };
  }

  async solicitarRecuperacion(email: string) {
    const resultado = await this.usuariosService.generarTokenRecuperacion(email.trim().toLowerCase());

    // Si no existe el usuario, igual devolvemos éxito (evita enumeración de emails)
    if (resultado) {
      await this.mailService.enviarRecuperacion(resultado.usuario.email, resultado.token);
    }

    return { mensaje: 'Si el email existe, vas a recibir un link para restablecer tu contraseña' };
  }

  async restablecerContrasenia(token: string, nuevaContrasenia: string) {
    await this.usuariosService.restablecerContrasenia(token, nuevaContrasenia);
    return { mensaje: 'Contraseña restablecida correctamente' };
  }
}