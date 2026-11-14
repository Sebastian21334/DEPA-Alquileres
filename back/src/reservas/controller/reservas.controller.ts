import { ReservaReprogramacionService } from '../service/reserva-reprogramacion.service';
import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
// reservas/controlador/reservas.controller.ts
import {
  Controller,
  Get,
  Header,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReservasService } from '../service/reservas.service';
import { ActualizarFechasReservaDto } from '../dto/actualizar-fechas-reserva.dto';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { ValidarCodigoAlojamientoDto } from '../dto/validar-codigo-alojamiento.dto';
import { ReportarProblemaReservaDto } from '../dto/reportar-problema-reserva.dto';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService, private readonly reprogramacionService: ReservaReprogramacionService) {}

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
    return this.reservasService.consultarCodigoAlojamiento(
      id,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/validar-codigo')
  validarCodigo(@Param('id', ParseIntPipe) id: number, @Body() dto: ValidarCodigoAlojamientoDto, @Req() req: AuthenticatedRequest) {
    return this.reservasService.validarCodigoAlojamiento(
      id,
      dto.codigo,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reportar-problema')
  reportarProblema(@Param('id', ParseIntPipe) id: number, @Body() dto: ReportarProblemaReservaDto, @Req() req: AuthenticatedRequest) {
    return this.reservasService.reportarProblema(
      id,
      dto.motivo,
      req.user.id,
    );
  }


  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.reservasService.cancelar(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/reembolsos')
  listarReembolsos(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.reservasService.listarReembolsosReserva(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/fechas-disponibles')
  @Header('Cache-Control', 'no-store')
  listarFechasDisponibles(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.reprogramacionService.listarFechasDisponibles(id, req.user.id);
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
