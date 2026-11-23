import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { CatalogosService } from '../service/catalogos.service';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import { ComisionDto } from '../dto/comision.dto';

@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

  // Catálogos (rol, tipos, modalidad, moneda): seed/migración, solo consulta.
  // Excepción: comisión DEPA, configuración de negocio con escritura de Administrador.
  @Get('comision-vigente')
  async obtenerComisionVigente() {
    return { porcentaje: await this.catalogosService.obtenerComision() };
  }
  @Get('comision-depa')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  async obtenerComision() {
    return { porcentaje: await this.catalogosService.obtenerComision() };
  }
  @Put('comision-depa')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  async actualizarComision(@Body() datos: ComisionDto) {
    return { porcentaje: await this.catalogosService.actualizarComision(datos.porcentaje) };
  }

  @Get('roles')
  getRoles() {
    return this.catalogosService.getRoles();
  }

  @Get('tipos-anunciante')
  getTiposAnunciante() {
    return this.catalogosService.getTiposAnunciante();
  }

  @Get('tipos-propiedad')
  getTiposPropiedad() {
    return this.catalogosService.getTiposPropiedad();
  }

  @Get('modalidades')
  getModalidades() {
    return this.catalogosService.getModalidades();
  }

  @Get('tipos-moneda')
  getTiposMoneda() {
    return this.catalogosService.getTiposMoneda();
  }
}
