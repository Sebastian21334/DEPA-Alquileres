import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reembolso } from './entity/reembolso.entity';
import { ReembolsosRepository } from './repository/reembolsos.repository';
import { REEMBOLSOS_REPOSITORY } from './repository/reembolsos.repository.interface';
import { ReembolsosLecturaService } from './service/reembolsos-lectura.service';

// Permite que Usuarios consulte pendientes sin cargar los controladores ni la integración de reembolsos con Mercado Pago.
@Module({
  imports: [TypeOrmModule.forFeature([Reembolso])],
  providers: [ReembolsosRepository, { provide: REEMBOLSOS_REPOSITORY, useExisting: ReembolsosRepository }, ReembolsosLecturaService],
  // El módulo principal reutiliza el repositorio; Usuarios usa el servicio de lectura.
  exports: [REEMBOLSOS_REPOSITORY, ReembolsosLecturaService],
})
export class ReembolsosLecturaModule {}
