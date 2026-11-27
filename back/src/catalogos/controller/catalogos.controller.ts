import { ROL } from '../codigos-catalogo';
import { Controller, Get, Put, Post, Delete, HttpCode, Param, Body, UseGuards, ValidationPipe } from '@nestjs/common';
import { CatalogosService } from '../service/catalogos.service';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import { ComisionDto } from '../dto/comision.dto';
import { CatalogoParametroDto, ItemCatalogoParametroDto, GuardarCatalogoDto } from '../dto/guardar-catalogo.dto';

@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

  @Post(':catalogo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  crear(@Param(new ValidationPipe({ transform: true })) parametro: CatalogoParametroDto, @Body(new ValidationPipe({ transform: true })) datos: GuardarCatalogoDto) {
    return this.catalogosService.guardarCatalogo(parametro.catalogo, datos);
  }

  @Put(':catalogo/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  actualizar(@Param(new ValidationPipe({ transform: true })) parametro: ItemCatalogoParametroDto, @Body(new ValidationPipe({ transform: true })) datos: GuardarCatalogoDto) {
    return this.catalogosService.guardarCatalogo(parametro.catalogo, datos, parametro.id);
  }

  @Delete(':catalogo/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  async eliminar(@Param(new ValidationPipe({ transform: true })) parametro: ItemCatalogoParametroDto): Promise<void> {
    return this.catalogosService.eliminarCatalogo(parametro.catalogo, parametro.id);
  }
  @Get('comision-vigente')
  async obtenerComisionVigente() {
    return { porcentaje: await this.catalogosService.obtenerComision() };
  }
  @Get('comision-depa')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  async obtenerComision() {
    return { porcentaje: await this.catalogosService.obtenerComision() };
  }
  @Put('comision-depa')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
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
