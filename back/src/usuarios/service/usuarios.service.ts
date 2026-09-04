import { Injectable, ConflictException } from '@nestjs/common';
import { UsuariosRepository } from '../repository/usuarios.repository';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Usuario } from '../entity/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    private usuariosRepo: UsuariosRepository,
    private catalogosService: CatalogosService,
  ) {}

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepo.buscarPorEmail(email);
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    return this.usuariosRepo.buscarPorId(id);
  }

  async crear(datos: Partial<Usuario>): Promise<Usuario> {
    const cantidadUsuarios = await this.usuariosRepo.contarUsuarios();
    const nombreRol = cantidadUsuarios === 0 ? 'Administrador' : 'Usuario';

    let rol = await this.catalogosService.getRolPorNombre(nombreRol);
    
    // Si el rol no existe y es el primer usuario, lo creamos "on the fly"
    if (!rol) {
      if (cantidadUsuarios === 0) {
        rol = await this.catalogosService.crearRol({ nombre: nombreRol });
      } else {
        throw new ConflictException(`No existe el rol '${nombreRol}' cargado en la tabla rol`);
      }
    }

    const nuevoUsuario = this.usuariosRepo.crear({ ...datos, rol });
    return this.usuariosRepo.guardar(nuevoUsuario);
  }
}