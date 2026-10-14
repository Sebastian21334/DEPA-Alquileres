import { Global, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { UsuariosModule } from '../src/usuarios/usuarios.module';
import { AnunciantesModule } from '../src/anunciantes/anunciantes.module';
import { CatalogosModule } from '../src/catalogos/catalogos.module';
import { UbicacionModule } from '../src/ubicacion/ubicacion.module';
import { PublicacionesModule } from '../src/publicaciones/publicaciones.module';
import { ImagenesModule } from '../src/imagenes/imagenes.module';
import { DisponibilidadModule } from '../src/disponibilidad/disponibilidad.module';
import { ReservasModule } from '../src/reservas/reservas.module';
import { MensajesModule } from '../src/mensajes/mensajes.module';
import { FavoritosModule } from '../src/favoritos/favoritos.module';
import { PagosModule } from '../src/pagos/pagos.module';
import { MailModule } from '../src/mail/mail.module';
import { FaceApiAnalisisRepository } from '../src/anunciantes/repository/face-api-analisis.repository';
import { CLIENTE_CORREO } from '../src/mail/repository/cliente-correo.interface';
import { PagosService } from '../src/pagos/service/pagos.service';
import { DisponibilidadService } from '../src/disponibilidad/service/disponibilidad.service';
import { MAIL_SERVICE } from '../src/mail/mail.interface';

const dataSource = {
  entityMetadatas: [],
  options: { type: 'postgres' },
  getRepository: () => ({}),
};
const config = new ConfigService({
  JWT_SECRET: 'secreto-de-pruebas',
  FRONTEND_URLS: 'https://example.test',
  ACS_SENDER_ADDRESS: 'noreply@example.test',
});

@Global()
@Module({
  providers: [
    { provide: getDataSourceToken(), useValue: dataSource },
    { provide: ConfigService, useValue: config },
  ],
  exports: [getDataSourceToken(), ConfigService],
})
class InfraestructuraPruebaModule {}

describe('Composición de todos los módulos del backend', () => {
  it('resuelve servicios, contratos y guards sin conectarse a proveedores externos', async () => {
    const module = await Test.createTestingModule({
      imports: [
        InfraestructuraPruebaModule,
        AuthModule,
        UsuariosModule,
        AnunciantesModule,
        CatalogosModule,
        UbicacionModule,
        PublicacionesModule,
        ImagenesModule,
        DisponibilidadModule,
        ReservasModule,
        MensajesModule,
        FavoritosModule,
        PagosModule,
        MailModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(config)
      .overrideProvider(FaceApiAnalisisRepository)
      .useValue({ analizarRostro: async () => ({}), distancia: () => 0 })
      .overrideProvider(CLIENTE_CORREO)
      .useValue({
        beginSend: async () => ({
          pollUntilDone: async () => ({ status: 'Succeeded' }),
        }),
      })
      .compile();
    try {
      expect(module.get(PagosService)).toBeInstanceOf(PagosService);
      expect(module.get(DisponibilidadService)).toBeInstanceOf(
        DisponibilidadService,
      );
      expect(module.get(MAIL_SERVICE)).toBeDefined();
    } finally {
      await module.close();
    }
  });
});
