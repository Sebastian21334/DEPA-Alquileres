import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from './entity/rol.entity';
import { TipoAnunciante } from './entity/tipo-anunciante.entity';
import { TipoPropiedad } from './entity/tipo-propiedad.entity';
import { Modalidad } from './entity/modalidad.entity';
import { MetodoPago } from './entity/metodo-pago.entity';
import { TipoMoneda } from './entity/tipo-moneda.entity';
import { CatalogosRepository } from './repository/catalogos.repository';
import { CatalogosService } from './service/catalogos.service';
import { CatalogosController } from './controlador/catalogos.controller';
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Rol, TipoAnunciante, TipoPropiedad, Modalidad, MetodoPago, TipoMoneda]),
    forwardRef(() => AuthModule),
  ],
  controllers: [CatalogosController],
  providers: [CatalogosRepository, CatalogosService],
  exports: [CatalogosRepository, CatalogosService], // así Usuarios/Anunciantes pueden usarlo sin duplicar repos
})
export class CatalogosModule {}