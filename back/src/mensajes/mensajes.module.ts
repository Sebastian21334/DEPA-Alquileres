// mensajes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mensaje } from './entity/mensaje.entity';
import { MensajesService } from './service/mensajes.service';
import { MensajesController } from './controller/mensajes.controller';
import { MensajeRepository } from './repository/mensajes.repository';
import { MENSAJE_REPOSITORY } from './repository/mensaje.repository.interface';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Mensaje]), PublicacionesModule, AuthModule],
  controllers: [MensajesController],
  providers: [
    MensajesService,
    MensajeRepository,
    { provide: MENSAJE_REPOSITORY, useExisting: MensajeRepository },
  ],
})
export class MensajesModule {}