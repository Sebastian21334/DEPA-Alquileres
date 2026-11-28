import { Inject, Injectable } from '@nestjs/common';
import { ejecutarEnSegundoPlano } from '../../common/utils/segundo-plano';
import { MAIL_SERVICE, type IMailCuenta } from '../../mail/mail.interface';
import { UsuariosService } from '../../usuarios/service/usuarios.service';

@Injectable()
export class BloqueoAnuncianteService {
  constructor(private readonly usuarios: UsuariosService, @Inject(MAIL_SERVICE) private readonly mail: IMailCuenta) {}

  async cambiarBloqueo(idUsuario: number, bloqueado: boolean, idOperador: number, motivo?: string) {
    const motivoNormalizado = motivo?.trim();
    const { usuario, cambio } = await this.usuarios.cambiarBloqueoAdministrativo(idUsuario, bloqueado, idOperador, motivoNormalizado);
    const accesoLimitado = bloqueado && usuario.bloqueoDetalle?.accesoLimitado === true;

    const { email } = usuario;
    if (cambio && email) {
      ejecutarEnSegundoPlano(
        () => this.mail.enviarCambioBloqueo(email, bloqueado, motivoNormalizado, accesoLimitado),
        `No se pudo notificar el cambio de acceso del usuario ${idUsuario}`,
      );
    }

    return {
      accesoLimitado,
      mensaje: accesoLimitado
        ? 'Usuario bloqueado con acceso a sus operaciones pendientes'
        : bloqueado ? 'Usuario bloqueado correctamente' : 'Usuario habilitado correctamente',
    };
  }
}
