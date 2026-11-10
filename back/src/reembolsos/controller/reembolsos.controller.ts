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
import { ReembolsosService } from '../service/reembolsos.service';
import { ReservaConsultaService } from '../../reservas/service/reserva-consulta.service';
import { CancelarReembolsoDto } from '../dto/cancelar-reembolso.dto';
import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';

@Controller('reembolsos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Administrador')
export class ReembolsosController {
  constructor(
    private readonly reembolsosService: ReembolsosService,
    private readonly consulta: ReservaConsultaService,
  ) {}

  @Get('administracion')
  async listar() {
    const reembolsos = await this.reembolsosService.listarAdministracion();
    return reembolsos.map((reembolso) => ({
      ...reembolso,
      reserva: this.consulta.paraRespuesta(reembolso.reserva),
    }));
  }

  @Patch(':id/cancelar')
  async cancelar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelarReembolsoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const reembolso = await this.reembolsosService.cancelar(
      id,
      dto.motivo,
      req.user.id,
    );
    return {
      ...reembolso,
      reserva: this.consulta.paraRespuesta(reembolso.reserva),
    };
  }
}
