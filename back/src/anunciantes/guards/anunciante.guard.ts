import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import type { Anunciante } from '../entity/anunciante.entity';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AnunciantesService } from '../service/anunciantes.service';

/** Disponible después de JwtAuthGuard y AnuncianteGuard. */
export type AnuncianteRequest = AuthenticatedRequest & {
  anunciante: Anunciante;
};

@Injectable()
export class AnuncianteGuard implements CanActivate {
  constructor(private readonly anunciantesService: AnunciantesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Este guard se ejecuta después de JwtAuthGuard, por eso req.user ya existe.
    const req = context.switchToHttp().getRequest<AnuncianteRequest>();
    const idUsuario = req.user.id;

    const anunciante =
      await this.anunciantesService.buscarPorUsuario(idUsuario);
    if (!anunciante || !anunciante.verificado) {
      throw new ForbiddenException(
        'Debe ser un anunciante verificado para realizar esta acción',
      );
    }

    // El controller recibe el anunciante ya cargado y evita repetir esta consulta.
    req.anunciante = anunciante;
    return true;
  }
}
