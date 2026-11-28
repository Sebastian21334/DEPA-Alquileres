import { BuscarDireccionDto } from '../dto/buscar-direccion.dto';
import { CrearCiudadDto, IdUbicacionDto, ModificarUbicacionDto } from '../dto/modificar-ubicacion.dto';
import {
  Controller,
  Body,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Query,
  Put,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UbicacionService } from '../service/ubicacion.service';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import { ROL } from '../../catalogos/codigos-catalogo';

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

  @Post('provincias')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  crearProvincia(@Body(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) datos: ModificarUbicacionDto) {
    return this.ubicacionService.crearProvincia(datos.nombre);
  }

  @Post('ciudades')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  crearCiudad(@Body(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) datos: CrearCiudadDto) {
    return this.ubicacionService.crearCiudad(datos.nombre, datos.idProvincia);
  }

  @Put('provincias/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  modificarProvincia(@Param(new ValidationPipe({ transform: true })) parametro: IdUbicacionDto, @Body(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) datos: ModificarUbicacionDto) {
    return this.ubicacionService.modificarProvincia(parametro.id, datos.nombre);
  }

  @Put('ciudades/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  modificarCiudad(@Param(new ValidationPipe({ transform: true })) parametro: IdUbicacionDto, @Body(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) datos: ModificarUbicacionDto) {
    return this.ubicacionService.modificarCiudad(parametro.id, datos.nombre);
  }

  @Delete('provincias/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  eliminarProvincia(@Param(new ValidationPipe({ transform: true })) parametro: IdUbicacionDto) {
    return this.ubicacionService.eliminarProvincia(parametro.id);
  }

  @Delete('ciudades/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  eliminarCiudad(@Param(new ValidationPipe({ transform: true })) parametro: IdUbicacionDto) {
    return this.ubicacionService.eliminarCiudad(parametro.id);
  }
}
