import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entity/usuario.entity';
import { IUsuariosRepository } from './usuarios.repository.interface';

@Injectable()
export class UsuariosRepository implements IUsuariosRepository {  
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
  ) {}

  crear(datos: Partial<Usuario>): Usuario {
    return this.repo.create(datos);
  }

  guardar(usuario: Usuario): Promise<Usuario> {
    return this.repo.save(usuario);
  }

  buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.repo.findOneBy({ email });
  }

  contarUsuarios(): Promise<number> {
    return this.repo.count();
  }

  buscarPorId(id: number): Promise<Usuario | null> {
    return this.repo.findOneBy({ id });
  }

  async buscarParaLogin(email: string): Promise<Usuario | null> {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.contrasenia') // <-- Fuerza traer la columna oculta
      .leftJoinAndSelect('u.rol', 'rol') // <-- Traemos el rol para saber si es Admin, Propietario, etc.
      .where('u.email = :email', { email })
      .getOne();
  }
}