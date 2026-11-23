import { Usuario, type DetalleBloqueo, type BloqueoHistorico } from "../entity/usuario.entity";
import { ListarAdministracionDto } from '../../common/dto/listar-administracion.dto';
import { Pagina } from '../../common/persistence/paginacion';
import type { EntityManager } from 'typeorm';

export const USUARIOS_REPOSITORY = 'USUARIOS_REPOSITORY';

export interface BloqueoAdministrativo {
  usuario: { id: number; nombre: string; apellido: string; email: string | null };
  detalle: DetalleBloqueo;
  administrador: { nombre: string; apellido: string } | null;
}

export interface IUsuariosCredencialesRepository {
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarParaLogin(email: string): Promise<Usuario | null>;
  guardarTokenVerificacion(id: number, email: string, token: string): Promise<boolean>;
  verificarCuenta(token: string): Promise<boolean>;
  guardarTokenRecuperacion(id: number, email: string, token: string, expira: Date): Promise<boolean>;
  buscarPorTokenRecuperacion(token: string): Promise<Usuario | null>;
  buscarCredencialesPorId(id: number): Promise<Usuario | null>;
  cambiarContrasenia(id: number, hashActual: string, nuevoHash: string): Promise<boolean>;
  restablecerContrasenia(token: string, nuevoHash: string): Promise<boolean>;
}

export interface IUsuariosRepository extends IUsuariosCredencialesRepository {
  crear(datos: Partial<Usuario>): Usuario;
  guardar(usuario: Usuario, transaccion?: EntityManager): Promise<Usuario>;
  conTransaccion<T>(operacion: (transaccion: EntityManager) => Promise<T>): Promise<T>;
  buscarBloqueado(idUsuario: number, transaccion: EntityManager, incluirRol?: boolean, incluirCredenciales?: boolean): Promise<Usuario | null>;
  buscarBajaRecuperable(email: string): Promise<Usuario | null>;
  buscarPorTokenReactivacion(token: string): Promise<Usuario | null>;
  guardarTokenReactivacion(id: number, email: string, token: string, expira: Date): Promise<boolean>;
  reactivar(id: number, email: string, hashActual: string, token: string, versionSesion: string, transaccion: EntityManager): Promise<boolean>;
  contarUsuarios(): Promise<number>;
  listarTodos(): Promise<Usuario[]>;
  listarAdministracion(consulta: ListarAdministracionDto): Promise<Pagina<Usuario>>;
  buscarPorId(id: number, transaccion?: EntityManager): Promise<Usuario | null>;
  buscarParaSesion(id: number): Promise<Usuario | null>;
  buscarConBloqueo(id: number, transaccion?: EntityManager, bloquear?: boolean): Promise<Usuario | null>;
  listarBloqueados(): Promise<BloqueoAdministrativo[]>;
  listarHistorialBloqueos(): Promise<{ usuario: BloqueoAdministrativo['usuario']; historial: BloqueoHistorico[] }[]>;
}
