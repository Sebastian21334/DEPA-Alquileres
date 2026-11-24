import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CotizacionDolar } from './entity/cotizacion-dolar.entity';
import { CotizacionRepository } from './repository/cotizacion.repository';
import { COTIZACION_REPOSITORY } from './repository/cotizacion.repository.interface';
import { CotizacionesLecturaService } from './service/cotizaciones-lectura.service';

// Publicaciones ordena por precio con la cotización guardada sin importar la actualización periódica de CotizacionesModule.
@Module({
  imports: [TypeOrmModule.forFeature([CotizacionDolar])],
  providers: [{ provide: COTIZACION_REPOSITORY, useClass: CotizacionRepository }, CotizacionesLecturaService],
  exports: [CotizacionesLecturaService],
})
export class CotizacionesLecturaModule {}
