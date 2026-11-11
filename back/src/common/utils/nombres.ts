export function formatearNombreCompleto(nombre?: string, apellido?: string): string {
  return [nombre, apellido].filter(Boolean).join(' ');
}
