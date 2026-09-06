import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { DisponibilidadService } from '../service/disponibilidad.service';
import { CrearDisponibilidadDto } from '../dto/crear-disponibilidad.dto';
import { ActualizarDisponibilidadDto } from '../dto/actualizar-disponibilidad.dto';
import { PropietarioPublicacionGuard } from '../../common/guards/propietario-publicacion.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; // ajustá el nombre si es distinto

@Controller('disponibilidad')
export class DisponibilidadController {
  constructor(private readonly disponibilidadService: DisponibilidadService) {}

  @UseGuards(JwtAuthGuard, PropietarioPublicacionGuard)
  @Post()
  crear(@Body() dto: CrearDisponibilidadDto) {
    return this.disponibilidadService.crear(dto);
  }

  @Get('publicacion/:id')
  listarPorPublicacion(@Param('id', ParseIntPipe) id: number) {
    return this.disponibilidadService.listarPorPublicacion(id);
  }

  @UseGuards(JwtAuthGuard, PropietarioPublicacionGuard)
  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarDisponibilidadDto) {
    return this.disponibilidadService.actualizar(id, dto);
  }

  @UseGuards(JwtAuthGuard, PropietarioPublicacionGuard)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.disponibilidadService.eliminar(id);
  }
}