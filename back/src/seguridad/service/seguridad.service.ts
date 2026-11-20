import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../../usuarios/service/usuarios.service';

@Injectable()
export class SeguridadService {
  constructor(private readonly usuariosService: UsuariosService) {}

  async validarSesion(idUsuario: unknown, versionSesion?: unknown) {
    if (
      typeof idUsuario !== 'number' ||
      !Number.isInteger(idUsuario) ||
      idUsuario < 1 ||
      idUsuario > 2_147_483_647
    ) {
      throw new UnauthorizedException('Identificador de sesión inválido');
    }

    const usuario = await this.usuariosService.buscarParaSesion(idUsuario);
    if (!usuario || !usuario.activa || usuario.bloqueado) {
      throw new UnauthorizedException('La cuenta no está habilitada');
    }
    if (usuario.version_sesion && usuario.version_sesion !== versionSesion) {
      throw new UnauthorizedException('La sesión ya no está habilitada');
    }

    return { id: usuario.id, email: usuario.email, rol: usuario.rol?.nombre };
  }
}
