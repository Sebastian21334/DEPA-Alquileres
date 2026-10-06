// reservas/controlador/reservas.controller.ts
import { Controller, Get, Patch, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
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
  constructor(private readonly reservasService: ReservasService) {}

  @UseGuards(JwtAuthGuard)
  @Get('mis-reservas')
  // Filtra el historial por el usuario autenticado.
  listarPorUsuario(@Req() req: any) {
    return this.reservasService.listarPorUsuario(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recibidas')
  listarRecibidas(@Req() req: any) {
    return this.reservasService.listarRecibidasPorAnunciante(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Get('liquidaciones/administracion')
  listarLiquidacionesAdministracion() {
    return this.reservasService.listarLiquidacionesAdministracion();
  }

  @UseGuards(JwtAuthGuard)
  @Get('publicacion/:id')
  listarPorPublicacion(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.reservasService.listarPorPublicacion(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.reservasService.buscarPorId(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/codigo-alojamiento')
  consultarCodigo(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.reservasService.consultarCodigoAlojamiento(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/validar-codigo')
  validarCodigo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ValidarCodigoAlojamientoDto,
    @Req() req: any,
  ) {
    return this.reservasService.validarCodigoAlojamiento(id, dto.codigo, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reportar-problema')
  reportarProblema(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReportarProblemaReservaDto,
    @Req() req: any,
  ) {
    return this.reservasService.reportarProblema(id, dto.motivo, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Patch(':id/liquidacion')
  resolverLiquidacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResolverLiquidacionDto,
  ) {
    return this.reservasService.resolverLiquidacion(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/finalizar')
  finalizar(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.reservasService.finalizar(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.reservasService.cancelar(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/fechas')
  actualizarFechas(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarFechasReservaDto,
    @Req() req: any,
  ) {
    return this.reservasService.actualizarFechas(id, dto, req.user.id);
  }
}
