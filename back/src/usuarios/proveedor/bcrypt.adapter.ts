import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import type { IHashContrasenias } from './contrasenias.interface';

// Encapsula bcrypt para que Usuarios use el contrato de contraseñas y pueda verificar los hashes existentes.
@Injectable()
export class BcryptAdapter implements IHashContrasenias {
  constructor(private readonly config: ConfigService) {}

  /** Genera el hash de la contraseña con el costo configurado. */
  hashear(texto: string): Promise<string> {
    const costo = Number(this.config.get<string>('BCRYPT_COST') ?? '12');
    if (!Number.isInteger(costo) || costo < 12 || costo > 31) {
      throw new Error('BCRYPT_COST debe ser un entero entre 12 y 31');
    }
    return bcrypt.hash(texto, costo);
  }

  /** Comprueba si una contraseña coincide con el hash almacenado. */
  coincide(texto: string, hash: string): Promise<boolean> {
    return bcrypt.compare(texto, hash);
  }
}
