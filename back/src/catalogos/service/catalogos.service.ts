import { Injectable } from '@nestjs/common';
import { CatalogosRepository } from '../repository/catalogos.repository';

@Injectable()
export class CatalogosService {
  constructor(private catalogosRepo: CatalogosRepository) {}

  getRoles() {
    return this.catalogosRepo.buscarTodosRoles();
  }

  getRolPorNombre(nombre: string) {
    return this.catalogosRepo.buscarRolPorNombre(nombre);
  }

  getTiposAnunciante() {
    return this.catalogosRepo.buscarTodosTiposAnunciante();
  }

  getTipoAnunciantePorId(id: number) {
    return this.catalogosRepo.buscarTipoAnunciantePorId(id);
  }

  getTiposPropiedad() {
    return this.catalogosRepo.buscarTodosTiposPropiedad();
  }

  getModalidades() {
    return this.catalogosRepo.buscarTodasModalidades();
  }

  getMetodosPago() {
    return this.catalogosRepo.buscarTodosMetodosPago();
  }

  getTiposMoneda() {
    return this.catalogosRepo.buscarTodosTiposMoneda();
  }
}