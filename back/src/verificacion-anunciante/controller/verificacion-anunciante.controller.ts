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
import { VerificacionAnuncianteService } from '../service/verificacion-anunciante.service';
import { SolicitarAnuncianteDto } from '../dto/solicitar-anunciante.dto';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import { RechazarVerificacionDto } from '../dto/rechazar-verificacion.dto';
import { PruebaVidaService } from '../service/prueba-vida.service';
import { DatosInmobiliariaDto } from '../dto/datos-inmobiliaria.dto';
import { RevisarVerificacionDto } from '../dto/revisar-verificacion.dto';

const TIPOS_DOCUMENTO = [
  // Las tres fotos proceden de la captura de cámara del flujo de identidad.
  'image/jpeg',
  'image/png',
  'application/pdf',
];

const DOCUMENTOS_INTERCEPTOR = FileFieldsInterceptor(
  [
    // Cada campo representa un documento obligatorio y acepta un solo archivo.
    { name: 'dni_frente', maxCount: 1 },
    { name: 'dni_dorso', maxCount: 1 },
    { name: 'rostro', maxCount: 1 },
    { name: 'matricula', maxCount: 1 },
    { name: 'constancia_cuit', maxCount: 1 },
  ],
  {
    // Multer limita el archivo antes de entregarlo al servicio.
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
      // El MIME se valida temprano para no almacenar formatos no soportados.
      if (!TIPOS_DOCUMENTO.includes(file.mimetype)) {
        return callback(
          new BadRequestException('Formato de documento no permitido'),
          false,
        );
      }
      callback(null, true);
    },
  },
);

const EVIDENCIAS_VITALIDAD_INTERCEPTOR = FileFieldsInterceptor(
  [
    { name: 'neutralPhoto', maxCount: 1 },
    // Cada gesto se captura dos veces para tolerar el frame en el que el
    // movimiento todavía no llegó a su punto máximo.
    { name: 'action0', maxCount: 2 },
    { name: 'action1', maxCount: 2 },
    { name: 'action2', maxCount: 2 },
    { name: 'livePhoto', maxCount: 1 },
  ],
  {
    limits: { fileSize: 5 * 1024 * 1024, files: 8 },
    fileFilter: (_req, file, callback) => {
      if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
        return callback(
          new BadRequestException(
            'Las evidencias faciales deben ser imágenes JPG o PNG',
          ),
          false,
        );
      }
      callback(null, true);
    },
  },
);

@Controller('anunciantes')
export class VerificacionAnuncianteController {
  constructor(
    private readonly verificacionService: VerificacionAnuncianteService,
    private readonly pruebaVidaService: PruebaVidaService,
  ) {}

  @Get('verificacion-facial/desafio')
  @UseGuards(JwtAuthGuard)
  crearDesafioFacial(@Req() req: AuthenticatedRequest) {
    return this.pruebaVidaService.crearDesafio(req.user.id);
  }

  @Post('verificacion-facial/desafio/cambiar')
  @UseGuards(JwtAuthGuard)
  cambiarDesafioFacial(
    @Req() req: AuthenticatedRequest,
    @Body('challengeToken') challengeToken: string,
  ) {
    return this.pruebaVidaService.cambiarDesafio(req.user.id, challengeToken);
  }

  @Post('verificacion-facial/validar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(EVIDENCIAS_VITALIDAD_INTERCEPTOR)
  validarVitalidad(
    @Req() req: AuthenticatedRequest,
    @Body('challengeToken') challengeToken: string,
    @UploadedFiles()
    archivos: Record<string, Express.Multer.File[] | undefined> = {},
  ) {
    return this.pruebaVidaService.validarVitalidad(
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
    return this.verificacionService.solicitarAlta(req.user.id, dto);
  }

  @Patch('mi-solicitud/datos-inmobiliaria')
  @UseGuards(JwtAuthGuard)
  actualizarDatosInmobiliaria(
    @Req() req: AuthenticatedRequest,
    @Body() dto: DatosInmobiliariaDto,
  ) {
    return this.verificacionService.actualizarDatosInmobiliaria(
      req.user.id,
      dto,
    );
  }

  @Post('mi-solicitud/documentos')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(DOCUMENTOS_INTERCEPTOR)
  async subirDocumentos(
    @Req() req: AuthenticatedRequest,
    @Body('verificationToken') verificationToken: string,
    @UploadedFiles()
    archivos: Record<string, Express.Multer.File[] | undefined> = {},
  ) {
    // El usuario autenticado se obtiene del JWT; nunca se recibe un ID manipulable.
    return this.verificacionService.subirDocumentos(
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
    @UploadedFiles()
    archivos: Record<string, Express.Multer.File[] | undefined> = {},
  ) {
    // El servicio solo permite este endpoint si la solicitud anterior fue rechazada.
    return this.verificacionService.subirDocumentos(
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
    return this.verificacionService.getPendientes();
  }

  @Get('mi-solicitud')
  @UseGuards(JwtAuthGuard)
  async miSolicitud(@Req() req: AuthenticatedRequest) {
    // No tener solicitud es un estado normal del perfil, no un recurso que la
    // interfaz deba tratar como error. Responder 200 evita el 404 transitorio
    // que se veía al cargar navbar, guards y perfil en paralelo.
    return this.verificacionService.buscarSolicitudConHistorial(req.user.id);
  }

  @Patch(':id/aprobar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  async aprobar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
    @Body() dto: RevisarVerificacionDto,
  ) {
    // La aprobación cambia verificado y habilita la creación de publicaciones.
    return this.verificacionService.aprobar(id, req.user.id, dto);
  }

  @Delete(':id/rechazar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  async rechazar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RechazarVerificacionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    // El motivo se valida mediante DTO y queda guardado en el historial.
    return this.verificacionService.rechazar(id, req.user.id, dto);
  }
}
