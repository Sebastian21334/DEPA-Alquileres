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

  listarTodos(): Promise<Usuario[]> {
    return this.repo.find({
      relations: { rol: true },
      order: { id: 'ASC' },
    });
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    return this.repo.findOne({
      where: { id: id },
      relations: { rol: true },
    });
  }

  eliminar(usuario: Usuario): Promise<Usuario> {
    return this.repo.remove(usuario);
  }

  async buscarParaLogin(email: string): Promise<Usuario | null> {
    // La contraseña tiene select:false en la entidad y debe pedirse explícitamente solo aquí.
    return (
      this.repo
        .createQueryBuilder('u')
        .addSelect('u.contrasenia')
        // El rol se necesita para autorizar la sesión y para incluirlo en el JWT.
        .leftJoinAndSelect('u.rol', 'rol')
        .where('u.email = :email', { email })
        .getOne()
    );
  }

  buscarPorTokenVerificacion(token: string): Promise<Usuario | null> {
    // No hace falta re-seleccionar token_verificacion: el service solo lo
    // sobrescribe (a null) después de encontrarlo, nunca lee su valor.
    return this.repo.findOne({ where: { token_verificacion: token } });
  }

  buscarPorTokenRecuperacion(token: string): Promise<Usuario | null> {
    // A diferencia del anterior, acá el service sí necesita leer
    // token_recuperacion_expira para validar la vigencia, así que hay que
    // forzar su selección igual que con la contraseña en buscarParaLogin.
    return this.repo
      .createQueryBuilder('u')
      .addSelect(['u.token_recuperacion', 'u.token_recuperacion_expira'])
      .where('u.token_recuperacion = :token', { token })
      .getOne();
  }

  buscarCredencialesPorId(id: number): Promise<Usuario | null> {
    return this.repo.createQueryBuilder('u')
      .addSelect('u.contrasenia')
      .where('u.id = :id', { id })
      .getOne();
  }

  async cambiarContrasenia(id: number, hashActual: string, nuevoHash: string): Promise<boolean> {
    // Impide sobrescribir otro cambio concurrente e invalida los enlaces pendientes.
    const resultado = await this.repo.createQueryBuilder()
      .update(Usuario)
      .set({ contrasenia: nuevoHash, token_recuperacion: null, token_recuperacion_expira: null })
      .where('id_usuario = :id', { id })
      .andWhere('contrasenia = :hashActual', { hashActual })
      .andWhere('bloqueado = false')
      .execute();
    return resultado.affected === 1;
  }

  async restablecerContrasenia(token: string, nuevoHash: string): Promise<boolean> {
    // El consumo del token y el cambio son atómicos: un enlace solo puede usarse una vez.
    const resultado = await this.repo.createQueryBuilder()
      .update(Usuario)
      .set({ contrasenia: nuevoHash, token_recuperacion: null, token_recuperacion_expira: null })
      .where('token_recuperacion = :token', { token })
      .andWhere('token_recuperacion_expira > :ahora', { ahora: new Date() })
      .andWhere('bloqueado = false')
      .execute();
    return resultado.affected === 1;
  }
}
