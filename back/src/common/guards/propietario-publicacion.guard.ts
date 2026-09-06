import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';
import { Fecha } from '../../disponibilidad/entity/fecha.entity';

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
  constructor(
    @InjectRepository(Publicacion)
    private readonly publicacionRepository: Repository<Publicacion>,
    @InjectRepository(Fecha)
    private readonly fechaRepository: Repository<Fecha>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Sacamos el request "crudo" de Express desde el ExecutionContext
    const req = context.switchToHttp().getRequest();

    // req.user lo dejó seteado JwtAuthGuard al validar el token
    const usuarioId = req.user.id;

    let idPublicacion: number;

    // Este guard se reutiliza en varios endpoints (crear/actualizar/eliminar),
    // y cada uno trae el dato de la publicación de un lugar distinto:
    if (req.body?.id_publicacion) {
      // Caso POST /disponibilidad -> el id de publicación viene directo en el body
      idPublicacion = req.body.id_publicacion;
    } else if (req.params?.id) {
      // Caso PATCH/DELETE /disponibilidad/:id -> solo tenemos el id de la Fecha,
      // hay que buscarla para saber a qué publicación pertenece
      const fecha = await this.fechaRepository.findOne({
        where: { id: +req.params.id },
        relations: { publicacion: true },
      });
      if (!fecha) throw new NotFoundException('Fecha no encontrada');
      idPublicacion = fecha.publicacion.id;
    } else {
      // Si no vino ninguno de los dos, no hay forma de saber qué publicación validar
      throw new ForbiddenException('No se pudo determinar la publicación');
    }

    // Traemos la publicación junto con su anunciante y el usuario dueño de ese anunciante,
    // para poder comparar contra el usuario logueado
    const publicacion = await this.publicacionRepository.findOne({
      where: { id: idPublicacion },
      relations: { anunciante: { usuario: true } },
    });

    if (!publicacion) throw new NotFoundException('Publicación no encontrada');

    // El check de autorización en sí: el dueño real (anunciante.usuario.id)
    // tiene que coincidir con el usuario que mandó la request (usuarioId)
    if (publicacion.anunciante.usuario.id !== usuarioId) {
      throw new ForbiddenException('No sos el propietario de esta publicación');
    }

    // Si llegó hasta acá, está todo validado: se permite continuar hacia el controller
    return true;
  }
}