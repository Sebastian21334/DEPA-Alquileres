import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import { ReembolsosService } from '../service/reembolsos.service';

@Controller('reembolsos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Administrador')
export class ReembolsosController {
  constructor(private readonly reembolsosService: ReembolsosService) {}

  @Get('administracion')
  listar() {
    return this.reembolsosService.listarAdministracion();
  }
}
