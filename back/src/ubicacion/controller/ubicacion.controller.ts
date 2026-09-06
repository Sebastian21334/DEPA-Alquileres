import { Controller, Get, Post, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UbicacionService } from '../service/ubicacion.service';
import { CrearProvinciaDto } from '../dto/crear-provincia.dto';
import { CrearCiudadDto } from '../dto/crear-ciudad.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('ubicacion')
export class UbicacionController {
  constructor(private readonly ubicacionService: UbicacionService) {}

  @Get('provincias')
  // Lecturas públicas usadas para completar formularios y filtros.
  async getProvincias() {
    return this.ubicacionService.getProvincias();
  }

  @Get('provincias/:id/ciudades')
  async getCiudadesPorProvincia(@Param('id', ParseIntPipe) id: number) {
    return this.ubicacionService.getCiudadesPorProvincia(id);
  }

  @Post('provincias')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  async crearProvincia(@Body() dto: CrearProvinciaDto) {
    return this.ubicacionService.crearProvincia(dto);
  }

  @Post('ciudades')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  async crearCiudad(@Body() dto: CrearCiudadDto) {
    // Se resuelve la provincia antes de guardar para crear una relación válida.
    const provincia = await this.ubicacionService.getProvinciaPorId(dto.idProvincia);
    return this.ubicacionService.crearCiudad({ nombre: dto.nombre, provincia });
  }
}