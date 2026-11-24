import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import { JwtAuthGuard, PermitirAccesoLimitado } from '../../seguridad/guards/jwt-auth.guard';
import { SolicitarCancelacionDto } from '../dto/solicitar-cancelacion.dto';
import { CancelacionesService } from '../service/cancelaciones.service';

/**
 * Cancelación automática de reservas pagadas. Conserva las rutas bajo
 * `/reservas` que ya consume el frontend.
 */
@Controller('reservas')
export class CancelacionesController {
  constructor(private readonly cancelacionesService: CancelacionesService) {}

  @Get('politica-cancelacion/vigente')
  politicaVigente() {
    return this.cancelacionesService.obtenerPoliticaVigente();
  }

  @UseGuards(JwtAuthGuard)
  @PermitirAccesoLimitado()
  @Post(':id/cancelacion')
  solicitar(@Param('id', ParseIntPipe) id: number, @Body() dto: SolicitarCancelacionDto, @Req() req: AuthenticatedRequest) {
    return this.cancelacionesService.solicitar(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @PermitirAccesoLimitado()
  @Get(':id/cancelacion/condiciones')
  consultarCondiciones(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.cancelacionesService.consultarCondiciones(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @PermitirAccesoLimitado()
  @Get(':id/cancelacion')
  consultarActiva(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.cancelacionesService.consultarActiva(id, req.user.id);
  }
}
