import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from './entity/rol.entity';
import { TipoAnunciante } from './entity/tipo-anunciante.entity';
import { TipoPropiedad } from './entity/tipo-propiedad.entity';
import { Modalidad } from './entity/modalidad.entity';
import { MetodoPago } from './entity/metodo-pago.entity';
import { TipoMoneda } from './entity/tipo-moneda.entity';
import { CatalogosRepository } from './repository/catalogos.repository';
import { CATALOGOS_REPOSITORY } from './repository/catalogos.repository.interface';
import { CatalogosService } from './service/catalogos.service';
import { CatalogosController } from './controlador/catalogos.controller';
import {AuthModule} from "../auth/auth.module";

@Module({
  // Centraliza las tablas maestras que son referenciadas por otros módulos.
  imports: [
    TypeOrmModule.forFeature([Rol, TipoAnunciante, TipoPropiedad, Modalidad, MetodoPago, TipoMoneda]),
    forwardRef(() => AuthModule),
  ],
  controllers: [CatalogosController],
  providers: [
    // El token permite inyectar el contrato sin acoplar services al repositorio.
    CatalogosRepository,
    {
      provide: CATALOGOS_REPOSITORY,
      useExisting: CatalogosRepository,
    },
    CatalogosService,
  ],
  exports: [CatalogosService],
})
export class CatalogosModule {}