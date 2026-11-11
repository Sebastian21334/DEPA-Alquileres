import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import { DisputasService } from '../service/disputas.service';
import { ResolverDisputaDto } from '../dto/resolver-disputa.dto';

@Controller('disputas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Administrador')
export class DisputasController {
  constructor(private readonly disputasService: DisputasService) {}

  @Get('administracion')
  listar() {
    return this.disputasService.listarAdministracion();
  }

  @Patch(':id/resolver')
  resolver(@Param('id', ParseIntPipe) id: number, @Body() dto: ResolverDisputaDto, @Req() req: AuthenticatedRequest) {
    return this.disputasService.resolver(id, dto, req.user.id);
  }
}
