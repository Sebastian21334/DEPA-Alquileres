import { Body, Controller, Get, Header, Param, ParseIntPipe, Patch, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ComprobanteInterceptor } from '../../almacenamiento/comprobante.interceptor';
import { JwtAuthGuard, PermitirAccesoLimitado, type AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import { RegistrarTransferenciaDto } from '../dto/registrar-transferencia.dto';
import { ResolverLiquidacionDto } from '../dto/resolver-liquidacion.dto';
import { OperacionesLiquidacionService } from '../service/operaciones-liquidacion.service';

@Controller('reservas')
export class LiquidacionesReservaController {
  constructor(private readonly liquidacionesService: OperacionesLiquidacionService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Get('liquidaciones/administracion')
  listarLiquidacionesAdministracion() {
    return this.liquidacionesService.listarLiquidacionesAdministracion();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Get('liquidaciones/administracion/historial')
  listarPagosRegistrados() {
    return this.liquidacionesService.listarPagosRegistrados();
  }

  /** Historial del panel del anunciante: pagos de todas sus publicaciones (T55). */
  @UseGuards(JwtAuthGuard)
  @PermitirAccesoLimitado()
  @Get('liquidaciones/mias')
  listarMisPagos(@Req() req: AuthenticatedRequest) {
    return this.liquidacionesService.listarPagosDelAnunciante(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @PermitirAccesoLimitado()
  @Get('liquidaciones/publicacion/:id')
  listarPagosDelAnunciante(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.liquidacionesService.listarPagosDelAnunciante(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Get(':id/liquidacion/cbu')
  @Header('Cache-Control', 'no-store')
  consultarCbuParaPago(@Param('id', ParseIntPipe) id: number) {
    return this.liquidacionesService.consultarCbuParaPago(id);
  }

  /** T56: multipart con el comprobante obligatorio (`comprobante`), la referencia y la observación opcionales. */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Patch(':id/liquidacion/pago')
  @UseInterceptors(ComprobanteInterceptor())
  registrarPagoAnunciante(@Param('id', ParseIntPipe) id: number, @Body() dto: RegistrarTransferenciaDto, @UploadedFile() comprobante: Express.Multer.File | undefined, @Req() req: AuthenticatedRequest) {
    return this.liquidacionesService.registrarPagoAnunciante(id, dto, comprobante, req.user.id);
  }

  /** T56: enlace firmado del comprobante; lo ven el admin y el anunciante de la reserva. */
  @UseGuards(JwtAuthGuard)
  @PermitirAccesoLimitado()
  @Get(':id/liquidacion/pagos/:indice/comprobante')
  @Header('Cache-Control', 'no-store')
  urlComprobantePago(@Param('id', ParseIntPipe) id: number, @Param('indice', ParseIntPipe) indice: number, @Req() req: AuthenticatedRequest) {
    return this.liquidacionesService.urlComprobantePago(id, indice, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Patch(':id/liquidacion')
  resolverLiquidacion(@Param('id', ParseIntPipe) id: number, @Body() dto: ResolverLiquidacionDto, @Req() req: AuthenticatedRequest) {
    return this.liquidacionesService.resolverLiquidacion(id, dto, req.user.id);
  }
}
