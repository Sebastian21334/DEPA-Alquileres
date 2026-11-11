import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export interface Pagina<T> {
  datos: T[];
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

export async function paginar<T extends ObjectLiteral>(consulta: SelectQueryBuilder<T>, { pagina: solicitada, limite }: { pagina: number; limite: number }): Promise<Pagina<T>> {
  const total = await consulta.clone().getCount();
  const totalPaginas = Math.max(1, Math.ceil(total / limite));
  const pagina = Math.min(solicitada, totalPaginas);
  const datos = total
    ? await consulta.skip((pagina - 1) * limite).take(limite).getMany()
    : [];
  return { datos, pagina, limite, total, totalPaginas };
}
