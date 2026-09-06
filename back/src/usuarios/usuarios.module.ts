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
  ],
  exports: [UsuariosService],
  imports: [
    // TypeORM crea el repositorio de la entidad Usuario para este módulo.
    TypeOrmModule.forFeature([Usuario]),
    // Catálogos aporta los roles; Auth y Usuarios tienen una dependencia circular.
    forwardRef(() => CatalogosModule),
    forwardRef(() => AuthModule),
  ],
}) 
export class UsuariosModule {}