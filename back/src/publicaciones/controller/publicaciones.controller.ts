import { ListarPublicacionesDto } from '../dto/listar-publicaciones.dto';
import type { AnuncianteRequest } from '../../auth/interfaces/authenticated-request.interface';
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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnuncianteGuard } from '../../common/guards/anunciante.guard';

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
