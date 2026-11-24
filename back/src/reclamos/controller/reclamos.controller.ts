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
import { JwtAuthGuard, PermitirAccesoLimitado } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import { MAX_BYTES_IMAGEN, MAX_IMAGENES_POR_ENVIO, ReclamosService } from '../service/reclamos.service';
import { CrearReclamoDto } from '../dto/crear-reclamo.dto';
import { EnviarMensajeReclamoDto } from '../dto/enviar-mensaje-reclamo.dto';
import { ResolverReclamoDto } from '../dto/resolver-reclamo.dto';
import { ReclamarFaltanteCancelacionDto } from '../dto/reclamo-faltante-cancelacion.dto';

// Mismo límite al crear el reclamo y en cada mensaje del chat; el servicio controla el total del reclamo.
const EVIDENCIAS_INTERCEPTOR = FilesInterceptor('evidencias', MAX_IMAGENES_POR_ENVIO, {
  limits: { fileSize: MAX_BYTES_IMAGEN },
});

@Controller('reclamos')
@UseGuards(JwtAuthGuard)
export class ReclamosController {
  constructor(private readonly reclamosService: ReclamosService) {}

  @PermitirAccesoLimitado()
  @Get('demoras/mias')
  listarDemoras(@Req() req: AuthenticatedRequest) {
    return this.reclamosService.listarDemorasMias(req.user.id);
  }

  @PermitirAccesoLimitado()
  @Get('cancelacion/:idReserva')
  consultarFaltante(@Param('idReserva', ParseIntPipe) idReserva: number, @Req() req: AuthenticatedRequest) {
    return this.reclamosService.consultarFaltanteCancelacion(idReserva, req.user.id);
  }

  @PermitirAccesoLimitado()
  @Post('cancelacion/:idReserva')
  reclamarFaltante(@Param('idReserva', ParseIntPipe) idReserva: number, @Body() dto: ReclamarFaltanteCancelacionDto, @Req() req: AuthenticatedRequest) {
    return this.reclamosService.reclamarFaltanteCancelacion(idReserva, dto, req.user.id);
  }

  @PermitirAccesoLimitado()
  @Post()
  crear(@Body() dto: CrearReclamoDto, @Req() req: AuthenticatedRequest) {
    return this.reclamosService.crear(dto, req.user.id);
  }

  @PermitirAccesoLimitado()
  @Get('mios')
  listarMios(@Req() req: AuthenticatedRequest) {
    return this.reclamosService.listarMios(req.user.id);
  }

  @UseGuards(RolesGuard)
  @Roles('Administrador')
  @Get('administracion')
  listarAdministracion() {
    return this.reclamosService.listarAdministracion();
  }

  @PermitirAccesoLimitado()
  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.reclamosService.obtener(
      id,
      req.user.id,
      req.user.rol === 'Administrador',
    );
  }

  @PermitirAccesoLimitado()
  @Post(':id/evidencias')
  @UseInterceptors(EVIDENCIAS_INTERCEPTOR)
  subirEvidencias(@Param('id', ParseIntPipe) id: number, @UploadedFiles() archivos: Express.Multer.File[], @Req() req: AuthenticatedRequest) {
    return this.reclamosService.subirEvidencias(
      id,
      req.user.id,
      req.user.rol === 'Administrador',
      archivos,
    );
  }

  @PermitirAccesoLimitado()
  @Get(':id/mensajes')
  listarMensajes(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.reclamosService.listarMensajes(
      id,
      req.user.id,
      req.user.rol === 'Administrador',
    );
  }

  /** JSON con solo texto, o multipart con texto opcional e imágenes en `evidencias`. */
  @PermitirAccesoLimitado()
  @Post(':id/mensajes')
  @UseInterceptors(EVIDENCIAS_INTERCEPTOR)
  enviarMensaje(@Param('id', ParseIntPipe) id: number, @Body() dto: EnviarMensajeReclamoDto, @UploadedFiles() archivos: Express.Multer.File[] | undefined, @Req() req: AuthenticatedRequest) {
    return this.reclamosService.enviarMensaje(
      id,
      dto,
      req.user.id,
      req.user.rol === 'Administrador',
      archivos ?? [],
    );
  }

  @UseGuards(RolesGuard)
  @Roles('Administrador')
  @Patch(':id/resolver')
  resolver(@Param('id', ParseIntPipe) id: number, @Body() dto: ResolverReclamoDto, @Req() req: AuthenticatedRequest) {
    return this.reclamosService.resolver(id, dto, req.user.id);
  }
}
