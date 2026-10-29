import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnunciantesModule } from '../anunciantes/anunciantes.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { AlmacenamientoModule } from '../common/almacenamiento/almacenamiento.module';
import { MailModule } from '../mail/mail.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { VerificacionAnuncianteController } from './controller/verificacion-anunciante.controller';
import { RevisionVerificacion } from './entity/revision-verificacion.entity';
import { SolicitudVerificacion } from './entity/solicitud-verificacion.entity';
import { ANALISIS_FACIAL_REPOSITORY } from './repository/analisis-facial.repository.interface';
import { FaceApiAnalisisRepository } from './repository/face-api-analisis.repository';
import { VERIFICACION_REPOSITORY } from './repository/verificacion.repository.interface';
import { VerificacionRepository } from './repository/verificacion.repository';
import { PruebaVidaService } from './service/prueba-vida.service';
import { VerificacionAnuncianteService } from './service/verificacion-anunciante.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudVerificacion, RevisionVerificacion]),
    AnunciantesModule,
    SeguridadModule,
    CatalogosModule,
    AlmacenamientoModule,
    MailModule,
    UsuariosModule,
  ],
  controllers: [VerificacionAnuncianteController],
  providers: [
    VerificacionAnuncianteService,
    PruebaVidaService,
    VerificacionRepository,
    { provide: VERIFICACION_REPOSITORY, useExisting: VerificacionRepository },
    FaceApiAnalisisRepository,
    {
      provide: ANALISIS_FACIAL_REPOSITORY,
      useExisting: FaceApiAnalisisRepository,
    },
  ],
})
export class VerificacionAnuncianteModule {}
