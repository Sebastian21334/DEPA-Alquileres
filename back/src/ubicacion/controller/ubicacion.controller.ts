import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UbicacionService } from '../service/ubicacion.service';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';

@Controller('ubicacion')
export class UbicacionController {
  constructor(private readonly ubicacionService: UbicacionService) {}

  @Get('provincias')
  // Lecturas públicas usadas para completar formularios y filtros.
  async getProvincias() {
    return this.ubicacionService.getProvincias();
  }

  @Get('buscar-direccion')
  @UseGuards(JwtAuthGuard)
  async buscarDireccion(@Query('direccion') direccion: string, @Query('ciudad') ciudad: string, @Query('provincia') provincia: string) {
    return this.ubicacionService.buscarDireccion(direccion, ciudad, provincia);
  }

  @Get('provincias/:id/ciudades')
  async getCiudadesPorProvincia(@Param('id', ParseIntPipe) id: number) {
    return this.ubicacionService.getCiudadesPorProvincia(id);
  }
}
