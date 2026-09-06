// reservas/controlador/reservas.controller.ts
import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ReservasService } from '../service/reservas.service';
import { CrearReservaDto } from '../dto/crear-reserva.dto';
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
  @Get('publicacion/:id')
  listarPorPublicacion(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.listarPorPublicacion(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.buscarPorId(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/finalizar')
  finalizar(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.finalizar(id);
  }
}