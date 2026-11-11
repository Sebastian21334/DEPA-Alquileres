import { AlmacenamientoModule } from '../almacenamiento/almacenamiento.module';
import { Module } from '@nestjs/common';
import { UsuariosService } from './service/usuarios.service';
import { UsuariosCredencialesService } from './service/usuarios-credenciales.service';
import { UsuariosConsultaModule } from './usuarios-consulta.module';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { UsuariosController } from './controller/usuarios.controller';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { MailModule } from '../mail/mail.module';
import { AnunciantesModule } from '../anunciantes/anunciantes.module';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';

@Module({
  // El controller expone únicamente operaciones administrativas de usuarios.
  controllers: [UsuariosController],
  providers: [UsuariosService, UsuariosCredencialesService],
  exports: [UsuariosService, UsuariosCredencialesService],
  imports: [
    AlmacenamientoModule,
    UsuariosConsultaModule,
    CatalogosModule,
    SeguridadModule,
    MailModule,
    AnunciantesModule,
    PublicacionesModule,
  ],
})
export class UsuariosModule {}
