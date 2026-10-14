import { Favorito } from '../entity/favorito.entity';

export const FAVORITOS_REPOSITORY = 'FAVORITOS_REPOSITORY';

export interface IFavoritosRepository {
  buscarPorUsuario(idUsuario: number): Promise<Favorito[]>;
  existe(idUsuario: number, idPublicacion: number): Promise<boolean>;
  agregar(idUsuario: number, idPublicacion: number): Promise<void>;
  quitar(idUsuario: number, idPublicacion: number): Promise<void>;
}
