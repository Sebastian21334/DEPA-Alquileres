import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entity/usuario.entity';
import { USUARIOS_REPOSITORY } from './repository/usuarios.repository.interface';
import { UsuariosRepository } from './repository/usuarios.repository';
import { UsuariosService } from './service/usuarios.service';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { UsuariosController } from './contoller/usuarios.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [UsuariosController],
  providers: [
    UsuariosRepository,
    {
      provide: USUARIOS_REPOSITORY,
      useExisting: UsuariosRepository,
    },
    UsuariosService,
  ],
  exports: [UsuariosService],
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    forwardRef(() => CatalogosModule),
    forwardRef(() => AuthModule),
  ],
}) 
export class UsuariosModule {}