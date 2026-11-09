import { Usuario } from './entity/usuario.entity';

/** Referencia mínima de Usuario para relaciones TypeORM sin cargar la entidad. */
export function referenciaUsuario(id: number): Usuario {
  const usuario = new Usuario();
  usuario.id = id;
  return usuario;
}
