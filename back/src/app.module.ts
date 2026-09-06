import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';;
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AnunciantesModule } from './anunciantes/anunciantes.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { UbicacionModule } from './ubicacion/ubicacion.module';
import { ImagenesModule } from './imagenes/imagenes.module';
import { DisponibilidadModule } from './disponibilidad/disponibilidad.module';
import { ReservasModule } from './reservas/reservas.module';
import { MensajesModule } from './mensajes/mensajes.module';
import { CatalogosModule } from './catalogos/catalogos.module';
import { MailModule } from './mail/mail.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [    
    // Configuración global para leer el archivo .env
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: ['.env'],
    }),

    // Configuración de TypeORM usando la DATABASE_URL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'), // Lee la URL completa del .env
        autoLoadEntities: true, // Carga automáticamente las entidades de los módulos
        synchronize: true, // Sincroniza el DER creando las tablas automáticamente (útil en desarrollo)
        ssl: {
          rejectUnauthorized: false, // Requerido por Neon y Azure
        }
      }),
    }),

    // Tus módulos de negocio
    AuthModule,
    UsuariosModule,
    AnunciantesModule,
    PublicacionesModule,
    UbicacionModule,
    ImagenesModule,
    DisponibilidadModule,
    ReservasModule,
    MensajesModule,
    CatalogosModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}