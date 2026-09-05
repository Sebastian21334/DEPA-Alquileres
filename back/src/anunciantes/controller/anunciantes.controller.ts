import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { AnunciantesService } from '../service/anunciantes.service';
import { SolicitarAnuncianteDto } from '../dto/solicitar-anunciante.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';

@Controller('anunciantes')
export class AnunciantesController {
  constructor(private readonly anunciantesService: AnunciantesService) {}

  @Post('solicitar')
  @UseGuards(JwtAuthGuard)
  async solicitarAlta(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SolicitarAnuncianteDto,
  ) {
    return this.anunciantesService.solicitarAlta(req.user.id, dto);
  }

  @Get('pendientes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  async getPendientes() {
    return this.anunciantesService.getPendientes();
  }

  @Patch(':id/aprobar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  async aprobar(@Param('id', ParseIntPipe) id: number) {
    return this.anunciantesService.aprobar(id);
  }

  @Delete(':id/rechazar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  async rechazar(@Param('id', ParseIntPipe) id: number) {
    return this.anunciantesService.rechazar(id);
  }
}