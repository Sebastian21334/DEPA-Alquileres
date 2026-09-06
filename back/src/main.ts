import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Punto de entrada: crea la aplicación y aplica la configuración común a todas las rutas.
  const app = await NestFactory.create(AppModule);

  app.enableCors(); // Para que tu frontend en Angular pueda conectarse sin errores de CORS

  app.useGlobalPipes(
    new ValidationPipe({
      // Elimina propiedades que no estén declaradas en el DTO recibido.
      whitelist: true,
      // En lugar de ignorarlas silenciosamente, rechaza propiedades desconocidas.
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();