import { Controller, Delete, Get, Patch, Param, Body, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
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
  async cambiarRol(@Param('id') id: number, @Body() dto: CambiarRolDto) {
    return this.usuariosService.cambiarRol(id, dto.nombreRol);
  }
}