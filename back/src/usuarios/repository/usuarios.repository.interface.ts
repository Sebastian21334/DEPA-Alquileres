import { Usuario } from "../entity/usuario.entity";

export const USUARIOS_REPOSITORY = 'USUARIOS_REPOSITORY';

export interface IUsuariosRepository {
  crear(datos: Partial<Usuario>): Usuario;
  guardar(usuario: Usuario): Promise<Usuario>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  contarUsuarios(): Promise<number>;
  buscarPorId(id: number): Promise<Usuario | null>;
  buscarParaLogin(email: string): Promise<Usuario | null>;
}