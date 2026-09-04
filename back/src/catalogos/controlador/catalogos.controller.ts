import { Controller, Get } from '@nestjs/common';
import { CatalogosService } from '../service/catalogos.service';

@Controller('catalogos')
export class CatalogosController {
  constructor(private catalogosService: CatalogosService) {}

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

  @Get('metodos-pago')
  getMetodosPago() {
    return this.catalogosService.getMetodosPago();
  }

  @Get('tipos-moneda')
  getTiposMoneda() {
    return this.catalogosService.getTiposMoneda();
  }
}