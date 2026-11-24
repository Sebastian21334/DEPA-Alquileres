import estados from './estados-iniciales.json';

/** Nombres de los roles del catálogo inicial (`rol.nombre`). */
export const ROL = Object.freeze({ ADMINISTRADOR: 'Administrador', INQUILINO: 'Inquilino' } as const);
export type NombreRol = (typeof ROL)[keyof typeof ROL];

export function codigosCatalogo<A extends keyof typeof estados>(ambito: A): { readonly [K in keyof typeof estados[A]['estados']]: K } {
  const codigos = Object.keys(estados[ambito].estados);
  return Object.freeze(Object.fromEntries(codigos.map(codigo => [codigo, codigo]))) as { readonly [K in keyof typeof estados[A]['estados']]: K };
}
