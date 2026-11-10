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
import { ReservaConsultaService } from '../../reservas/service/reserva-consulta.service';
import type { Disputa } from '../entity/disputa.entity';
import { ResolverDisputaDto } from '../dto/resolver-disputa.dto';

@Controller('disputas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Administrador')
export class DisputasController {
  constructor(
    private readonly disputasService: DisputasService,
    private readonly consulta: ReservaConsultaService,
  ) {}

  private conReserva(disputa: Disputa) {
    return {
      ...disputa,
      reserva: this.consulta.paraRespuesta(disputa.reserva),
    };
  }

  @Get('administracion')
  async listar() {
    const disputas = await this.disputasService.listarAdministracion();
    return disputas.map((disputa) => this.conReserva(disputa));
  }

  @Patch(':id/resolver')
  async resolver(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResolverDisputaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.conReserva(
      await this.disputasService.resolver(id, dto, req.user.id),
    );
  }

  @Patch(':id/cerrar')
  async cerrar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.conReserva(
      await this.disputasService.cerrar(id, req.user.id),
    );
  }
}
