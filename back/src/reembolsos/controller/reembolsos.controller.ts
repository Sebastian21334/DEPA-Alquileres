import { ROL } from '../../catalogos/codigos-catalogo';
import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, PermitirAccesoLimitado, type AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import { ReembolsosService } from '../service/reembolsos.service';
import { MensajeReembolsoDto } from '../dto/mensaje-reembolso.dto';

@Controller('reembolsos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReembolsosController {
  constructor(private readonly reembolsosService: ReembolsosService) {}

  @Get('administracion')
  @Roles(ROL.ADMINISTRADOR)
  listar() {
    return this.reembolsosService.listarAdministracion();
  }

  @Get('administracion/resumen')
  @Roles(ROL.ADMINISTRADOR)
  resumen() {
    return this.reembolsosService.resumenAdministracion();
  }

  @PermitirAccesoLimitado()
  @Get('actividad')
  actividad(@Req() req: AuthenticatedRequest) {
    return this.reembolsosService.actividadInquilino(req.user.id);
  }

  @PermitirAccesoLimitado()
  @Get('reserva/:id/conversaciones')
  listarConversaciones(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.reembolsosService.listarConversaciones(id, req.user.id);
  }

  /** Enlace firmado del comprobante de la transferencia (admin o inquilino de la reserva). */
  @PermitirAccesoLimitado()
  @Get(':id/comprobante')
  urlComprobante(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.reembolsosService.urlComprobante(id, req.user);
  }

  @PermitirAccesoLimitado()
  @Get(':id/conversacion')
  leerConversacion(@Param('id', ParseIntPipe) id: number, @Query('despuesDe', new DefaultValuePipe(0), ParseIntPipe) despuesDe: number, @Req() req: AuthenticatedRequest) {
    return this.reembolsosService.conversar(id, req.user, despuesDe);
  }

  @PermitirAccesoLimitado()
  @Post(':id/conversacion')
  enviarMensaje(@Param('id', ParseIntPipe) id: number, @Body() dto: MensajeReembolsoDto, @Req() req: AuthenticatedRequest) {
    return this.reembolsosService.conversar(id, req.user, 0, dto.texto);
  }
}
