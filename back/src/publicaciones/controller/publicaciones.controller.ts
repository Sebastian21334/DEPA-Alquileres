import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, Req, ParseIntPipe, Query } from '@nestjs/common';
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
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('categoria') categoria?: any,
    @Query('idsCiudad') idsCiudad?: string,
    @Query('idsTipoPropiedad') idsTipoPropiedad?: string,
    @Query('idsTipoMoneda') idsTipoMoneda?: string,
    @Query('precioMin') precioMin?: string,
    @Query('precioMax') precioMax?: string,
    @Query('ambientes') ambientes?: string,
  ) {
    const ids = (valor?: string) =>
      valor?.split(',').map(Number).filter(Number.isInteger) ?? [];
    const numero = (valor?: string) => {
      const parsed = Number(valor);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    return this.publicacionesService.listarActivas(Number(pagina) || 1, Number(limite) || 12, categoria, {
      idsCiudad: ids(idsCiudad),
      idsTipoPropiedad: ids(idsTipoPropiedad),
      idsTipoMoneda: ids(idsTipoMoneda),
      precioMin: numero(precioMin),
      precioMax: numero(precioMax),
      ambientes: ambientes?.split(',').filter((ambiente) => ['1', '2', '3', '4+'].includes(ambiente)),
    });
  }

    @Get('anunciante/:idAnunciante')
    async listarPorAnunciante(
    @Param('idAnunciante', ParseIntPipe) idAnunciante: number,
    @Query('activa') activa?: string,
    ) {
    const soloActivas = activa === 'true';
    // La query llega como texto; solo el valor exacto true activa el filtro.
    return this.publicacionesService.listarPorAnunciante(idAnunciante, soloActivas);
    }

    

    @Get(':id')
    async buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.publicacionesService.buscarPorId(id);
    }

  @Post()
  @UseGuards(JwtAuthGuard, AnuncianteGuard)
  // AnuncianteGuard agrega req.anunciante y evita confiar en un ID del body.
  async crear(@Req() req: any, @Body() dto: CrearPublicacionDto) {
    return this.publicacionesService.crear(req.anunciante, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AnuncianteGuard)
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() dto: ActualizarPublicacionDto,
  ) {
    return this.publicacionesService.actualizar(id, req.anunciante, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AnuncianteGuard)
  async eliminar(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.publicacionesService.eliminar(id, req.anunciante);
  }
}
