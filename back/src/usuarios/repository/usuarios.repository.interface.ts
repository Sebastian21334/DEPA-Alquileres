import { Usuario } from "../entity/usuario.entity";

export const USUARIOS_REPOSITORY = 'USUARIOS_REPOSITORY';

export interface IUsuariosRepository {
  crear(datos: Partial<Usuario>): Usuario;
  guardar(usuario: Usuario): Promise<Usuario>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  contarUsuarios(): Promise<number>;
  listarTodos(): Promise<Usuario[]>;
  buscarPorId(id: number): Promise<Usuario | null>;
  eliminar(usuario: Usuario): Promise<Usuario>;
  buscarParaLogin(email: string): Promise<Usuario | null>;
  buscarPorTokenVerificacion(token: string): Promise<Usuario | null>;
  buscarPorTokenRecuperacion(token: string): Promise<Usuario | null>;
}