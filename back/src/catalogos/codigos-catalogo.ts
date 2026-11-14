import estados from './estados-iniciales.json';

export function codigosCatalogo<A extends keyof typeof estados>(ambito: A): { readonly [K in keyof typeof estados[A]['estados']]: K } {
  const codigos = Object.keys(estados[ambito].estados);
  return Object.freeze(Object.fromEntries(codigos.map(codigo => [codigo, codigo]))) as { readonly [K in keyof typeof estados[A]['estados']]: K };
}
