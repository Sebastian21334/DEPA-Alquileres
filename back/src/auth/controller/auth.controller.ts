import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

import { VerificarCuentaDto } from '../dto/verificar-cuenta.dto';
import { RecuperarContraseniaDto } from '../dto/recuperar-contrasenia.dto';
import { RestablecerContraseniaDto } from '../dto/restablecer-contrasenia.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  // El service crea la cuenta y dispara el correo de verificación.
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('reenviar-verificacion')
  // Requiere las mismas credenciales para evitar abusos y enumeración de cuentas.
  reenviarVerificacion(@Body() dto: LoginDto) {
    return this.authService.reenviarVerificacion(dto);
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
    return this.authService.restablecerContrasenia(
      dto.token,
      dto.nuevaContrasenia,
    );
  }
}
