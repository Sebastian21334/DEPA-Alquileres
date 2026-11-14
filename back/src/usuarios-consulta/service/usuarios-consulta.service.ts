import { Inject, Injectable } from '@nestjs/common';
import type { Usuario } from '../../usuarios/entity/usuario.entity';
import {
  USUARIOS_REPOSITORY,
  type IUsuariosRepository,
} from '../../usuarios/repository/usuarios.repository.interface';

@Injectable()
export class UsuariosConsultaService {
  constructor(@Inject(USUARIOS_REPOSITORY) private readonly usuariosRepo: IUsuariosRepository) {}

  buscarPorId(idUsuario: number): Promise<Usuario | null> {
    return this.usuariosRepo.buscarPorId(idUsuario);
  }
}
