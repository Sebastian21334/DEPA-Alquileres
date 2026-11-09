import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { ReservaCancelacionesService } from '../../reservas/service/reserva-cancelaciones.service';
import { ReservaConsultaService } from '../../reservas/service/reserva-consulta.service';
import { RegistrarReembolsoManualDto } from '../dto/registrar-reembolso-manual.dto';

/**
 * Caso de uso que cruza reembolsos con reservas. Vive en un módulo de
 * composición para que ninguno de los dos dominios dependa del otro.
 */
@Controller('reservas/reembolsos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Administrador')
export class ReembolsosAplicacionController {
  constructor(
    private readonly cancelaciones: ReservaCancelacionesService,
    private readonly consulta: ReservaConsultaService,
  ) {}

  @Patch(':id/manual')
  async registrarManual(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegistrarReembolsoManualDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const resultado = await this.cancelaciones.registrarReembolsoManual(
      id,
      dto.referencia,
      req.user.id,
    );
    return {
      ...resultado,
      reembolso: {
        ...resultado.reembolso,
        reserva: this.consulta.paraRespuesta(resultado.reembolso.reserva),
      },
      reserva: this.consulta.paraRespuesta(resultado.reserva),
    };
  }
}
