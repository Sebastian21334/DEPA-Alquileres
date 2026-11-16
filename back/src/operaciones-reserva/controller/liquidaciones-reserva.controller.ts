import { Body, Controller, Get, Header, Param, ParseIntPipe, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, type AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import { ResolverLiquidacionDto } from '../dto/resolver-liquidacion.dto';
import { OperacionesLiquidacionService } from '../service/operaciones-liquidacion.service';

@Controller('reservas')
export class LiquidacionesReservaController {
  constructor(private readonly liquidacionesService: OperacionesLiquidacionService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Get('liquidaciones/administracion')
  listarLiquidacionesAdministracion() {
    return this.liquidacionesService.listarLiquidacionesAdministracion();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Get('liquidaciones/administracion/historial')
  listarPagosRegistrados() {
    return this.liquidacionesService.listarPagosRegistrados();
  }

  @UseGuards(JwtAuthGuard)
  @Get('liquidaciones/publicacion/:id')
  listarPagosDelAnunciante(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.liquidacionesService.listarPagosDelAnunciante(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Get(':id/liquidacion/cbu')
  @Header('Cache-Control', 'no-store')
  consultarCbuParaPago(@Param('id', ParseIntPipe) id: number) {
    return this.liquidacionesService.consultarCbuParaPago(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Patch(':id/liquidacion')
  resolverLiquidacion(@Param('id', ParseIntPipe) id: number, @Body() dto: ResolverLiquidacionDto, @Req() req: AuthenticatedRequest) {
    return this.liquidacionesService.resolverLiquidacion(id, dto, req.user.id);
  }
}
