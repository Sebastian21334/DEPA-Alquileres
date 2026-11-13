import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from '../catalogos/entity/rol.entity';
import { Usuario } from './entity/usuario.entity';
import { USUARIOS_REPOSITORY } from './repository/usuarios.repository.interface';
import { UsuariosRepository } from './repository/usuarios.repository';
import { UsuariosConsultaService } from './service/usuarios-consulta.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Rol])],
  providers: [
    UsuariosRepository,
    { provide: USUARIOS_REPOSITORY, useExisting: UsuariosRepository },
    UsuariosConsultaService,
  ],
  exports: [UsuariosConsultaService],
})
export class UsuariosConsultaModule {}
