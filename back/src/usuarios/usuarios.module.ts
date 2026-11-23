import { BcryptAdapter } from './proveedor/bcrypt.adapter';
import { HASH_CONTRASENIAS } from './proveedor/contrasenias.interface';
import { ReservasLecturaModule } from '../reservas/reservas-lectura.module';
import { ReclamosLecturaModule } from '../reclamos/reclamos-lectura.module';
import { CancelacionesLecturaModule } from '../cancelaciones/cancelaciones-lectura.module';
import { ReembolsosLecturaModule } from '../reembolsos/reembolsos-lectura.module';
import { PagosModule } from '../pagos/pagos.module';
import { OperacionesCuentaService } from './service/operaciones-cuenta.service';
import { AlmacenamientoModule } from '../almacenamiento/almacenamiento.module';
import { forwardRef, Module } from '@nestjs/common';
import { UsuariosService } from './service/usuarios.service';
import { UsuariosCredencialesService } from './service/usuarios-credenciales.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entity/usuario.entity';
import { USUARIOS_REPOSITORY } from './repository/usuarios.repository.interface';
import { UsuariosRepository } from './repository/usuarios.repository';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { UsuariosController } from './controller/usuarios.controller';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { MailModule } from '../mail/mail.module';
import { AnunciantesModule } from '../anunciantes/anunciantes.module';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';

@Module({
  // El controller expone únicamente operaciones administrativas de usuarios.
  controllers: [UsuariosController],
  providers: [
    UsuariosService,
    OperacionesCuentaService,
    UsuariosCredencialesService,
    // Credenciales usa el contrato de contraseñas y este módulo elige su implementación.
    { provide: HASH_CONTRASENIAS, useClass: BcryptAdapter },
    UsuariosRepository,
    { provide: USUARIOS_REPOSITORY, useExisting: UsuariosRepository },
  ],
  exports: [UsuariosService, UsuariosCredencialesService],
  imports: [
    // Los módulos de lectura permiten consultar pendientes sin depender de los módulos completos de gestión.
    ReservasLecturaModule,
    ReclamosLecturaModule,
    CancelacionesLecturaModule,
    ReembolsosLecturaModule,
    PagosModule,
    AlmacenamientoModule,
    TypeOrmModule.forFeature([Usuario]),
    CatalogosModule,
    forwardRef(() => SeguridadModule),
    MailModule,
    AnunciantesModule,
    PublicacionesModule,
  ],
})
export class UsuariosModule {}
