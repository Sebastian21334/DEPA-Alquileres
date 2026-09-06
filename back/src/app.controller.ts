import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  // Endpoint mínimo para comprobar que la API está levantada.
  getHello(): string {
    return this.appService.getHello();
  }
}
