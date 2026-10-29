// mensajes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mensaje } from './entity/mensaje.entity';
import { MensajesService } from './service/mensajes.service';
import { MensajesController } from './controller/mensajes.controller';
import { MensajeRepository } from './repository/mensajes.repository';
import { MENSAJE_REPOSITORY } from './repository/mensaje.repository.interface';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { MailModule } from '../mail/mail.module';
import { ReservasModule } from '../reservas/reservas.module';

@Module({
  // Los mensajes pertenecen a una publicación y siempre requieren identidad JWT.
  imports: [
    TypeOrmModule.forFeature([Mensaje]),
    PublicacionesModule,
    SeguridadModule,
    UsuariosModule,
    MailModule,
    ReservasModule,
  ],
  controllers: [MensajesController],
  providers: [
    MensajesService,
    // Se expone la implementación mediante un token para mantener desacoplado el service.
    MensajeRepository,
    { provide: MENSAJE_REPOSITORY, useExisting: MensajeRepository },
  ],
})
export class MensajesModule {}
