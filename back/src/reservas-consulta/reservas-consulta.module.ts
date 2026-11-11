import { Module } from '@nestjs/common';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';
import { ReservaEstadoService } from './service/reserva-estado.service';

@Module({
  imports: [PublicacionesModule],
  providers: [ReservaEstadoService],
  exports: [ReservaEstadoService],
})
export class ReservasConsultaModule {}
