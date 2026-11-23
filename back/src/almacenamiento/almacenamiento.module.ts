import { PROCESADOR_IMAGENES } from './proveedor/procesador-imagenes.interface';
import { SharpImagenesAdapter } from './proveedor/sharp-imagenes.adapter';
import { PreparacionImagenesService } from './service/preparacion-imagenes.service';
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
    { provide: PROCESADOR_IMAGENES, useClass: SharpImagenesAdapter },
    PreparacionImagenesService,
  ],
  exports: [AlmacenamientoService, PreparacionImagenesService],
})
export class AlmacenamientoModule {}
