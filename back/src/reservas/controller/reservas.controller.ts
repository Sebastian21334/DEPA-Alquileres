import { ReservaLiquidacionesService } from '../service/reserva-liquidaciones.service';
import { ReservaCancelacionesService } from '../service/reserva-cancelaciones.service';
import { ReservaConsultaService } from '../service/reserva-consulta.service';
import type { SolicitudCancelacion } from '../entity/solicitud-cancelacion.entity';
import type { Reembolso } from '../../reembolsos/entity/reembolso.entity';
import { ReservaReprogramacionService } from '../service/reserva-reprogramacion.service';
import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
// reservas/controlador/reservas.controller.ts
import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReservasService } from '../service/reservas.service';
import { ActualizarFechasReservaDto } from '../dto/actualizar-fechas-reserva.dto';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import { ValidarCodigoAlojamientoDto } from '../dto/validar-codigo-alojamiento.dto';
import { ResolverLiquidacionDto } from '../dto/resolver-liquidacion.dto';
import { SolicitarCancelacionDto } from '../dto/solicitar-cancelacion.dto';
import { ResolverSolicitudCancelacionDto } from '../dto/resolver-solicitud-cancelacion.dto';

@Controller('reservas')
export class ReservasController {
  constructor(
    private readonly reservasService: ReservasService,
    private readonly liquidacionesService: ReservaLiquidacionesService,
    private readonly reprogramacionService: ReservaReprogramacionService,
    private readonly consulta: ReservaConsultaService,
    private readonly cancelaciones: ReservaCancelacionesService,
  ) {}

  private conSolicitud(solicitud: SolicitudCancelacion) {
    return {
      ...solicitud,
      reserva: this.consulta.paraRespuesta(solicitud.reserva),
    };
  }

  private conReembolso(reembolso: Reembolso) {
    return {
      ...reembolso,
      reserva: this.consulta.paraRespuesta(reembolso.reserva),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('mis-reservas')
  // Filtra el historial por el usuario autenticado.
  async listarPorUsuario(@Req() req: AuthenticatedRequest) {
    return this.consulta.paraRespuestas(
      await this.reservasService.listarPorUsuario(req.user.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('recibidas')
  async listarRecibidas(@Req() req: AuthenticatedRequest) {
    return this.consulta.paraRespuestas(
      await this.reservasService.listarRecibidasPorAnunciante(req.user.id),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Get('liquidaciones/administracion')
  async listarLiquidacionesAdministracion() {
    return this.consulta.paraRespuestasAdministracion(
      await this.liquidacionesService.listarLiquidacionesAdministracion(),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Get('cancelaciones/administracion')
  async listarSolicitudesCancelacion() {
    const solicitudes =
      await this.cancelaciones.listarSolicitudesCancelacion();
    return solicitudes.map((solicitud) => this.conSolicitud(solicitud));
  }

  @UseGuards(JwtAuthGuard)
  @Get('publicacion/:id')
  async listarPorPublicacion(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.consulta.paraRespuestas(
      await this.reservasService.listarPorPublicacion(id, req.user.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async buscarPorId(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.consulta.paraRespuesta(
      await this.reservasService.buscarPorId(id, req.user.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/codigo-alojamiento')
  consultarCodigo(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.liquidacionesService.consultarCodigoAlojamiento(
      id,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/validar-codigo')
  async validarCodigo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ValidarCodigoAlojamientoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.consulta.paraRespuesta(
      await this.liquidacionesService.validarCodigoAlojamiento(
        id,
        dto.codigo,
        req.user.id,
      ),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Patch(':id/liquidacion')
  async resolverLiquidacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResolverLiquidacionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.consulta.paraRespuesta(
      await this.liquidacionesService.resolverLiquidacion(id, dto, req.user.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancelar')
  async cancelar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.consulta.paraRespuesta(
      await this.reservasService.cancelar(id, req.user.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancelacion')
  async solicitarCancelacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SolicitarCancelacionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.conSolicitud(
      await this.cancelaciones.solicitarCancelacion(id, dto, req.user.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/cancelacion')
  async consultarSolicitudCancelacion(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const solicitud =
      await this.cancelaciones.consultarSolicitudCancelacion(id, req.user.id);
    return solicitud ? this.conSolicitud(solicitud) : null;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  @Patch(':id/cancelacion/:idSolicitud')
  async resolverSolicitudCancelacion(
    @Param('id', ParseIntPipe) id: number,
    @Param('idSolicitud', ParseIntPipe) idSolicitud: number,
    @Body() dto: ResolverSolicitudCancelacionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const resultado = await this.cancelaciones.resolverSolicitudCancelacion(
      id,
      idSolicitud,
      dto,
      req.user.id,
    );
    return {
      ...resultado,
      solicitud: this.conSolicitud(resultado.solicitud),
      reembolso: resultado.reembolso
        ? this.conReembolso(resultado.reembolso)
        : null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/reembolsos')
  async listarReembolsos(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const reembolsos = await this.cancelaciones.listarReembolsosReserva(
      id,
      req.user.id,
    );
    return reembolsos.map((reembolso) => this.conReembolso(reembolso));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/fechas')
  async actualizarFechas(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarFechasReservaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.consulta.paraRespuesta(
      await this.reprogramacionService.actualizarFechas(id, dto, req.user.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reprogramaciones/:idCambio/notificar')
  async reintentarAviso(
    @Param('id', ParseIntPipe) id: number,
    @Param('idCambio', ParseIntPipe) idCambio: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.consulta.paraRespuesta(
      await this.reprogramacionService.reintentarAvisoReprogramacion(
        id,
        idCambio,
        req.user.id,
      ),
    );
  }
}
