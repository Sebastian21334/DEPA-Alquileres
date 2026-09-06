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

  async buscarPorId(id: number): Promise<Usuario | null> {
    return this.repo.findOne({
      where: { id: id }, // ajustá el nombre de la PK según tu convención
      relations: { rol: true },
    });
  }

  async buscarParaLogin(email: string): Promise<Usuario | null> {
    // La contraseña tiene select:false en la entidad y debe pedirse explícitamente solo aquí.
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.contrasenia') // <-- Fuerza traer la columna oculta
      // El rol se necesita para autorizar la sesión y para incluirlo en el JWT.
      .leftJoinAndSelect('u.rol', 'rol')
      .where('u.email = :email', { email })
      .getOne();
  }

  buscarPorTokenVerificacion(token: string): Promise<Usuario | null> {
    return this.repo.findOne({ where: { token_verificacion: token } });
  }

  buscarPorTokenRecuperacion(token: string): Promise<Usuario | null> {
    return this.repo.findOne({ where: { token_recuperacion: token } });
  }

}