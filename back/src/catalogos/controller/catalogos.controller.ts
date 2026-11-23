import { Controller, Get } from '@nestjs/common';
import { CatalogosService } from '../service/catalogos.service';

@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

  // Los catálogos se cargan por seed/migración y solo se consultan desde la API.

  @Get('roles')
  getRoles() {
    return this.catalogosService.getRoles();
  }

  @Get('tipos-anunciante')
  getTiposAnunciante() {
    return this.catalogosService.getTiposAnunciante();
  }

  @Get('tipos-propiedad')
  getTiposPropiedad() {
    return this.catalogosService.getTiposPropiedad();
  }

  @Get('modalidades')
  getModalidades() {
    return this.catalogosService.getModalidades();
  }

  @Get('tipos-moneda')
  getTiposMoneda() {
    return this.catalogosService.getTiposMoneda();
  }
}
