import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import { ReclamosService } from '../service/reclamos.service';
import { ReservaConsultaService } from '../../reservas/service/reserva-consulta.service';
import type { Reclamo } from '../entity/reclamo.entity';
import { CrearReclamoDto } from '../dto/crear-reclamo.dto';
import { EnviarMensajeReclamoDto } from '../dto/enviar-mensaje-reclamo.dto';
import { ResolverReclamoDto } from '../dto/resolver-reclamo.dto';

const EVIDENCIAS_INTERCEPTOR = FilesInterceptor('evidencias', 5, {
  limits: { fileSize: 5 * 1024 * 1024 },
});

@Controller('reclamos')
@UseGuards(JwtAuthGuard)
export class ReclamosController {
  constructor(
    private readonly reclamosService: ReclamosService,
    private readonly consulta: ReservaConsultaService,
  ) {}

  private conReserva(reclamo: Reclamo) {
    return {
      ...reclamo,
      reserva: this.consulta.paraRespuesta(reclamo.reserva),
    };
  }

  @Post()
  async crear(
    @Body() dto: CrearReclamoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.conReserva(await this.reclamosService.crear(dto, req.user.id));
  }

  @Get('mios')
  async listarMios(@Req() req: AuthenticatedRequest) {
    const reclamos = await this.reclamosService.listarMios(req.user.id);
    return reclamos.map((reclamo) => this.conReserva(reclamo));
  }

  @UseGuards(RolesGuard)
  @Roles('Administrador')
  @Get('administracion')
  async listarAdministracion() {
    const reclamos = await this.reclamosService.listarAdministracion();
    return reclamos.map((reclamo) => this.conReserva(reclamo));
  }

  @Get(':id')
  async obtener(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.conReserva(
      await this.reclamosService.obtener(
        id,
        req.user.id,
        req.user.rol === 'Administrador',
      ),
    );
  }

  @Post(':id/evidencias')
  @UseInterceptors(EVIDENCIAS_INTERCEPTOR)
  subirEvidencias(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() archivos: Express.Multer.File[],
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reclamosService.subirEvidencias(
      id,
      req.user.id,
      req.user.rol === 'Administrador',
      archivos,
    );
  }

  @Get(':id/evidencias/:idEvidencia/url')
  urlEvidencia(
    @Param('id', ParseIntPipe) id: number,
    @Param('idEvidencia', ParseIntPipe) idEvidencia: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reclamosService.urlEvidencia(
      id,
      idEvidencia,
      req.user.id,
      req.user.rol === 'Administrador',
    );
  }

  @Get(':id/mensajes')
  listarMensajes(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reclamosService.listarMensajes(
      id,
      req.user.id,
      req.user.rol === 'Administrador',
    );
  }

  @Post(':id/mensajes')
  enviarMensaje(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EnviarMensajeReclamoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reclamosService.enviarMensaje(
      id,
      dto,
      req.user.id,
      req.user.rol === 'Administrador',
    );
  }

  @UseGuards(RolesGuard)
  @Roles('Administrador')
  @Patch(':id/resolver')
  async resolver(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResolverReclamoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.conReserva(
      await this.reclamosService.resolver(id, dto, req.user.id),
    );
  }
}
