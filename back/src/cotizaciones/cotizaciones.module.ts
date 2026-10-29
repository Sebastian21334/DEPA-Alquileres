import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { CotizacionDolar } from './entity/cotizacion-dolar.entity';
import { ConsultaCotizacion } from './entity/consulta-cotizacion.entity';
import { CotizacionRepository } from './repository/cotizacion.repository';
import { COTIZACION_REPOSITORY } from './repository/cotizacion.repository.interface';
import { DolarApiAdapter } from './repository/dolar-api.adapter';
import { PROVEEDOR_DOLAR } from './repository/proveedor-dolar.interface';
import { CotizacionesService } from './service/cotizaciones.service';
import { CotizacionesController } from './controller/cotizaciones.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CotizacionDolar, ConsultaCotizacion]),
    SeguridadModule,
  ],
  controllers: [CotizacionesController],
  providers: [
    CotizacionesService,
    { provide: COTIZACION_REPOSITORY, useClass: CotizacionRepository },
    { provide: PROVEEDOR_DOLAR, useClass: DolarApiAdapter },
  ],
  exports: [CotizacionesService],
})
export class CotizacionesModule {}
