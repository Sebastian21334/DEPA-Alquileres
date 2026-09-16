/**
 * Vista para el anunciante dueño de la publicación. La reserva se representa
 * solo por su ID: los datos personales permanecen en la API protegida de
 * reservas.
 */
export class FechaDisponibilidadAdministracionDto {
  id: number;
  fecha: Date;
  disponible: boolean;
  reserva: { id: number } | null;
}
