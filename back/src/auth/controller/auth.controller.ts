import { Body, Controller, Header, Headers, HttpCode, Patch, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ApelacionBloqueoDto, ConsultarBloqueoDto } from '../dto/apelacion-bloqueo.dto';

import { VerificarCuentaDto } from '../dto/verificar-cuenta.dto';
import { RecuperarContraseniaDto } from '../dto/recuperar-contrasenia.dto';
import { RestablecerContraseniaDto } from '../dto/restablecer-contrasenia.dto';
import { CambiarContraseniaDto } from '../dto/cambiar-contrasenia.dto';
import { ConfirmarReactivacionDto } from '../dto/confirmar-reactivacion.dto';
import { SolicitarReactivacionDto } from '../dto/solicitar-reactivacion.dto';
import { JwtAuthGuard, type AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Header('Cache-Control', 'no-store')
  // El service crea la cuenta y dispara el correo de verificación.
  register(@Body() dto: RegisterDto, @Headers('origin') origen?: string) {
    return this.authService.register(dto, origen);
  }

  @Post('reactivar-cuenta/solicitar')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  solicitarReactivacion(@Body() dto: SolicitarReactivacionDto, @Headers('origin') origen?: string) {
    return this.authService.solicitarReactivacion(dto, origen);
  }

  @Post('reactivar-cuenta/confirmar')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  confirmarReactivacion(@Body() dto: ConfirmarReactivacionDto) {
    return this.authService.confirmarReactivacion(dto.token, dto.contrasenia);
  }

  @Post('login')
  @Header('Cache-Control', 'no-store')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('bloqueo/consultar')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  consultarBloqueo(@Body() dto: ConsultarBloqueoDto) {
    return this.authService.consultarBloqueo(dto.token);
  }

  @Post('bloqueo/apelar')
  @Header('Cache-Control', 'no-store')
  apelarBloqueo(@Body(new ValidationPipe({ transform: true })) dto: ApelacionBloqueoDto) {
    return this.authService.apelarBloqueo(dto.token, dto.texto);
  }

  @Post('reenviar-verificacion')
  // Requiere las mismas credenciales para evitar abusos y enumeración de cuentas.
  reenviarVerificacion(@Body() dto: LoginDto, @Headers('origin') origen?: string) {
    return this.authService.reenviarVerificacion(dto, origen);
  }

  @Post('verificar-cuenta')
  // El token llega desde el link del correo y se consume una sola vez.
  verificarCuenta(@Body() dto: VerificarCuentaDto) {
    return this.authService.verificarCuenta(dto.token);
  }

  @Post('recuperar-contrasenia')
  // Devuelve siempre una respuesta neutra para no revelar emails registrados.
  solicitarRecuperacion(@Body() dto: RecuperarContraseniaDto) {
    return this.authService.solicitarRecuperacion(dto.email);
  }

  @Post('restablecer-contrasenia')
  restablecerContrasenia(@Body() dto: RestablecerContraseniaDto) {
    return this.authService.restablecerContrasenia(dto);
  }

  @Patch('cambiar-contrasenia')
  @UseGuards(JwtAuthGuard)
  cambiarContrasenia(@Req() req: AuthenticatedRequest, @Body() dto: CambiarContraseniaDto) {
    return this.authService.cambiarContrasenia(req.user.id, dto);
  }
}
