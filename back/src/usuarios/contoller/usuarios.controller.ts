import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { ArchivoSubido } from '../../common/interfaces/archivo-subido.interface';

const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
import { UsuariosService } from '../service/usuarios.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CambiarRolDto } from '../dto/cambiar-rol.dto';
import { ActualizarUsuarioDto } from '../dto/actualizar-usuario.dto';
import type { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  listarTodos() {
    return this.usuariosService.listarTodos();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  // Perfil propio: el id sale del JWT, así un usuario solo puede leer sus datos.
  obtenerPerfil(@Req() req: AuthenticatedRequest) {
    return this.usuariosService.obtenerPerfil(req.user.id);
  }

  @Post('me/foto')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('foto', {
      // Límite del original; Sharp lo reduce a un JPEG de 400x400.
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!TIPOS_FOTO.includes(file.mimetype)) {
          return callback(new BadRequestException('Solo se permiten imágenes (JPEG, PNG, WEBP, HEIC)'), false);
        }
        callback(null, true);
      },
    }),
  )
  // Cada usuario solo puede cambiar su propia foto: el id sale del JWT.
  subirFoto(@UploadedFile() archivo: ArchivoSubido, @Req() req: AuthenticatedRequest) {
    if (!archivo) throw new BadRequestException('No se envió ninguna imagen');
    return this.usuariosService.actualizarFoto(req.user.id, archivo);
  }

  @Delete('me/foto')
  @UseGuards(JwtAuthGuard)
  eliminarFoto(@Req() req: AuthenticatedRequest) {
    return this.usuariosService.eliminarFoto(req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  actualizarDatosPersonales(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usuariosService.actualizarDatosPersonales(id, dto, req.user.id, req.user.rol);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  eliminar(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.usuariosService.eliminar(id, req.user.id);
  }

  @Patch(':id/bloquear')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  bloquear(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.usuariosService.cambiarBloqueo(id, true, req.user.id);
  }

  @Patch(':id/habilitar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  habilitar(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.usuariosService.cambiarBloqueo(id, false, req.user.id);
  }

  @Patch(':id/rol')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  // Solo administradores pueden cambiar el rol persistido de otro usuario.
  async cambiarRol(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarRolDto) {
    return this.usuariosService.cambiarRol(id, dto.nombreRol);
  }
}