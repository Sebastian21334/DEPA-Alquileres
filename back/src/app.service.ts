import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Respuesta de salud usada por el endpoint raíz del starter.
  getHello(): string {
    return 'Hello World!';
  }
}
