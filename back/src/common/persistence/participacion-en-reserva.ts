import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export type ParticipacionEnReserva = 'Anunciante' | 'Inquilino';

/** Centraliza el filtro por titular para consultas que ya tienen una reserva con el alias reserva. */
export function filtrarReservasPorCuenta<T extends ObjectLiteral>(consulta: SelectQueryBuilder<T>, idUsuario: number, participacion: ParticipacionEnReserva | 'Ambos'): SelectQueryBuilder<T> {
  if (participacion === 'Inquilino') {
    return consulta.andWhere('reserva.id_usuario = :idUsuario', { idUsuario });
  }
  if (participacion === 'Anunciante') {
    return consulta.innerJoin('reserva.publicacion', 'publicacion')
      .andWhere('publicacion.id_anunciante = :idUsuario', { idUsuario });
  }
  // Conserva las reservas del inquilino aunque ya no tengan una publicación asociada.
  return consulta.leftJoin('reserva.publicacion', 'publicacion')
    .andWhere('(reserva.id_usuario = :idUsuario OR publicacion.id_anunciante = :idUsuario)', { idUsuario });
}
