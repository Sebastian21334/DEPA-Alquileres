import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { normalizeIp, ThrottlerModule } from '@nestjs/throttler';
import type { Request } from 'express';
import { isIP } from 'node:net';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';
import { UbicacionModule } from '../ubicacion/ubicacion.module';
import { ChatbotController } from './controller/chatbot.controller';
import { FoundryAdapter } from './proveedor/foundry.adapter';
import { PROVEEDOR_CHATBOT } from './proveedor/proveedor-chatbot.interface';
import { ChatbotService } from './service/chatbot.service';
import { BuscarPublicacionesService } from './service/buscar-publicaciones.service';

function ipDelCliente(solicitud: Request): string {
  // App Service reemplaza Client-Ip en su proxy. Fuera de Azure usamos la IP de Express.
  const reenviada = process.env.WEBSITE_SITE_NAME ? solicitud.get('client-ip')?.trim() : undefined;
  const conPuerto = reenviada && /^(?:\[([^\]]+)\]|([^:]+)):\d+$/.exec(reenviada);
  const ip = (conPuerto && (conPuerto[1] ?? conPuerto[2])) || reenviada;
  return normalizeIp(ip && isIP(ip) ? ip : solicitud.ip ?? solicitud.socket.remoteAddress ?? 'desconocida');
}

@Module({
  imports: [
    ConfigModule,
    CatalogosModule,
    PublicacionesModule,
    UbicacionModule,
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 10 }],
      getTracker: (solicitud) => ipDelCliente(solicitud as Request),
      errorMessage: 'Hiciste muchas consultas seguidas. Volvé a intentar en un minuto.',
    }),
  ],
  controllers: [ChatbotController],
  providers: [
    ChatbotService,
    BuscarPublicacionesService,
    { provide: PROVEEDOR_CHATBOT, useClass: FoundryAdapter },
  ],
})
export class ChatbotModule {}
