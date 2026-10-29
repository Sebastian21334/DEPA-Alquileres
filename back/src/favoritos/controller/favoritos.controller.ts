import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { FavoritosService } from '../service/favoritos.service';

@Controller('favoritos')
@UseGuards(JwtAuthGuard)
export class FavoritosController {
  constructor(private readonly favoritos: FavoritosService) {}

  @Get()
  listar(@Req() req: AuthenticatedRequest) {
    return this.favoritos.listar(req.user.id);
  }

  @Post(':idPublicacion')
  agregar(
    @Param('idPublicacion', ParseIntPipe) idPublicacion: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.favoritos.agregar(req.user.id, idPublicacion);
  }

  @Delete(':idPublicacion')
  quitar(
    @Param('idPublicacion', ParseIntPipe) idPublicacion: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.favoritos.quitar(req.user.id, idPublicacion);
  }
}
