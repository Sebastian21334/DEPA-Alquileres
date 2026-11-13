import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { ResolverSolicitudCancelacionDto } from '../dto/resolver-solicitud-cancelacion.dto';
import { SolicitarCancelacionDto } from '../dto/solicitar-cancelacion.dto';
import { CancelacionesService } from '../service/cancelaciones.service';

/**
 * Solicitudes de cancelación de reservas pagadas. Conserva las rutas bajo
 * `/reservas` que ya consume el frontend.
 */
@Controller('reservas')
export class CancelacionesController {
  constructor(private readonly cancelacionesService: CancelacionesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Get('cancelaciones/administracion')
  listarPendientes() {
    return this.cancelacionesService.listarPendientes();
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancelacion')
  solicitar(@Param('id', ParseIntPipe) id: number, @Body() dto: SolicitarCancelacionDto, @Req() req: AuthenticatedRequest) {
    return this.cancelacionesService.solicitar(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/cancelacion')
  consultarActiva(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.cancelacionesService.consultarActiva(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Patch(':id/cancelacion/:idSolicitud')
  resolver(@Param('id', ParseIntPipe) id: number, @Param('idSolicitud', ParseIntPipe) idSolicitud: number, @Body() dto: ResolverSolicitudCancelacionDto, @Req() req: AuthenticatedRequest) {
    return this.cancelacionesService.resolver(id, idSolicitud, dto, req.user.id);
  }
}
