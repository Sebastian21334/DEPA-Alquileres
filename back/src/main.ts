import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Punto de entrada: crea la aplicación y aplica la configuración común a todas las rutas.
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URLS?.split(',').map((url) => url.trim()) ?? true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      // Elimina propiedades que no estén declaradas en el DTO recibido.
      whitelist: true,
      // En lugar de ignorarlas silenciosamente, rechaza propiedades desconocidas.
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
