import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, type AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import { ReembolsosService } from '../service/reembolsos.service';
import { MensajeReembolsoDto } from '../dto/mensaje-reembolso.dto';

@Controller('reembolsos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReembolsosController {
  constructor(private readonly reembolsosService: ReembolsosService) {}

  @Get('administracion')
  @Roles('Administrador')
  listar() {
    return this.reembolsosService.listarAdministracion();
  }

  @Get('administracion/resumen')
  @Roles('Administrador')
  resumen() {
    return this.reembolsosService.resumenAdministracion();
  }

  @Get('actividad')
  actividad(@Req() req: AuthenticatedRequest) {
    return this.reembolsosService.actividadInquilino(req.user.id);
  }

  @Get('reserva/:id/conversaciones')
  listarConversaciones(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.reembolsosService.listarConversaciones(id, req.user.id);
  }

  @Get(':id/conversacion')
  leerConversacion(@Param('id', ParseIntPipe) id: number, @Query('despuesDe', new DefaultValuePipe(0), ParseIntPipe) despuesDe: number, @Req() req: AuthenticatedRequest) {
    return this.reembolsosService.conversar(id, req.user, despuesDe);
  }

  @Post(':id/conversacion')
  enviarMensaje(@Param('id', ParseIntPipe) id: number, @Body() dto: MensajeReembolsoDto, @Req() req: AuthenticatedRequest) {
    return this.reembolsosService.conversar(id, req.user, 0, dto.texto);
  }
}
