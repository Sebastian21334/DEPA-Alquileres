import { ROL } from '../../catalogos/codigos-catalogo';
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Header,
  Headers,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ListarAdministracionDto } from '../../common/dto/listar-administracion.dto';
import { FileInterceptor } from '@nestjs/platform-express';

const TIPOS_FOTO = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];
import { UsuariosService } from '../service/usuarios.service';
import { JwtAuthGuard, PermitirAccesoLimitado } from '../../seguridad/guards/jwt-auth.guard';
import { RolesGuard } from '../../seguridad/guards/roles.guard';
import { Roles } from '../../seguridad/decorators/roles.decorator';
import { CambiarPausaActividadesDto } from '../dto/cambiar-pausa-actividades.dto';
import { ConfirmarBajaDto } from '../dto/confirmar-baja.dto';
import { ActualizarUsuarioDto } from '../dto/actualizar-usuario.dto';
import { ResponderApelacionDto } from '../dto/responder-apelacion.dto';
import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  listarTodos() {
    return this.usuariosService.listarTodos();
  }

  @Get('administracion')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  listarAdministracion(@Query(new ValidationPipe({ transform: true })) consulta: ListarAdministracionDto) {
    return this.usuariosService.listarAdministracion(consulta);
  }

  @Get('administracion/bloqueados')
  @Header('Cache-Control', 'no-store')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  listarBloqueados() {
    return this.usuariosService.listarBloqueados();
  }

  @Get('administracion/historial-bloqueos')
  @Header('Cache-Control', 'no-store')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  listarHistorialBloqueos() {
    return this.usuariosService.listarHistorialBloqueos();
  }

  @Get('administracion/:id')
  @Header('Cache-Control', 'no-store')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  obtenerPerfilAdministracion(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.obtenerPerfil(id);
  }

  @Post(':id/bloqueo/responder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  responderApelacion(@Param('id', ParseIntPipe) id: number, @Body(new ValidationPipe({ transform: true })) dto: ResponderApelacionDto, @Req() req: AuthenticatedRequest) {
    return this.usuariosService.responderApelacion(id, dto.bloqueoId, req.user.id, dto.texto);
  }

  @Post(':id/bloqueo/mensajes')
  @Header('Cache-Control', 'no-store')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  @UseInterceptors(FileInterceptor('imagen', { limits: { fileSize: 5 * 1024 * 1024, files: 1 } }))
  enviarMensajeApelacion(@Param('id', ParseIntPipe) id: number, @Body(new ValidationPipe({ transform: true })) dto: ResponderApelacionDto, @Req() req: AuthenticatedRequest, @UploadedFile() archivo?: Express.Multer.File) {
    return this.usuariosService.responderApelacion(id, dto.bloqueoId, req.user.id, dto.texto, archivo);
  }

  @PermitirAccesoLimitado()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  // Perfil propio: el id sale del JWT, así un usuario solo puede leer sus datos.
  obtenerPerfil(@Req() req: AuthenticatedRequest) {
    return this.usuariosService.obtenerPerfil(req.user.id);
  }

  @Patch('me/actividades')
  @UseGuards(JwtAuthGuard)
  cambiarPausaActividades(@Req() req: AuthenticatedRequest, @Body() dto: CambiarPausaActividadesDto) {
    return this.usuariosService.cambiarPausaActividades(req.user.id, dto.actividades_pausadas);
  }

  @Post('me/foto')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('foto', {
      // Límite del original; Sharp lo reduce a un JPEG de 400x400.
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!TIPOS_FOTO.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Solo se permiten imágenes (JPEG, PNG, WEBP, HEIC)',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  // Cada usuario solo puede cambiar su propia foto: el id sale del JWT.
  subirFoto(@UploadedFile() archivo: Express.Multer.File, @Req() req: AuthenticatedRequest) {
    if (!archivo) throw new BadRequestException('No se envió ninguna imagen');
    return this.usuariosService.actualizarFoto(req.user.id, archivo);
  }

  @Delete('me/foto')
  @UseGuards(JwtAuthGuard)
  eliminarFoto(@Req() req: AuthenticatedRequest) {
    return this.usuariosService.eliminarFoto(req.user.id);
  }

  @Post('me/baja')
  @Header('Cache-Control', 'no-store')
  @UseGuards(JwtAuthGuard)
  solicitarBajaPropia(@Req() req: AuthenticatedRequest, @Headers('origin') origen?: string) {
    return this.usuariosService.solicitarBajaPropia(req.user.id, origen);
  }

  @Post('baja/confirmar')
  @Header('Cache-Control', 'no-store')
  confirmarBajaPropia(@Body() dto: ConfirmarBajaDto) {
    return this.usuariosService.confirmarBajaPropia(dto.token);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  actualizarDatosPersonales(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarUsuarioDto, @Req() req: AuthenticatedRequest) {
    return this.usuariosService.actualizarDatosPersonales(
      id,
      dto,
      req.user.id,
      req.user.rol,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  eliminar(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.usuariosService.eliminar(id, req.user.id);
  }

}
