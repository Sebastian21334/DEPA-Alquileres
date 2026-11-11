import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnunciantesModule } from '../anunciantes/anunciantes.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { AlmacenamientoModule } from '../almacenamiento/almacenamiento.module';
import { MailModule } from '../mail/mail.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { VerificacionAnuncianteController } from './controller/verificacion-anunciante.controller';
import { RevisionVerificacion } from './entity/revision-verificacion.entity';
import { SolicitudVerificacion } from './entity/solicitud-verificacion.entity';
import { ANALISIS_FACIAL } from './proveedor/analisis-facial.interface';
import { FaceApiAdapter } from './proveedor/face-api.adapter';
import { VERIFICACION_REPOSITORY } from './repository/verificacion.repository.interface';
import { VerificacionRepository } from './repository/verificacion.repository';
import { PruebaVidaService } from './service/prueba-vida.service';
import { VerificacionAnuncianteService } from './service/verificacion-anunciante.service';
import { EliminacionDocumento } from './entity/eliminacion-documento.entity';
import { EliminacionDocumentosService } from './service/eliminacion-documentos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SolicitudVerificacion,
      RevisionVerificacion,
      EliminacionDocumento,
    ]),
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
    EliminacionDocumentosService,
    PruebaVidaService,
    VerificacionRepository,
    { provide: VERIFICACION_REPOSITORY, useExisting: VerificacionRepository },
    FaceApiAdapter,
    {
      provide: ANALISIS_FACIAL,
      useExisting: FaceApiAdapter,
    },
  ],
})
export class VerificacionAnuncianteModule {}
