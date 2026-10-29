import { ListarPublicacionesDto } from '../dto/listar-publicaciones.dto';
import type { AnuncianteRequest } from '../../anunciantes/guards/anunciante.guard';
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { PublicacionesService } from '../service/publicaciones.service';
import { CrearPublicacionDto } from '../dto/crear-publicacion.dto';
import { ActualizarPublicacionDto } from '../dto/actualizar-publicacion.dto';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { AnuncianteGuard } from '../../anunciantes/guards/anunciante.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import { BajaPublicacionDto } from '../dto/baja-publicacion.dto';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Get()
  // Las publicaciones activas son la vista pública principal del catálogo.
  async listarActivas(
    @Query(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    consulta: ListarPublicacionesDto,
  ) {
    const { pagina, limite, categoria, q, ...filtros } = consulta;
    return this.publicacionesService.listarActivas(pagina, limite, categoria, {
      ...filtros,
      busqueda: q,
    });
  }

  @Get('administracion')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  listarAdministracion() {
    return this.publicacionesService.listarAdministracion();
  }

  @Patch('administracion/:id/baja')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  darDeBajaAdministracion(
    @Param('id', ParseIntPipe) id: number,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: BajaPublicacionDto,
  ) {
    return this.publicacionesService.darDeBajaAdministracion(id, dto.motivo);
  }

  @Get('anunciante/:idAnunciante')
  async listarPorAnunciante(
    @Param('idAnunciante', ParseIntPipe) idAnunciante: number,
    @Query('activa') activa?: string,
  ) {
    const soloActivas = activa === 'true';
    // La query llega como texto; solo el valor exacto true activa el filtro.
    return this.publicacionesService.listarPorAnunciante(
      idAnunciante,
      soloActivas,
    );
  }

  @Post(':id/visualizacion')
  async registrarVisualizacion(@Param('id', ParseIntPipe) id: number) {
    return this.publicacionesService.registrarVisualizacion(id);
  }

  @Get(':id')
  async buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.publicacionesService.buscarPorId(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AnuncianteGuard)
  // AnuncianteGuard agrega req.anunciante y evita confiar en un ID del body.
  async crear(@Req() req: AnuncianteRequest, @Body() dto: CrearPublicacionDto) {
    return this.publicacionesService.crear(req.anunciante, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AnuncianteGuard)
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AnuncianteRequest,
    @Body() dto: ActualizarPublicacionDto,
  ) {
    return this.publicacionesService.actualizar(id, req.anunciante, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AnuncianteGuard)
  async eliminar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AnuncianteRequest,
  ) {
    return this.publicacionesService.eliminar(id, req.anunciante);
  }
}
