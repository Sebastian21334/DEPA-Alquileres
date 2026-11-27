import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { ListarResenasAdministracionDto } from '../dto/listar-resenas-administracion.dto';
import { ModerarResenaDto } from '../dto/moderar-resena.dto';
import { ResenasAdministracionService } from '../service/resenas-administracion.service';

@Controller('administracion/resenas')
export class ResenasAdministracionController {
  constructor(private readonly resenasService: ResenasAdministracionService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  listar(
    @Query(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) dto: ListarResenasAdministracionDto,
  ) {
    return this.resenasService.listarAdministracion(dto);
  }

  @Patch(':id/visibilidad')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  moderar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ModerarResenaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.resenasService.moderar(id, req.user.id, dto);
  }

  @Delete(':id/denuncia')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  quitarDenuncia(@Param('id', ParseIntPipe) id: number) {
    return this.resenasService.quitarDenuncia(id);
  }
}
