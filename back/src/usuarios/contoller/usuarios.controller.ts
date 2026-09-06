import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UsuariosService } from '../service/usuarios.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CambiarRolDto } from '../dto/cambiar-rol.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Patch(':id/rol')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  // Solo administradores pueden cambiar el rol persistido de otro usuario.
  async cambiarRol(@Param('id') id: number, @Body() dto: CambiarRolDto) {
    return this.usuariosService.cambiarRol(id, dto.nombreRol);
  }
}