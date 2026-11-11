import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ARCHIVO_REPOSITORY } from './repository/archivo.repository.interface';
import { AzureArchivoRepository } from './repository/azure-archivo.repository';
import { AlmacenamientoService } from './service/almacenamiento.service';

@Module({
  imports: [ConfigModule],
  providers: [
    AzureArchivoRepository,
    { provide: ARCHIVO_REPOSITORY, useExisting: AzureArchivoRepository },
    AlmacenamientoService,
  ],
  exports: [AlmacenamientoService],
})
export class AlmacenamientoModule {}
