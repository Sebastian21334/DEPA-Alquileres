import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../seguridad/guards/optional-jwt-auth.guard';
import { CrearResenaDto } from '../dto/crear-resena.dto';
import { ListarResenasDto } from '../dto/listar-resenas.dto';
import { ResenasService } from '../service/resenas.service';

/** Reseñas de un objetivo: publicación o perfil de anunciante. */
@Controller()
export class ResenasObjetivoController {
  constructor(private readonly resenasService: ResenasService) {}

  @Get('publicaciones/:id/resenas')
  @UseGuards(OptionalJwtAuthGuard)
  listarPublicacion(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Partial<AuthenticatedRequest>,
    @Query(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) dto: ListarResenasDto,
  ) {
    return this.resenasService.listarPublicacion(id, req.user?.id, dto);
  }

  @Post('publicaciones/:id/resenas')
  @UseGuards(JwtAuthGuard)
  crearPublicacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearResenaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.resenasService.crearPublicacion(id, req.user.id, dto);
  }

  @Get('anunciantes/:id/resenas')
  @UseGuards(OptionalJwtAuthGuard)
  listarAnunciante(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Partial<AuthenticatedRequest>,
    @Query(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) dto: ListarResenasDto,
  ) {
    return this.resenasService.listarAnunciante(id, req.user?.id, dto);
  }

  @Post('anunciantes/:id/resenas')
  @UseGuards(JwtAuthGuard)
  crearAnunciante(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearResenaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.resenasService.crearAnunciante(id, req.user.id, dto);
  }
}
