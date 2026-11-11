import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { HistorialCotizacionesDto } from '../dto/historial-cotizaciones.dto';
import { CotizacionesService } from '../service/cotizaciones.service';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { Roles } from '../../seguridad/decorators/roles.decorator';

@Controller('cotizaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Administrador')
export class CotizacionesController {
  constructor(private readonly cotizaciones: CotizacionesService) {}
  @Get('administracion')
  listar(@Query(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true, }),) dto: HistorialCotizacionesDto) {
    return this.cotizaciones.administracion(dto);
  }
  @Post('administracion/verificar')
  verificar() {
    return this.cotizaciones.verificarAdministracion();
  }
}
