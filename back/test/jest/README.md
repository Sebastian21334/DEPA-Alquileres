# Tests Jest: CP-06, CP-07 y CP-08

Automatizan los casos de prueba de la actividad "IA vs Tester".

| Archivo | Caso | Técnica |
|---|---|---|
| `cp-06-titulo-publicacion.spec.ts` | CP-06 Formato del título de una publicación | Partición de equivalencias |
| `cp-07-contrasenias-valores-limite.spec.ts` | CP-07 Valores límite de las contraseñas | Valores límite |
| `cp-08-inicio-sesion-tabla-decision.spec.ts` | CP-08 Inicio de sesión | Tablas de decisión |

## Cómo se ejecutan

Desde `back/`, con Node 24.9 o superior:

```
npm install
npm run test:jest
```

## Qué se prueba y qué se reemplaza

Los tests son de caja negra sobre la API REST (`POST /auth/register`, `POST /auth/login`,
`POST /auth/verificar-cuenta`, `PATCH /usuarios/:id/bloquear`, `PATCH /usuarios/:id/habilitar`
y `PATCH /publicaciones/:id`). Se levanta el backend real en memoria: controllers,
`ValidationPipe` global con la misma configuración que `src/main.ts`, guards, estrategia JWT,
bcrypt y servicios.

Solo se reemplazan los servicios externos, en `soporte/app-de-prueba.ts`:

- PostgreSQL (Neon): repositorios en memoria. No se toca ninguna base real.
- Azure Communication Services: el correo se guarda en memoria y de ahí se toma el token de verificación.
- Azure Blob Storage: no se usa en estos casos.

Cada paso del caso de prueba es un `test` y los datos son los de la sección Data de cada caso.
Un test que falla indica que el resultado obtenido difiere del esperado, es decir, que el caso
dio **positivo**.
