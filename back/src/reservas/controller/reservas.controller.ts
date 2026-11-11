import { ReservaLiquidacionesService } from '../service/reserva-liquidaciones.service';
import { ReservaReprogramacionService } from '../service/reserva-reprogramacion.service';
import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
// reservas/controlador/reservas.controller.ts
import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReservasService } from '../service/reservas.service';
import { ActualizarFechasReservaDto } from '../dto/actualizar-fechas-reserva.dto';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import { ValidarCodigoAlojamientoDto } from '../dto/validar-codigo-alojamiento.dto';
import { ReportarProblemaReservaDto } from '../dto/reportar-problema-reserva.dto';
import { ResolverLiquidacionDto } from '../dto/resolver-liquidacion.dto';
import { SolicitarCancelacionDto } from '../dto/solicitar-cancelacion.dto';
import { ResolverSolicitudCancelacionDto } from '../dto/resolver-solicitud-cancelacion.dto';
import { RegistrarReembolsoManualDto } from '../../reembolsos/dto/registrar-reembolso-manual.dto';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService, private readonly liquidacionesService: ReservaLiquidacionesService, private readonly reprogramacionService: ReservaReprogramacionService) {}

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Get('cancelaciones/administracion')
  listarSolicitudesCancelacion() {
    return this.reservasService.listarSolicitudesCancelacion();
  }

  @UseGuards(JwtAuthGuard)
  @Get('publicacion/:id')
  listarPorPublicacion(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.reservasService.listarPorPublicacion(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.reservasService.buscarPorId(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/codigo-alojamiento')
  consultarCodigo(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.liquidacionesService.consultarCodigoAlojamiento(
      id,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/validar-codigo')
  validarCodigo(@Param('id', ParseIntPipe) id: number, @Body() dto: ValidarCodigoAlojamientoDto, @Req() req: AuthenticatedRequest) {
    return this.liquidacionesService.validarCodigoAlojamiento(
      id,
      dto.codigo,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reportar-problema')
  reportarProblema(@Param('id', ParseIntPipe) id: number, @Body() dto: ReportarProblemaReservaDto, @Req() req: AuthenticatedRequest) {
    return this.liquidacionesService.reportarProblema(
      id,
      dto.motivo,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Patch(':id/liquidacion')
  resolverLiquidacion(@Param('id', ParseIntPipe) id: number, @Body() dto: ResolverLiquidacionDto, @Req() req: AuthenticatedRequest) {
    return this.liquidacionesService.resolverLiquidacion(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.reservasService.cancelar(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancelacion')
  solicitarCancelacion(@Param('id', ParseIntPipe) id: number, @Body() dto: SolicitarCancelacionDto, @Req() req: AuthenticatedRequest) {
    return this.reservasService.solicitarCancelacion(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/cancelacion')
  consultarSolicitudCancelacion(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.reservasService.consultarSolicitudCancelacion(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Patch(':id/cancelacion/:idSolicitud')
  resolverSolicitudCancelacion(@Param('id', ParseIntPipe) id: number, @Param('idSolicitud', ParseIntPipe) idSolicitud: number, @Body() dto: ResolverSolicitudCancelacionDto, @Req() req: AuthenticatedRequest) {
    return this.reservasService.resolverSolicitudCancelacion(
      id,
      idSolicitud,
      dto,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Patch('reembolsos/:id/manual')
  registrarReembolsoManual(@Param('id', ParseIntPipe) id: number, @Body() dto: RegistrarReembolsoManualDto, @Req() req: AuthenticatedRequest) {
    return this.reservasService.registrarReembolsoManual(
      id,
      dto.referencia,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/reembolsos')
  listarReembolsos(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.reservasService.listarReembolsosReserva(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/fechas')
  actualizarFechas(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarFechasReservaDto, @Req() req: AuthenticatedRequest) {
    return this.reprogramacionService.actualizarFechas(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reprogramaciones/:idCambio/notificar')
  reintentarAviso(@Param('id', ParseIntPipe) id: number, @Param('idCambio', ParseIntPipe) idCambio: number, @Req() req: AuthenticatedRequest) {
    return this.reprogramacionService.reintentarAvisoReprogramacion(
      id,
      idCambio,
      req.user.id,
    );
  }
}
