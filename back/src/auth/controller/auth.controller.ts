import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

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

  @Post('verificar-cuenta')
  // El token llega desde el link del correo y se consume una sola vez.
  verificarCuenta(@Body('token') token: string) {
    return this.authService.verificarCuenta(token);
  }

  @Post('recuperar-contrasenia')
  // Devuelve siempre una respuesta neutra para no revelar emails registrados.
  solicitarRecuperacion(@Body('email') email: string) {
    return this.authService.solicitarRecuperacion(email);
  }

  @Post('restablecer-contrasenia')
  restablecerContrasenia(@Body() dto: { token: string; nuevaContrasenia: string }) {
    return this.authService.restablecerContrasenia(dto.token, dto.nuevaContrasenia);
  }
}