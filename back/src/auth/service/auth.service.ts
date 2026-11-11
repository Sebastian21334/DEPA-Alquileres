import { UsuariosCredencialesService } from '../../usuarios/service/usuarios-credenciales.service';
import {
  BadRequestException,
  Injectable,
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Inject,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../../usuarios/service/usuarios.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { CambiarContraseniaDto } from '../dto/cambiar-contrasenia.dto';
import type { RestablecerContraseniaDto } from '../dto/restablecer-contrasenia.dto';
import type { IMailService } from '../../mail/mail.interface';
import { MAIL_SERVICE } from '../../mail/mail.interface';

const AUDIENCIA_BLOQUEO = 'depa:apelacion-bloqueo';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly usuariosService: UsuariosService, private readonly credencialesService: UsuariosCredencialesService, private readonly jwtService: JwtService, @Inject(MAIL_SERVICE) private readonly mailService: IMailService) {}

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

    const token = await this.credencialesService.generarTokenVerificacion(usuario);

    // El alta de la cuenta ya quedó confirmada en la base (usuario + token de
    // verificación). Si el proveedor de mail falla o rate-limitea (Azure
    // Communication Services devuelve 429 con bastante facilidad), no
    // queremos que el cliente reciba un error creyendo que el registro no se
    // hizo: solo el mail no salió, y el usuario puede pedir uno nuevo más
    // tarde. Se loguea para que quede auditado sin romper la respuesta.
    try {
      await this.mailService.enviarVerificacion(email, token);
    } catch (error) {
      this.logger.error(
        `No se pudo enviar el mail de verificación a ${email}`,
        error as Error,
      );
    }

    return {
      mensaje:
        'Usuario registrado exitosamente, revisá tu email para verificar la cuenta',
    };
  }

  /** Verifica las credenciales y devuelve un JWT con la identidad y el rol. */
  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.credencialesService.validarCredenciales(
      email,
      dto.contrasenia,
      true,
    );

    if (user.bloqueado) {
      const bloqueoId = user.bloqueoDetalle?.id;
      const tokenBloqueo = bloqueoId && await this.jwtService.signAsync(
        { usuarioBloqueadoId: user.id, bloqueoId },
        { audience: AUDIENCIA_BLOQUEO, expiresIn: '15m' },
      );
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden',
        message: 'Tu usuario está bloqueado',
        codigo: 'USUARIO_BLOQUEADO',
        tokenBloqueo,
      });
    }

    // Se chequea después de la contraseña, para no revelar el estado de
    // verificación de una cuenta con credenciales incorrectas
    if (!user.email_verificado) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden',
        message: 'Tu cuenta está inactiva',
        codigo: 'EMAIL_NO_VERIFICADO',
      });
    }

    const payload = { sub: user.id, email: user.email, rol: user.rol?.nombre };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  private async verificarTokenBloqueo(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{ usuarioBloqueadoId?: number; bloqueoId?: string }>(
        token, { audience: AUDIENCIA_BLOQUEO, algorithms: ['HS256'] },
      );
      if (typeof payload.usuarioBloqueadoId === 'number' && Number.isSafeInteger(payload.usuarioBloqueadoId)
        && payload.usuarioBloqueadoId > 0 && typeof payload.bloqueoId === 'string') {
        return { usuarioId: payload.usuarioBloqueadoId, bloqueoId: payload.bloqueoId };
      }
    } catch {
      // Un token vencido o con otra audiencia requiere volver al login.
    }
    throw new UnauthorizedException('Volvé a ingresar para consultar el bloqueo.');
  }

  async consultarBloqueo(token: string) {
    const { usuarioId, bloqueoId } = await this.verificarTokenBloqueo(token);
    return this.usuariosService.consultarBloqueo(usuarioId, bloqueoId);
  }

  async apelarBloqueo(token: string, texto: string) {
    const { usuarioId, bloqueoId } = await this.verificarTokenBloqueo(token);
    return this.usuariosService.apelarBloqueo(usuarioId, bloqueoId, texto);
  }

  /** Genera un token nuevo y reenvía el mail para una cuenta aún no verificada. */
  async reenviarVerificacion(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.credencialesService.validarCredenciales(
      email,
      dto.contrasenia,
    );

    // Si ya se verificó, no se genera ni se envía un token innecesario.
    if (user.email_verificado) {
      return {
        mensaje:
          'Si tu cuenta necesita verificación, vas a recibir un nuevo email',
      };
    }

    const token = await this.credencialesService.generarTokenVerificacion(user);
    try {
      await this.mailService.enviarVerificacion(email, token);
    } catch (error) {
      this.logger.error(
        `No se pudo reenviar el mail de verificación a ${email}`,
        error as Error,
      );
    }

    return {
      mensaje:
        'Te enviamos un nuevo email de verificación. Revisá tu bandeja de entrada y spam',
    };
  }

  async verificarCuenta(token: string) {
    await this.credencialesService.verificarCuenta(token);
    return { mensaje: 'Cuenta verificada correctamente' };
  }

  async solicitarRecuperacion(email: string) {
    const resultado = await this.credencialesService.generarTokenRecuperacion(
      email.trim().toLowerCase(),
    );

    // Si no existe el usuario, igual devolvemos éxito (evita enumeración de emails)
    // Las cuentas dadas de baja no tienen email vigente y no llegan hasta acá (RN-37).
    if (resultado?.usuario.email) {
      // Mismo criterio que en register(): el token ya quedó persistido, así
      // que una falla del proveedor de mail no debe convertirse en un error
      // para el cliente (ver nota en register()).
      try {
        await this.mailService.enviarRecuperacion(
          resultado.usuario.email,
          resultado.token,
        );
      } catch (error) {
        this.logger.error(
          `No se pudo enviar el mail de recuperación a ${resultado.usuario.email}`,
          error as Error,
        );
      }
    }

    return {
      mensaje:
        'Si el email existe, vas a recibir un link para restablecer tu contraseña',
    };
  }

  async restablecerContrasenia(dto: RestablecerContraseniaDto) {
    this.validarConfirmacionContrasenia(
      dto.nuevaContrasenia,
      dto.confirmarContrasenia,
    );
    const usuario = await this.credencialesService.restablecerContrasenia(
      dto.token,
      dto.nuevaContrasenia,
    );
    await this.notificarCambioContrasenia(usuario.email);
    return { mensaje: 'Contraseña restablecida correctamente' };
  }

  async cambiarContrasenia(idUsuario: number, dto: CambiarContraseniaDto) {
    this.validarConfirmacionContrasenia(
      dto.nuevaContrasenia,
      dto.confirmarContrasenia,
    );
    const usuario = await this.credencialesService.cambiarContrasenia(
      idUsuario,
      dto.contraseniaActual,
      dto.nuevaContrasenia,
    );
    await this.notificarCambioContrasenia(usuario.email);
    return { mensaje: 'Contraseña actualizada correctamente' };
  }

  private validarConfirmacionContrasenia(nuevaContrasenia: string, confirmarContrasenia: string): void {
    if (nuevaContrasenia !== confirmarContrasenia) {
      throw new BadRequestException(['Las contraseñas no coinciden']);
    }
  }

  private async notificarCambioContrasenia(email: string | null): Promise<void> {
    if (!email) return;
    try {
      await this.mailService.enviarCambioContrasenia(email);
    } catch {
      // La contraseña ya se guardó. No revertirla ni registrar datos sensibles del envío.
      this.logger.error('No se pudo enviar la notificación de cambio de contraseña');
    }
  }
}
