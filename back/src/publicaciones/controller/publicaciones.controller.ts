import { Controller, Post, Get, Delete, Param, Body, UseGuards, Req, ParseIntPipe, Query } from '@nestjs/common';
import { PublicacionesService } from '../service/publicaciones.service';
import { CrearPublicacionDto } from '../dto/crear-publicacion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnuncianteGuard } from '../../common/guards/anunciante.guard';
import type { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Get()
  async listarActivas() {
    return this.publicacionesService.listarActivas();
    }

    @Get('anunciante/:idAnunciante')
    async listarPorAnunciante(
    @Param('idAnunciante', ParseIntPipe) idAnunciante: number,
    @Query('activa') activa?: string,
    ) {
    const soloActivas = activa === 'true';
    return this.publicacionesService.listarPorAnunciante(idAnunciante, soloActivas);
    }

    

    @Get(':id')
    async buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.publicacionesService.buscarPorId(id);
    }

  @Post()
  @UseGuards(JwtAuthGuard, AnuncianteGuard)
  async crear(@Req() req: any, @Body() dto: CrearPublicacionDto) {
    return this.publicacionesService.crear(req.anunciante, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AnuncianteGuard)
  async eliminar(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.publicacionesService.eliminar(id, req.anunciante);
  }
}