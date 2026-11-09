import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import { ReembolsosService } from '../service/reembolsos.service';
import { ReservaConsultaService } from '../../reservas/service/reserva-consulta.service';

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
}
