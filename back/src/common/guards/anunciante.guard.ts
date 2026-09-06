import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AnunciantesService } from '../../anunciantes/service/anunciantes.service';

@Injectable()
export class AnuncianteGuard implements CanActivate {
  constructor(private readonly anunciantesService: AnunciantesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Este guard se ejecuta después de JwtAuthGuard, por eso req.user ya existe.
    const req = context.switchToHttp().getRequest();
    const idUsuario = req.user.id;

    const anunciante = await this.anunciantesService.buscarPorUsuario(idUsuario);
    if (!anunciante || !anunciante.verificado) {
      throw new ForbiddenException('Debe ser un anunciante verificado para realizar esta acción');
    }

    // El controller recibe el anunciante ya cargado y evita repetir esta consulta.
    req.anunciante = anunciante;
    return true;
  }
}