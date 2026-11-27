import { Body, Controller, Patch, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard, type AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import { ActualizarContactoDto } from '../dto/actualizar-contacto.dto';
import { AnunciantesService } from '../service/anunciantes.service';

@Controller('anunciantes')
export class AnunciantesController {
  constructor(private readonly anunciantesService: AnunciantesService) {}

  @Patch('me/contacto')
  @UseGuards(JwtAuthGuard)
  actualizarContacto(@Req() req: AuthenticatedRequest, @Body(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) dto: ActualizarContactoDto) {
    return this.anunciantesService.actualizarContacto(req.user.id, dto.numero_contacto);
  }
}
