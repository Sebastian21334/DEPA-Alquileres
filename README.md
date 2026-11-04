# DEPA — Seminario Integrador

## Iniciar frontend y backend juntos

Desde la raiz del proyecto:

```powershell
npm start
```

Tambien se puede usar `npm run dev`. El comando inicia el backend NestJS en
modo desarrollo y el frontend Angular en la misma terminal. Los cambios de
codigo se recompilan automaticamente.

- Frontend: `http://localhost:4200`.
- Backend: `http://localhost:3000`, salvo que `PORT` en `back/.env` indique otro puerto.
- Para cerrar ambos servicios y sus procesos: **Ctrl+C**.
- Si uno de los servicios termina, el lanzador cierra tambien el otro.

El lanzador no requiere dependencias adicionales. Si todavia no estan instaladas
las dependencias de cada aplicacion, ejecutar una vez:

```powershell
npm --prefix back ci
npm --prefix front ci
```

El backend utiliza `back/.env`. El frontend local utiliza la URL de la API
definida en `front/src/environments/environment.ts`.

## Pruebas de rendimiento

Las pruebas contra el backend publicado en Azure se ejecutan independientemente
del inicio local. Consultar [la guia de RNF8](back/performance/README.md).
