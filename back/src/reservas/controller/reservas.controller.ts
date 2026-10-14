import { ReservaLiquidacionesService } from '../service/reserva-liquidaciones.service';
import type { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';
// reservas/controlador/reservas.controller.ts
import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReservasService } from '../service/reservas.service';
import { ActualizarFechasReservaDto } from '../dto/actualizar-fechas-reserva.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ValidarCodigoAlojamientoDto } from '../dto/validar-codigo-alojamiento.dto';
import { ReportarProblemaReservaDto } from '../dto/reportar-problema-reserva.dto';
import { ResolverLiquidacionDto } from '../dto/resolver-liquidacion.dto';

@Controller('reservas')
export class ReservasController {
  constructor(
    private readonly reservasService: ReservasService,
    private readonly liquidacionesService: ReservaLiquidacionesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('mis-reservas')
  // Filtra el historial por el usuario autenticado.
  listarPorUsuario(@Req() req: AuthenticatedRequest) {
    return this.reservasService.listarPorUsuario(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recibidas')
  listarRecibidas(@Req() req: AuthenticatedRequest) {
    return this.reservasService.listarRecibidasPorAnunciante(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Get('liquidaciones/administracion')
  listarLiquidacionesAdministracion() {
    return this.liquidacionesService.listarLiquidacionesAdministracion();
  }

  @UseGuards(JwtAuthGuard)
  @Get('publicacion/:id')
  listarPorPublicacion(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reservasService.listarPorPublicacion(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  buscarPorId(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reservasService.buscarPorId(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/codigo-alojamiento')
  consultarCodigo(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.liquidacionesService.consultarCodigoAlojamiento(
      id,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/validar-codigo')
  validarCodigo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ValidarCodigoAlojamientoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.liquidacionesService.validarCodigoAlojamiento(
      id,
      dto.codigo,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reportar-problema')
  reportarProblema(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReportarProblemaReservaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.liquidacionesService.reportarProblema(
      id,
      dto.motivo,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Patch(':id/liquidacion')
  resolverLiquidacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResolverLiquidacionDto,
  ) {
    return this.liquidacionesService.resolverLiquidacion(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/finalizar')
  finalizar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reservasService.finalizar(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancelar')
  cancelar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reservasService.cancelar(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/fechas')
  actualizarFechas(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarFechasReservaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reservasService.actualizarFechas(id, dto, req.user.id);
  }
}
