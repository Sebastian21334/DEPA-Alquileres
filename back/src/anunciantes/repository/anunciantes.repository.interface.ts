import type { EntityManager } from 'typeorm';
import type { Anunciante } from '../entity/anunciante.entity';
import type { TipoAnunciante } from '../../catalogos/entity/tipo-anunciante.entity';

export const ANUNCIANTES_REPOSITORY = 'ANUNCIANTES_REPOSITORY';

export interface IAnunciantesRepository {
  actualizarContacto(idUsuario: number, numeroContacto: string): Promise<boolean>;
  crear(datos: Partial<Anunciante>): Anunciante;
  guardar(anunciante: Anunciante, transaccion?: EntityManager): Promise<Anunciante>;
  archivarCuit(idUsuario: number, transaccion: EntityManager): Promise<void>;
  restaurarCuit(idUsuario: number, transaccion: EntityManager): Promise<void>;
  actualizarPausaActividades(idUsuario: number, pausadas: boolean, transaccion: EntityManager): Promise<boolean>;
  actualizarVerificacion(idUsuario: number, verificado: boolean, transaccion: EntityManager): Promise<void>;
  buscarCbuValidado(idUsuario: number, transaccion?: EntityManager): Promise<string | null>;
  actualizarCbuValidado(idUsuario: number, cbu: string, transaccion: EntityManager): Promise<void>;
  actualizarDatos(idUsuario: number, datos: { cuit_cuil: string; numero_contacto: string; tipoAnunciante: TipoAnunciante }, transaccion: EntityManager): Promise<boolean>;
  buscarPorUsuario(idUsuario: number, transaccion?: EntityManager): Promise<Anunciante | null>;
  buscarPendientes(): Promise<Anunciante[]>;
  eliminar(anunciante: Anunciante): Promise<Anunciante>;
  buscarPorId(id: number): Promise<Anunciante | null>;
  actualizarResumenResenas(idUsuario: number, cantidad: number, promedio: number | null, transaccion?: EntityManager): Promise<void>;
  /** true si una cuenta vigente ya usa ese CUIT/CUIL (se comparan solo los dígitos). */
  existeCuitVigente(cuit: string, transaccion?: EntityManager): Promise<boolean>;
}
