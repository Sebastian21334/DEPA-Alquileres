import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
  NotFoundException,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AnunciantesService } from '../service/anunciantes.service';
import { SolicitarAnuncianteDto } from '../dto/solicitar-anunciante.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';
import { RechazarVerificacionDto } from '../dto/rechazar-verificacion.dto';

const TIPOS_DOCUMENTO = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

const DOCUMENTOS_INTERCEPTOR = FileFieldsInterceptor(
  [
    { name: 'dni_frente', maxCount: 1 },
    { name: 'dni_dorso', maxCount: 1 },
    { name: 'rostro', maxCount: 1 },
  ],
  {
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
      if (!TIPOS_DOCUMENTO.includes(file.mimetype)) {
        return callback(new BadRequestException('Formato de documento no permitido'), false);
      }
      callback(null, true);
    },
  },
);

@Controller('anunciantes')
export class AnunciantesController {
  constructor(private readonly anunciantesService: AnunciantesService) {}

  @Post('solicitar')
  @UseGuards(JwtAuthGuard)
  // La solicitud queda vinculada al usuario del JWT.
  async solicitarAlta(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SolicitarAnuncianteDto,
  ) {
    return this.anunciantesService.solicitarAlta(req.user.id, dto);
  }

  @Post('mi-solicitud/documentos')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(DOCUMENTOS_INTERCEPTOR)
  async subirDocumentos(
    @Req() req: AuthenticatedRequest,
    @UploadedFiles() archivos: any,
  ) {
    return this.anunciantesService.subirDocumentos(req.user.id, archivos);
  }

  @Post('mi-solicitud/reenviar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(DOCUMENTOS_INTERCEPTOR)
  async reenviarDocumentos(
    @Req() req: AuthenticatedRequest,
    @UploadedFiles() archivos: any,
  ) {
    return this.anunciantesService.subirDocumentos(req.user.id, archivos, true);
  }

  @Get('pendientes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  // Solo un administrador puede revisar solicitudes de terceros.
  async getPendientes() {
    return this.anunciantesService.getPendientes();
  }

  @Get('mi-solicitud')
  @UseGuards(JwtAuthGuard)
  async miSolicitud(@Req() req: AuthenticatedRequest) {
    // La ausencia se transforma en un mensaje claro para el usuario.
    const solicitud = await this.anunciantesService.buscarSolicitudConHistorial(req.user.id);
    if (!solicitud) throw new NotFoundException('No solicitaste ser anunciante todavía');
    return solicitud;
  }

  @Patch(':id/aprobar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  async aprobar(@Param('id', ParseIntPipe) id: number) {
    return this.anunciantesService.aprobar(id);
  }

  @Delete(':id/rechazar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  async rechazar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RechazarVerificacionDto,
  ) {
    return this.anunciantesService.rechazar(id, dto);
  }

  
}