import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { ListarAdministracionDto } from './dto/listar-administracion.dto';

export interface Pagina<T> {
  datos: T[];
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

export async function paginar<T extends ObjectLiteral>(
  consulta: SelectQueryBuilder<T>,
  { pagina: solicitada, limite }: ListarAdministracionDto,
): Promise<Pagina<T>> {
  const total = await consulta.clone().getCount();
  const totalPaginas = Math.max(1, Math.ceil(total / limite));
  const pagina = Math.min(solicitada, totalPaginas);
  const datos = total
    ? await consulta.skip((pagina - 1) * limite).take(limite).getMany()
    : [];
  return { datos, pagina, limite, total, totalPaginas };
}
