// reservas/controlador/reservas.controller.ts
import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ReservasService } from '../service/reservas.service';
import { CrearReservaDto } from '../dto/crear-reserva.dto';
import { ActualizarFechasReservaDto } from '../dto/actualizar-fechas-reserva.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  // El usuario que reserva sale del token, no de un campo manipulable del DTO.
  crear(@Body() dto: CrearReservaDto, @Req() req: any) {
    return this.reservasService.crear(dto, req.user.id);
  }

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
