import { Usuario } from "../entity/usuario.entity";
import { ListarAdministracionDto } from '../../common/dto/listar-administracion.dto';
import { Pagina } from '../../common/persistence/paginacion';
import type { EntityManager } from 'typeorm';

export type ParticipacionEnReserva = 'Anunciante' | 'Inquilino';

export interface OperacionesPendientesCuenta {
  reservasPendientes: number;
  estadiasVigentes: number;
  liquidacionesPendientes: number;
  pagosSinConciliar: number;
}

export const USUARIOS_REPOSITORY = 'USUARIOS_REPOSITORY';

export interface IUsuariosRepository {
  crear(datos: Partial<Usuario>): Usuario;
  guardar(usuario: Usuario, transaccion?: EntityManager): Promise<Usuario>;
  conTransaccion<T>(operacion: (transaccion: EntityManager) => Promise<T>): Promise<T>;
  buscarBloqueado(idUsuario: number, transaccion: EntityManager, incluirRol?: boolean): Promise<Usuario | null>;
  contarOperacionesPendientes(idUsuario: number, participacion: ParticipacionEnReserva, hoy: string, limiteCheckout: Date, transaccion: EntityManager): Promise<OperacionesPendientesCuenta>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  contarUsuarios(): Promise<number>;
  listarTodos(): Promise<Usuario[]>;
  listarAdministracion(consulta: ListarAdministracionDto): Promise<Pagina<Usuario>>;
  buscarPorId(id: number): Promise<Usuario | null>;
  buscarParaLogin(email: string): Promise<Usuario | null>;
  buscarPorTokenVerificacion(token: string): Promise<Usuario | null>;
  buscarPorTokenRecuperacion(token: string): Promise<Usuario | null>;
  buscarCredencialesPorId(id: number): Promise<Usuario | null>;
  cambiarContrasenia(id: number, hashActual: string, nuevoHash: string): Promise<boolean>;
  restablecerContrasenia(token: string, nuevoHash: string): Promise<boolean>;
}
