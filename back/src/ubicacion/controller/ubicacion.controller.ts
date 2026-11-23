import { BuscarDireccionDto } from '../dto/buscar-direccion.dto';
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
  async buscarDireccion(@Query() consulta: BuscarDireccionDto) {
    return this.ubicacionService.buscarDireccion(consulta.direccion, consulta.ciudad, consulta.provincia);
  }

  @Get('provincias/:id/ciudades')
  async getCiudadesPorProvincia(@Param('id', ParseIntPipe) id: number) {
    return this.ubicacionService.getCiudadesPorProvincia(id);
  }
}
