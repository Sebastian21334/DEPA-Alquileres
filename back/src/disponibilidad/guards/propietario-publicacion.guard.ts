import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { DisponibilidadService } from '../service/disponibilidad.service';
import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';

/**
 * Guard de autorización a nivel de recurso (no de rol).
 * Responde la pregunta: "¿el usuario logueado es dueño de la publicación
 * sobre la que está operando?".
 *
 * Se ejecuta DESPUÉS de JwtAuthGuard (por eso puede confiar en req.user.id):
 *   @UseGuards(JwtAuthGuard, PropietarioPublicacionGuard)
 */
@Injectable()
export class PropietarioPublicacionGuard implements CanActivate {
  constructor(private readonly disponibilidadService: DisponibilidadService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    let idPublicacion: number | undefined;
    let idFecha: number | undefined;
    if (req.params?.idPublicacion) {
      idPublicacion = Number(req.params.idPublicacion);
    } else if (req.method === 'POST' && req.body?.id_publicacion != null) {
      idPublicacion = Number(req.body.id_publicacion);
    } else if (req.params?.id) {
      idFecha = Number(req.params.id);
    } else {
      throw new ForbiddenException('No se pudo determinar la publicación');
    }
    await this.disponibilidadService.validarPropiedad(req.user.id, {
      idPublicacion,
      idFecha,
    });
    return true;
  }
}
