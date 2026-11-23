import { Body, Controller, Param, ParseIntPipe, Patch, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ComprobanteInterceptor } from '../../almacenamiento/comprobante.interceptor';
import { RegistrarReembolsoManualDto } from '../../reembolsos/dto/registrar-reembolso-manual.dto';
import { RegistrarTransferenciaDto } from '../dto/registrar-transferencia.dto';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import { JwtAuthGuard, type AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { OperacionesReembolsoService } from '../service/operaciones-reembolso.service';

@Controller('reservas/reembolsos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Administrador')
export class ReembolsosReservaController {
  constructor(private readonly operaciones: OperacionesReembolsoService) {}

  @Patch(':id/ejecutar')
  ejecutar(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.operaciones.ejecutar(id, req.user.id);
  }

  @Patch(':id/conciliar')
  recuperarConfirmacion(@Param('id', ParseIntPipe) id: number, @Body() dto: RegistrarReembolsoManualDto, @Req() req: AuthenticatedRequest) {
    return this.operaciones.recuperarConfirmacion(id, dto.referencia ?? '', req.user.id);
  }

  /** T44: multipart con el comprobante obligatorio (`comprobante`), la referencia y la observación opcionales. */
  @Patch(':id/transferencia')
  @UseInterceptors(ComprobanteInterceptor())
  registrarTransferencia(@Param('id', ParseIntPipe) id: number, @Body() dto: RegistrarTransferenciaDto, @UploadedFile() comprobante: Express.Multer.File | undefined, @Req() req: AuthenticatedRequest) {
    return this.operaciones.registrarTransferencia(id, dto, comprobante, req.user.id);
  }
}
