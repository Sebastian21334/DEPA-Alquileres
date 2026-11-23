export const HASH_CONTRASENIAS = 'HASH_CONTRASENIAS';

export interface IHashContrasenias {
  hashear(texto: string): Promise<string>;
  coincide(texto: string, hash: string): Promise<boolean>;
}
