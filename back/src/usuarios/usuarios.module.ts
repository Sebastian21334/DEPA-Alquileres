import { AlmacenamientoModule } from '../common/almacenamiento/almacenamiento.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entity/usuario.entity';
import { USUARIOS_REPOSITORY } from './repository/usuarios.repository.interface';
import { UsuariosRepository } from './repository/usuarios.repository';
import { UsuariosService } from './service/usuarios.service';
import { UsuariosCredencialesService } from './service/usuarios-credenciales.service';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { UsuariosController } from './controller/usuarios.controller';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { MailModule } from '../mail/mail.module';

@Module({
  // El controller expone únicamente operaciones administrativas de usuarios.
  controllers: [UsuariosController],
  providers: [
    // Se registra la implementación concreta y luego se publica mediante un token.
    UsuariosRepository,
    {
      provide: USUARIOS_REPOSITORY,
      useExisting: UsuariosRepository,
    },
    UsuariosService,
    UsuariosCredencialesService,
  ],
  exports: [UsuariosService, UsuariosCredencialesService],
  imports: [
    AlmacenamientoModule,
    // TypeORM crea el repositorio de la entidad Usuario para este módulo.
    TypeOrmModule.forFeature([Usuario]),
    CatalogosModule,
    SeguridadModule,
    MailModule,
  ],
})
export class UsuariosModule {}
