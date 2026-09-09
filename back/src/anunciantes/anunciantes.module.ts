import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anunciante } from './entity/anunciante.entity';
import { SolicitudVerificacion } from './entity/solicitud-verificacion.entity';
import { RevisionVerificacion } from './entity/revision-verificacion.entity';
import { ANUNCIANTES_REPOSITORY } from './repository/anunciantes.repository.interface';
import { AnunciantesRepository } from './repository/anunciantes.repository';
import { AnunciantesService } from './service/anunciantes.service';
import { AnunciantesController } from './controller/anunciantes.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { AuthModule } from '../auth/auth.module'; // <- agregar
import { MailModule } from '../mail/mail.module';
import { VERIFICACION_REPOSITORY } from './repository/verificacion.repository.interface';
import { VerificacionRepository } from './repository/verificacion.repository';

@Module({
  // Agrupa endpoints, reglas de negocio y persistencia de solicitudes de anunciante.
  controllers: [AnunciantesController],
  providers: [
    AnunciantesRepository,
    {
      provide: ANUNCIANTES_REPOSITORY,
      useExisting: AnunciantesRepository,
    },
    AnunciantesService,
    VerificacionRepository,
    {
      provide: VERIFICACION_REPOSITORY,
      useExisting: VerificacionRepository,
    },
  ],
  imports: [
    // Habilita consultas TypeORM sobre la entidad Anunciante.
    TypeOrmModule.forFeature([Anunciante, SolicitudVerificacion, RevisionVerificacion]),
    // Estas dependencias permiten validar el usuario, el tipo de anunciante y el JWT.
    UsuariosModule,
    CatalogosModule,
    AuthModule,
    MailModule,
  ],
  exports: [AnunciantesService],
})
export class AnunciantesModule {}