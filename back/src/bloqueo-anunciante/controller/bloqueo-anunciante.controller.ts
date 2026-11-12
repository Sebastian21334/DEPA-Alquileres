import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import {
  BloquearUsuarioDto,
  CambiarBloqueoDto,
} from '../dto/cambiar-bloqueo.dto';
import { BloqueoAnuncianteService } from '../service/bloqueo-anunciante.service';

/**
 * Endpoints administrativos de bloqueo. Se mantienen las mismas rutas que
 * usaba UsuariosController para no cambiar el contrato del frontend.
 */
@Controller('usuarios')
export class BloqueoAnuncianteController {
  constructor(private readonly bloqueoService: BloqueoAnuncianteService) {}

  @Patch(':id/bloquear')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  bloquear(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true })) dto: BloquearUsuarioDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.bloqueoService.cambiarBloqueo(
      id,
      true,
      req.user.id,
      dto.motivo,
    );
  }

  @Patch(':id/habilitar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  habilitar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarBloqueoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.bloqueoService.cambiarBloqueo(
      id,
      false,
      req.user.id,
      dto.motivo,
    );
  }
}
