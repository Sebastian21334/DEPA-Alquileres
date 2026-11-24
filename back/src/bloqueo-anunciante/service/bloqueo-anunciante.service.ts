import { Inject, Injectable, Logger } from '@nestjs/common';
import { MAIL_SERVICE, type IMailCuenta } from '../../mail/mail.interface';
import { UsuariosService } from '../../usuarios/service/usuarios.service';

@Injectable()
export class BloqueoAnuncianteService {
  private readonly logger = new Logger(BloqueoAnuncianteService.name);
  constructor(private readonly usuarios: UsuariosService, @Inject(MAIL_SERVICE) private readonly mail: IMailCuenta) {}

  async cambiarBloqueo(idUsuario: number, bloqueado: boolean, idOperador: number, motivo?: string) {
    const motivoNormalizado = motivo?.trim();
    const { usuario, cambio } = await this.usuarios.cambiarBloqueoAdministrativo(idUsuario, bloqueado, idOperador, motivoNormalizado);
    const accesoLimitado = bloqueado && usuario.bloqueoDetalle?.accesoLimitado === true;

    if (cambio && usuario.email) {
      try {
        await this.mail.enviarCambioBloqueo(usuario.email, bloqueado, motivoNormalizado, accesoLimitado);
      } catch (error) {
        this.logger.error(`No se pudo notificar el cambio de acceso del usuario ${idUsuario}`, error as Error);
      }
    }

    return {
      accesoLimitado,
      mensaje: accesoLimitado
        ? 'Usuario bloqueado con acceso a sus operaciones pendientes'
        : bloqueado ? 'Usuario bloqueado correctamente' : 'Usuario habilitado correctamente',
    };
  }
}
