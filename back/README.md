# Backend de DEPA

API de alquileres desarrollada con NestJS, TypeScript y PostgreSQL.

## Desarrollo

Desde esta carpeta:

```sh
npm ci
```

Copiar `.env.example` a `.env` y completar las credenciales de base de datos,
JWT, Azure y Mercado Pago. Luego ejecutar:

```sh
npm run start:dev
```

## Verificación y producción

```sh
npm run lint
npm test -- --runInBand
npm run build
npm run start:prod
```

Los módulos separan controladores, servicios y repositorios. Las integraciones
externas se encapsulan en adaptadores. Los modelos faciales de `src/models`
se copian automáticamente al compilar.

Las migraciones y sus instrucciones están en `migrations/`. El script
`scripts/importar-ubicaciones.cjs` permite importar localidades y catálogos;
sin `--aplicar` consulta y valida, y con `--aplicar` modifica la base configurada.
