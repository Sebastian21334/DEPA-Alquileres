import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CatalogosService } from '../service/catalogos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('catalogos')
export class CatalogosController {
  constructor(private catalogosService: CatalogosService) {}

  // Los GET son consultas públicas; las operaciones de escritura se protegen abajo.

  // ==========================================
  // ROLES
  // ==========================================
  @Get('roles')
  getRoles() {
    return this.catalogosService.getRoles();
  }

  @Post('roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  // Cada catálogo repite el mismo patrón: validar JWT, rol y delegar al service.
  crearRol(@Body() datos: { nombre: string }) {
    return this.catalogosService.crearRol(datos);
  }

  @Put('roles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  actualizarRol(@Param('id', ParseIntPipe) id: number, @Body() datos: { nombre: string }) {
    return this.catalogosService.actualizarRol(id, datos);
  }

  @Delete('roles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  eliminarRol(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.eliminarRol(id);
  }

  // ==========================================
  // TIPOS ANUNCIANTE
  // ==========================================
  @Get('tipos-anunciante')
  getTiposAnunciante() {
    return this.catalogosService.getTiposAnunciante();
  }

  @Post('tipos-anunciante')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  crearTipoAnunciante(@Body() datos: { nombre: string }) {
    return this.catalogosService.crearTipoAnunciante(datos);
  }

  @Put('tipos-anunciante/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  actualizarTipoAnunciante(@Param('id', ParseIntPipe) id: number, @Body() datos: { nombre: string }) {
    return this.catalogosService.actualizarTipoAnunciante(id, datos);
  }

  @Delete('tipos-anunciante/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  eliminarTipoAnunciante(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.eliminarTipoAnunciante(id);
  }

  // ==========================================
  // TIPOS PROPIEDAD
  // ==========================================
  @Get('tipos-propiedad')
  getTiposPropiedad() {
    return this.catalogosService.getTiposPropiedad();
  }

  @Post('tipos-propiedad')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  crearTipoPropiedad(@Body() datos: { nombre: string }) {
    return this.catalogosService.crearTipoPropiedad(datos);
  }

  @Put('tipos-propiedad/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  actualizarTipoPropiedad(@Param('id', ParseIntPipe) id: number, @Body() datos: { nombre: string }) {
    return this.catalogosService.actualizarTipoPropiedad(id, datos);
  }

  @Delete('tipos-propiedad/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  eliminarTipoPropiedad(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.eliminarTipoPropiedad(id);
  }

  // ==========================================
  // MODALIDADES
  // ==========================================
  @Get('modalidades')
  getModalidades() {
    return this.catalogosService.getModalidades();
  }

  @Post('modalidades')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  crearModalidad(@Body() datos: { nombre: string }) {
    return this.catalogosService.crearModalidad(datos);
  }

  @Put('modalidades/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  actualizarModalidad(@Param('id', ParseIntPipe) id: number, @Body() datos: { nombre: string }) {
    return this.catalogosService.actualizarModalidad(id, datos);
  }

  @Delete('modalidades/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  eliminarModalidad(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.eliminarModalidad(id);
  }

  // ==========================================
  // MÉTODOS DE PAGO
  // ==========================================
  @Get('metodos-pago')
  getMetodosPago() {
    return this.catalogosService.getMetodosPago();
  }

  @Post('metodos-pago')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  crearMetodoPago(@Body() datos: { nombre: string }) {
    return this.catalogosService.crearMetodoPago(datos);
  }

  @Put('metodos-pago/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  actualizarMetodoPago(@Param('id', ParseIntPipe) id: number, @Body() datos: { nombre: string }) {
    return this.catalogosService.actualizarMetodoPago(id, datos);
  }

  @Delete('metodos-pago/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  eliminarMetodoPago(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.eliminarMetodoPago(id);
  }

  // ==========================================
  // TIPOS MONEDA
  // ==========================================
  @Get('tipos-moneda')
  getTiposMoneda() {
    return this.catalogosService.getTiposMoneda();
  }

  @Post('tipos-moneda')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  crearTipoMoneda(@Body() datos: { nombre: string }) {
    return this.catalogosService.crearTipoMoneda(datos);
  }

  @Put('tipos-moneda/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  actualizarTipoMoneda(@Param('id', ParseIntPipe) id: number, @Body() datos: { nombre: string }) {
    return this.catalogosService.actualizarTipoMoneda(id, datos);
  }

  @Delete('tipos-moneda/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  eliminarTipoMoneda(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.eliminarTipoMoneda(id);
  }
}