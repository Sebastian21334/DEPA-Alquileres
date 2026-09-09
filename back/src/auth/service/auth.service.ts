import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  Inject,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../../usuarios/service/usuarios.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import type { IMailService } from '../../mail/mail.interface';
import { MAIL_SERVICE } from '../../mail/mail.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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

    // El alta de la cuenta ya quedó confirmada en la base (usuario + token de
    // verificación). Si el proveedor de mail falla o rate-limitea (Azure
    // Communication Services devuelve 429 con bastante facilidad), no
    // queremos que el cliente reciba un error creyendo que el registro no se
    // hizo: solo el mail no salió, y el usuario puede pedir uno nuevo más
    // tarde. Se loguea para que quede auditado sin romper la respuesta.
    try {
      await this.mailService.enviarVerificacion(usuario.email, token);
    } catch (error) {
      this.logger.error(`No se pudo enviar el mail de verificación a ${usuario.email}`, error as Error);
    }

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

    if (user.bloqueado) {
      throw new ForbiddenException('Tu usuario está bloqueado');
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
      // Mismo criterio que en register(): el token ya quedó persistido, así
      // que una falla del proveedor de mail no debe convertirse en un error
      // para el cliente (ver nota en register()).
      try {
        await this.mailService.enviarRecuperacion(resultado.usuario.email, resultado.token);
      } catch (error) {
        this.logger.error(`No se pudo enviar el mail de recuperación a ${resultado.usuario.email}`, error as Error);
      }
    }

    return { mensaje: 'Si el email existe, vas a recibir un link para restablecer tu contraseña' };
  }

  async restablecerContrasenia(token: string, nuevaContrasenia: string) {
    await this.usuariosService.restablecerContrasenia(token, nuevaContrasenia);
    return { mensaje: 'Contraseña restablecida correctamente' };
  }
}