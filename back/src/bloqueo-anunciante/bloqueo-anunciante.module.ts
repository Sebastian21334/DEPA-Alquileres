import { Module } from '@nestjs/common';
import { ReservasModule } from '../reservas/reservas.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { BloqueoAnuncianteController } from './controller/bloqueo-anunciante.controller';
import { BloqueoAnuncianteService } from './service/bloqueo-anunciante.service';

@Module({
  imports: [UsuariosModule, ReservasModule, SeguridadModule],
  controllers: [BloqueoAnuncianteController],
  providers: [BloqueoAnuncianteService],
})
export class BloqueoAnuncianteModule {}
