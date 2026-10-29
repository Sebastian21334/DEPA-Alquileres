# Frontend de DEPA

Aplicación de alquileres desarrollada con Angular y TypeScript.

Desde esta carpeta:

```sh
npm ci
npm start
```

La aplicación se abre en `http://localhost:4200`. Las URLs de la API se
configuran en `src/environments/`.

El inicio limita los procesos de compilación para reducir el consumo de memoria
al ejecutar el front y el back juntos. La aplicación se compila solo para el
navegador, sin generar una versión de servidor.

```sh
npm run build
```

La compilación genera `dist/front/browser`. `vercel.json` configura la
publicación y las rutas de la aplicación.

Los recursos de `public/` incluyen las imágenes de la interfaz y el modelo
MediaPipe usado para la captura de identidad.

La generación automática de archivos de prueba está desactivada.
