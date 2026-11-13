import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosConsultaService } from '../../usuarios-consulta/service/usuarios-consulta.service';

@Injectable()
export class SeguridadService {
  constructor(private readonly usuariosConsulta: UsuariosConsultaService) {}

  async validarSesion(idUsuario: unknown) {
    if (
      typeof idUsuario !== 'number' ||
      !Number.isInteger(idUsuario) ||
      idUsuario < 1 ||
      idUsuario > 2_147_483_647
    ) {
      throw new UnauthorizedException('Identificador de sesión inválido');
    }

    const usuario = await this.usuariosConsulta.buscarPorId(idUsuario);
    if (!usuario || !usuario.activa || usuario.bloqueado) {
      throw new UnauthorizedException('La cuenta no está habilitada');
    }

    return { id: usuario.id, email: usuario.email, rol: usuario.rol?.nombre };
  }
}
