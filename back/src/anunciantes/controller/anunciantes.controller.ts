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
import { VerificacionFacialService } from '../service/verificacion-facial.service';

const TIPOS_DOCUMENTO = [
  // Las tres fotos proceden de la captura de cámara del flujo de identidad.
  'image/jpeg',
];

const DOCUMENTOS_INTERCEPTOR = FileFieldsInterceptor(
  [
    // Cada campo representa un documento obligatorio y acepta un solo archivo.
    { name: 'dni_frente', maxCount: 1 },
    { name: 'dni_dorso', maxCount: 1 },
    { name: 'rostro', maxCount: 1 },
  ],
  {
    // Multer limita el archivo antes de entregarlo al servicio.
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
      // El MIME se valida temprano para no almacenar formatos no soportados.
      if (!TIPOS_DOCUMENTO.includes(file.mimetype)) {
        return callback(new BadRequestException('Formato de documento no permitido'), false);
      }
      callback(null, true);
    },
  },
);

const EVIDENCIAS_VITALIDAD_INTERCEPTOR = FileFieldsInterceptor(
  [
    { name: 'neutralPhoto', maxCount: 1 },
    { name: 'action0', maxCount: 1 },
    { name: 'action1', maxCount: 1 },
    { name: 'action2', maxCount: 1 },
    { name: 'livePhoto', maxCount: 1 },
  ],
  {
    limits: { fileSize: 5 * 1024 * 1024, files: 5 },
    fileFilter: (_req, file, callback) => {
      if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
        return callback(new BadRequestException('Las evidencias faciales deben ser imágenes JPG o PNG'), false);
      }
      callback(null, true);
    },
  },
);

@Controller('anunciantes')
export class AnunciantesController {
  constructor(
    private readonly anunciantesService: AnunciantesService,
    private readonly verificacionFacialService: VerificacionFacialService,
  ) {}

  @Get('verificacion-facial/desafio')
  @UseGuards(JwtAuthGuard)
  crearDesafioFacial(@Req() req: AuthenticatedRequest) {
    return this.verificacionFacialService.crearDesafio(req.user.id);
  }

  @Post('verificacion-facial/desafio/cambiar')
  @UseGuards(JwtAuthGuard)
  cambiarDesafioFacial(
    @Req() req: AuthenticatedRequest,
    @Body('challengeToken') challengeToken: string,
  ) {
    return this.verificacionFacialService.cambiarDesafio(req.user.id, challengeToken);
  }

  @Post('verificacion-facial/validar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(EVIDENCIAS_VITALIDAD_INTERCEPTOR)
  validarVitalidad(
    @Req() req: AuthenticatedRequest,
    @Body('challengeToken') challengeToken: string,
    @UploadedFiles() archivos: any,
  ) {
    return this.verificacionFacialService.validarVitalidad(
      req.user.id,
      challengeToken,
      archivos,
    );
  }

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
    @Body('verificationToken') verificationToken: string,
    @UploadedFiles() archivos: any,
  ) {
    // El usuario autenticado se obtiene del JWT; nunca se recibe un ID manipulable.
    return this.anunciantesService.subirDocumentos(
      req.user.id,
      archivos,
      verificationToken,
    );
  }

  @Post('mi-solicitud/reenviar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(DOCUMENTOS_INTERCEPTOR)
  async reenviarDocumentos(
    @Req() req: AuthenticatedRequest,
    @Body('verificationToken') verificationToken: string,
    @UploadedFiles() archivos: any,
  ) {
    // El servicio solo permite este endpoint si la solicitud anterior fue rechazada.
    return this.anunciantesService.subirDocumentos(
      req.user.id,
      archivos,
      verificationToken,
      true,
    );
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
    // No tener solicitud es un estado normal del perfil, no un recurso que la
    // interfaz deba tratar como error. Responder 200 evita el 404 transitorio
    // que se veía al cargar navbar, guards y perfil en paralelo.
    return this.anunciantesService.buscarSolicitudConHistorial(req.user.id);
  }

  @Patch(':id/aprobar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  async aprobar(@Param('id', ParseIntPipe) id: number) {
    // La aprobación cambia verificado y habilita la creación de publicaciones.
    return this.anunciantesService.aprobar(id);
  }

  @Delete(':id/rechazar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  async rechazar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RechazarVerificacionDto,
  ) {
    // El motivo se valida mediante DTO y queda guardado en el historial.
    return this.anunciantesService.rechazar(id, dto);
  }

  
}
