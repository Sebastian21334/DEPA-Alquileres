import { Usuario } from "../entity/usuario.entity";
import { ListarAdministracionDto } from '../../common/dto/listar-administracion.dto';
import { Pagina } from '../../common/paginacion';

export const USUARIOS_REPOSITORY = 'USUARIOS_REPOSITORY';

export interface IUsuariosRepository {
  crear(datos: Partial<Usuario>): Usuario;
  guardar(usuario: Usuario): Promise<Usuario>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  contarUsuarios(): Promise<number>;
  listarTodos(): Promise<Usuario[]>;
  listarAdministracion(consulta: ListarAdministracionDto): Promise<Pagina<Usuario>>;
  buscarPorId(id: number): Promise<Usuario | null>;
  eliminar(usuario: Usuario): Promise<Usuario>;
  buscarParaLogin(email: string): Promise<Usuario | null>;
  buscarPorTokenVerificacion(token: string): Promise<Usuario | null>;
  buscarPorTokenRecuperacion(token: string): Promise<Usuario | null>;
  buscarCredencialesPorId(id: number): Promise<Usuario | null>;
  cambiarContrasenia(id: number, hashActual: string, nuevoHash: string): Promise<boolean>;
  restablecerContrasenia(token: string, nuevoHash: string): Promise<boolean>;
}
