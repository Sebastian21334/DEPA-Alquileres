/** Datos admitidos por el alta; el rol y los secretos se asignan en el servicio. */
export interface CrearUsuarioDatos {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  contrasenia: string;
}
