import { Module } from '@nestjs/common';
import { ARCHIVO_REPOSITORY } from './archivo.repository.interface';
import { AzureArchivoRepository } from './azure-archivo.repository';

/** Adaptador compartido de la capa de datos; lo consumen los servicios de negocio. */
@Module({
  providers: [
    AzureArchivoRepository,
    { provide: ARCHIVO_REPOSITORY, useExisting: AzureArchivoRepository },
  ],
  exports: [ARCHIVO_REPOSITORY],
})
export class AlmacenamientoModule {}
