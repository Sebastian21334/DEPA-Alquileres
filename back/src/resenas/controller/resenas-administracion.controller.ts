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
import { ROL } from '../../catalogos/codigos-catalogo';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { ListarResenasAdministracionDto } from '../dto/listar-resenas-administracion.dto';
import { ModerarResenaDto } from '../dto/moderar-resena.dto';
import { ResolverDenunciaDto } from '../dto/resolver-denuncia.dto';
import { ResenasAdministracionService } from '../service/resenas-administracion.service';

@Controller('administracion/resenas')
export class ResenasAdministracionController {
  constructor(private readonly resenasService: ResenasAdministracionService) {}

  @Get('denuncias/historial')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  historialDenuncias() {
    return this.resenasService.historialDenuncias();
  }

  @Patch(':id/denuncia/resolucion')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  resolverDenuncia(@Param('id', ParseIntPipe) id: number, @Body() dto: ResolverDenunciaDto, @Req() req: AuthenticatedRequest) {
    return this.resenasService.resolverDenuncia(id, req.user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  listar(
    @Query(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) dto: ListarResenasAdministracionDto,
  ) {
    return this.resenasService.listarAdministracion(dto);
  }

  @Patch(':id/visibilidad')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  moderar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ModerarResenaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.resenasService.moderar(id, req.user.id, dto);
  }

  @Delete(':id/denuncia')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  quitarDenuncia(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.resenasService.resolverDenuncia(id, req.user.id, { aceptada: false, motivo: 'Denuncia desestimada por administración.' });
  }
}
