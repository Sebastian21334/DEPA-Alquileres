import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { USUARIOS_REPOSITORY } from '../repository/usuarios.repository.interface';
import type { IUsuariosRepository } from '../repository/usuarios.repository.interface';
import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Usuario } from '../entity/usuario.entity';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @Inject(USUARIOS_REPOSITORY)
    private usuariosRepo: IUsuariosRepository,

    private catalogosService: CatalogosService,
    private configService: ConfigService,
  ) {}

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepo.buscarPorEmail(email);
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    return this.usuariosRepo.buscarPorId(id);
  }

  async crear(datos: any): Promise<Usuario> {
    // 1. Costo desde env (fallback 12)
    const rounds = Number(this.configService.get<string>('BCRYPT_COST') ?? '12');

    // 2. Hashear la contraseña en texto plano
    const contraseniaHash = await bcrypt.hash(datos.contrasenia, rounds);

    // 3. Determinar rol: primer usuario → Administrador, los demás → Usuario
    //    El cliente nunca manda el rol; lo asigna el servidor.
    const cantidadUsuarios = await this.usuariosRepo.contarUsuarios();
    const nombreRol = cantidadUsuarios === 0 ? 'Administrador' : 'Usuario';

    let rol = await this.catalogosService.getRolPorNombre(nombreRol);
    if (!rol) {
      if (cantidadUsuarios === 0) {
        rol = await this.catalogosService.crearRol({ nombre: nombreRol });
      } else {
        throw new ConflictException(`No existe el rol '${nombreRol}'`);
      }
    }

    // 4. Crear y guardar (contrasenia en texto plano se reemplaza por el hash)
    const { contrasenia, ...resto } = datos;
    const nuevoUsuario = this.usuariosRepo.crear({
      ...resto,
      contrasenia: contraseniaHash,
      rol,
    });
    return this.usuariosRepo.guardar(nuevoUsuario);
  }

  async validarUsuarioParaLogin(email: string, password: string): Promise<Usuario | null> {
    // Solo busca — la comparación bcrypt vive en AuthService.login
    return this.usuariosRepo.buscarParaLogin(email);
  }
  
}