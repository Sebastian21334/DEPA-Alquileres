import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { CotizacionesService } from '../service/cotizaciones.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

export class HistorialCotizacionesDto {
  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  desde?: string;
  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  hasta?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100000) pagina = 1;
}
@Controller('cotizaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Administrador')
export class CotizacionesController {
  constructor(private readonly cotizaciones: CotizacionesService) {}
  @Get('administracion')
  listar(
    @Query(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: HistorialCotizacionesDto,
  ) {
    if (dto.desde && dto.hasta && dto.desde > dto.hasta)
      throw new BadRequestException('El rango de fechas no es válido');
    return this.cotizaciones.administracion(
      dto.desde ? new Date(`${dto.desde}T00:00:00-03:00`) : undefined,
      dto.hasta
        ? new Date(new Date(`${dto.hasta}T00:00:00-03:00`).getTime() + 86400000)
        : undefined,
      dto.pagina,
    );
  }
  @Post('administracion/verificar')
  async verificar() {
    await this.cotizaciones.actualizarSiCorresponde();
    return this.cotizaciones.administracion(undefined, undefined, 1);
  }
}
