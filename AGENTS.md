# AGENTS.md — DEPA Alquileres

> **Norma operativa del repositorio.** Última revisión: 20/11/2026.
> Este archivo prevalece sobre el `AGENTS.md` del workspace cuando haya conflicto.
> `docs/arquitectura.md` describe la arquitectura real; este documento fija las reglas de trabajo.
> Los documentos funcionales viven en `back/docs/`.

## 0. Precedencia y forma de trabajo

- Leer este archivo y el `AGENTS.md` del área que se va a tocar (`back/` o `front/`) antes de editar.
- Las skills de `.agents/skills/` complementan estas reglas; no las reemplazan.
- Si un pedido contradice una regla, avisar y proponer una alternativa antes de implementar. No cambiar la arquitectura en silencio.
- Hacer el cambio más simple que resuelva el pedido completo. Sin refactors masivos, cambios de esquema ni migraciones sin pedido explícito y confirmación.
- Una tarea por commit. No mezclar una feature con un refactor arquitectónico.
- Preservar el trabajo previo del usuario y la compatibilidad de contratos y datos.

## 1. Proyecto y stack

DEPA es una aplicación de alquileres. El repositorio contiene dos aplicaciones:

| Carpeta | Aplicación | Stack |
|---|---|---|
| `back/` | API REST | NestJS 12, TypeScript 6 `strict`, TypeORM 1.x, PostgreSQL, `class-validator` 0.15 |
| `front/` | SPA | Angular 22.1 standalone, signals, TypeScript 6, Tailwind 4, Lucide, Leaflet |

- Node local: 22.x. Deploy de Azure: 24.x. Los tests Jest existentes requieren **Node ≥ 24.9**.
- El frontend se compila solo para navegador. No asumir SSR.
- La documentación funcional de reservas y dinero está en `back/docs/`.
- El modelo de estados v3.1 y el reparto de tareas viven en el workspace, fuera de este repositorio.

## 2. Comandos

### Raíz

```bash
npm start        # inicia back y front juntos
npm run dev      # alias de npm start
```

Requiere `back/node_modules` y `front/node_modules`. Para detener ambos: `Ctrl+C`.

### Backend (`cd back`)

```bash
npm ci
npm run start:dev      # API en http://localhost:3000
npm run lint           # oxlint src/
npm run build
npm run start:prod     # requiere build previo
npm run test:<dominio> # compila y ejecuta node --test
```

No existe `npm test`. Las pruebas se ejecutan con los scripts `test:*` de `package.json`.
La generación de `.spec` está desactivada en `nest-cli.json`. No agregar archivos `.spec` ni frameworks nuevos.

### Frontend (`cd front`)

```bash
npm ci
npm start              # http://localhost:4200; usa scripts/start.cjs
npm run build          # producción
npm run test:imagenes-inicio
npm run test:vitalidad
```

Usar `npm start`, no `ng serve`: el script limita workers para no agotar memoria.
La verificación principal es `npm run build`. Puede fallar sin red por Google Fonts; reintentar.

### Verificación mínima antes de cerrar

```bash
cd back && npm run lint && npm run build && npm run test:condiciones-economicas
cd ../front && npm run build
```

Además, ejecutar el `test:*` del dominio tocado.

## 3. Entorno y base de datos

- `back/.env` es obligatorio y está ignorado por Git. Nunca commitear credenciales.
- Variables relevantes: `DATABASE_URL`, `JWT_SECRET`, `BCRYPT_COST`, `ACS_*`, `AZURE_STORAGE_*`, `MP_*`, `FRONTEND_URLS`.
- `DATABASE_URL` puede apuntar a una base Neon compartida. Verificar el host antes de escribir y **no crear, modificar ni borrar datos sin confirmación**.
- `synchronize: false`: el esquema se actualiza solo con migraciones de `back/migrations/`. Leer `back/migrations/README.md` antes de aplicar.
- Los scripts `npm run db:*` y los `scripts/*.cjs --aplicar` modifican la base configurada. Ejecutarlos primero sin `--aplicar` y detener el backend cuando la documentación lo indique.
- Las pruebas usan PGlite o mocks; no deben tocar la base compartida ni servicios externos reales.
- Para probar migraciones o seed, usar una base descartable con datos de la versión anterior.

## 4. Arquitectura

### 4.1 Capas

```text
controller → service → repository → entity
```

| Capa | Responsabilidad | Límite |
|---|---|---|
| `controller` | Routing, guards, pipes, DTOs y delegación | No accede a repositorios ni a TypeORM; no decide reglas |
| `service` | Reglas, validaciones, estados, cálculos, orquestación y transacciones | No conoce `Request`/`Response`; no consulta tablas directamente |
| `repository` | Consultas y persistencia | No decide reglas ni lanza excepciones HTTP |
| `entity` | Columnas, relaciones y enums de tabla | Sin lógica, getters calculados, hooks ni `toJSON` |

### 4.2 Reglas de dependencia

- **Controller delgado:** solo valida transporte y delega. La validación de negocio vive en el service.
- **Service dueño del caso de uso:** un método público equivale a un caso de uso. Si crece, se parte por caso de uso.
- **Repositorio explícito:** interface + token (`I<Nombre>Repository`, `<NOMBRE>_REPOSITORY`) e implementación TypeORM. El módulo registra `useExisting` y **no exporta la implementación**.
- **Comunicación entre módulos:** siempre service → service. Prohibido inyectar repositorios ajenos, consultar entidades de otro módulo fuera de una relación declarada o usar `forwardRef`.
- **Relaciones:** el repositorio puede cargar relaciones TypeORM declaradas en su entidad propia, aunque pertenezcan a otro módulo. Eso es mapeo, no consulta cruzada.
- **Módulos:** el grafo debe ser acíclico. Se exporta solo lo necesario (services, guards, puertos).
- **DTOs:** todo body/query usa un DTO en `dto/` con `class-validator`. El `ValidationPipe` global aplica `whitelist` y `forbidNonWhitelisted`.
- **Entidades:** declarar explícitamente el `name` de cada columna y usar `Relation<T>`. Los estados derivados se calculan en services, no en la entidad.
- **Transacciones:** el repositorio abre la transacción (`conTransaccion`/`enTransaccion`) y comparte el `EntityManager` con los services que participan. No abrir transacciones nuevas con TypeORM dentro de un service.
- **Integraciones externas:** interface + token en `<módulo>/proveedor/` (o en `mail/`, `almacenamiento/`, `mercado-pago/`). El adapter traduce errores de infraestructura; el service decide.
- **Errores:** el repositorio traduce errores de integridad en `common/persistence`; el service decide la excepción de aplicación; el controller no hace `try/catch` de dominio.
- **Estados:** catálogo `ambito`/`estado`, códigos en `catalogos/codigos-catalogo.ts` y seed idempotente. No crear enums nuevos para estados persistidos sin consultar.

### 4.3 Principios de POO aplicados

- **SRP:** una clase por archivo y una responsabilidad por capa.
- **OCP:** extender con un service/módulo nuevo, no con condicionales en controllers.
- **LSP:** toda implementación de repositorio o proveedor debe respetar su interface.
- **ISP:** interfaces pequeñas; el módulo exporta solo la API que otros usan.
- **DIP:** depender de interfaces y tokens, no de adaptadores concretos.
- **Composición:** dependencias por constructor o `inject()`, nunca `new` dentro de la clase.
- **Encapsulamiento:** estado privado en services y signals en componentes; no exponer detalles de persistencia.

La **entidad anémica es una decisión explícita** del proyecto. No agregar comportamiento de dominio a las entidades.

### 4.4 Reglas anti-espagueti

- No agregar lógica de negocio en controllers, entidades ni componentes.
- No agregar `EntityManager` a services nuevos; la deuda existente se corrige solo en el flujo tocado y si es local y de bajo riesgo.
- No hacer que un repositorio llame a otro repositorio ni que consulte tablas de otro módulo.
- No duplicar reglas: una regla, un lugar. Las funciones puras van a `common/utils` (back) o `shared/utils` (front).
- Sin números o strings mágicos; usar constantes o enums.
- Sin `any` nuevo, sin `as` para escapar del tipado y sin `!` sin una guarda previa.
- Sin código comentado, sin `console.log` (usar `Logger`) y sin `catch` vacíos.
- Comentarios en español que expliquen el **por qué**, no el **qué**.
- Archivos kebab-case; una clase por archivo; identificadores en español y sufijos técnicos en inglés.
- Si un componente o service supera una responsabilidad clara, extraer. `admin.component.ts` es deuda existente: no hacerlo crecer.

## 5. Frontend

- Estructura: `core/` (auth, guards, interceptors, servicios globales), `shared/` (componentes presentacionales, modelos, servicios, utils), `features/` (un dominio por carpeta).
- Componentes standalone. Estado local con `signal`/`computed`; RxJS con `takeUntilDestroyed`. No crear un store global nuevo sin pedido.
- HTTP **solo** en services (`core/services`, `shared/services` o `features/*/*.service.ts`). Un componente nunca usa `HttpClient` directamente.
- Modelos tipados en `shared/models` o junto al service. Sin `any`.
- Lógica pura en `shared/utils`. Formularios y validadores compartidos en `shared/forms`/`shared/validators`.
- Rutas con `loadComponent` y lazy loading por feature. Guards: `authGuard`, `adminGuard`, `anuncianteGuard`.
- No duplicar reglas de negocio del backend en la UI. El servidor vuelve a validar.
- Reutilizar antes de crear: `toast`, `spinner`, `avatar`, `listing-card`, `galeria-imagenes`, `availability-calendar`, clases `acct-*`.
- Responsive y accesible: probar escritorio y móvil, foco, teclado y textos alternativos.

El detalle está en `front/AGENTS.md`.

## 6. Seguridad

- Endpoints privados con `JwtAuthGuard`; administrativos con `RolesGuard` + `@Roles('Administrador')`.
- La propiedad del recurso se valida en el **service**, no en el guard del frontend.
- Validar tipo, formato, tamaño y valores permitidos en la frontera; validar permisos sobre el recurso concreto.
- Consultas parametrizadas. Nunca interpolar entrada del usuario en SQL.
- No exponer contraseñas, tokens, documentos, CUIT ni datos de contacto privados en respuestas públicas.
- Contraseñas: mínimo 12 caracteres Unicode, una letra, un número y un símbolo; máximo 72 bytes UTF-8; bcrypt entre 12 y 31.
- No registrar secretos ni datos sensibles. Limitar la información en errores y logs.
- Archivos: validar MIME y tamaño; almacenamiento privado con URLs firmadas.
- Webhook de Mercado Pago: validar firma cuando `MP_WEBHOOK_SECRET` esté configurado.
- CORS restringido por `FRONTEND_URLS`.

Ver `back/docs/seguridad.md` y la skill `verificar-seguridad-del-cambio`.

## 7. Testing y verificación

- Backend: `test/*.test.cjs` con `node:test`. Los scripts `test:*` compilan antes de ejecutar.
- No crear archivos `.spec`. La única excepción existente son los CP de `back/test/jest/**/*.spec.ts`; no agregar nuevos.
- Las pruebas usan servicios reales con PGlite y proveedores simulados. No tocar PostgreSQL compartido, correo, pagos ni archivos reales.
- Frontend: `npm run build` es la verificación principal; `test:imagenes-inicio` y `test:vitalidad` cubren regresiones puntuales.
- **Baseline conocido (20/11/2026):** `test:condiciones-economicas` pasa 28/29. El fallo es preexistente: el mock no implementa `reembolsosService.registrarPagoTardio`. No atribuirlo a cambios nuevos.
- Jest (`npm run test:jest`) requiere Node ≥ 24.9. Con Node 22 no se ejecuta; no cambiar la versión del proyecto por eso.
- Si el cambio toca un dominio con script propio, ejecutarlo. Ejemplos:
  - publicaciones: `test:papelera-publicaciones`, `test:publicaciones-bloqueadas`, `test:paginacion-admin`.
  - reservas/cancelaciones: `test:cancelaciones-devoluciones`, `test:bloqueo-anunciante`.
  - liquidaciones: `test:liquidaciones`, `test:liquidaciones-entidad`.

## 8. Git, alcance y deploy

- Rama por persona o feature. No trabajar directo sobre `main`.
- Commits chicos con prefijos observados: `feat(...)`, `fix(...)`, `docs(...)`, `refactor(...)`, `test(...)`.
- Hacer pull de `main` seguido y resolver conflictos al momento.
- No commitear `.env`, `dist`, `node_modules` ni resultados locales de performance.
- El backend se despliega solo con push a `main` y cambios en `back/**`.
- El frontend se publica en Vercel desde `vercel.json`.
- Una rama de feature no está deployada hasta mergearla a `main`.

## 9. Skills del proyecto

Están en `.agents/skills/`. Para cualquier cambio de código, leer primero `implementacion-segura` y aplicar las demás en este orden:

1. `verificar-arquitectura-backend` — capas, módulos, entidades y persistencia.
2. `reutilizar-capas-backend` — reusar controller/service/repository antes de crear archivos.
3. `organizar-dto` — ubicación y validación del contrato de entrada.
4. `decidir-enum-o-entidad` — catálogos y modelado de estados/tipos.
5. `verificar-seguridad-del-cambio` — entradas, permisos, secretos e integraciones.

No hay skill específica de frontend: las reglas están en `front/AGENTS.md`.
Las skills globales de UI (`impeccable`, `frontend-design`, `accessibility`, `web-design-guidelines`) son opcionales y no normativas.

## 10. Deuda declarada

Está detallada en `docs/arquitectura.md` §9. Resumen al 20/11/2026:

- **`EntityManager` en services:** 12 services lo importan (`anunciantes`, `cancelaciones`, `disponibilidad`, `disputas`, `liquidaciones`, `operaciones-reserva`, `pagos`, `publicaciones`, `reclamos`, `reembolsos`, `reservas`, `usuarios`). No agregar más.
- **Acceso cruzado desde repositorios:** `PublicacionesRepository` consulta `Reserva`; `UsuariosRepository` consulta `Reserva`, `Pago` y `Anunciante`; `ReclamosRepository` importa `Usuario`.
- **`HttpClient` en componentes:** `reserva-resultado.component.ts` y `reembolso-chat.component.ts`.
- **`confirm()` nativo:** `admin.component.ts` (3 usos) y `publication-detail.component.ts` (WhatsApp).
- **`admin.component.ts` gigante:** concentra dashboard, usuarios, publicaciones, reembolsos y catálogos.
- **Duplicación en frontend:** paginador y formato de importes repetidos en varias pantallas.

Regla de convivencia: no agregar deuda nueva; al tocar un archivo, extraer la parte violatoria si es local y de bajo riesgo. No hacer un refactor masivo sin plan y pruebas.

## 11. Gotchas verificados

- **Mercado Pago:** `auto_return: 'approved'` exige `back_urls.success` HTTPS. Con `http://localhost` falla con `invalid_auto_return`; usar túnel HTTPS u omitir `auto_return` en local.
- **Webhook de Mercado Pago:** si `MP_WEBHOOK_SECRET` está vacío, no se valida la firma. Configurarlo en entornos desplegados.
- **Verificación facial:** `VALIDAR_COINCIDENCIA_DNI=false` es solo bypass local; en producción debe ser `true`.
- **Modelos face-api:** `nest build` copia `src/models` a `dist/models`. No borrar esa carpeta.
- **Frontend:** `npm run build` puede fallar sin red por Google Fonts; reintentar o usar configuración de desarrollo.
- **Presupuesto de bundle:** el build del front ya supera el presupuesto de 500 kB y el SCSS de `publication-detail`. Son advertencias preexistentes; no ocultarlas con cambios de configuración sin pedido.
- **`synchronize: false`:** ningún cambio de entidad modifica la base por sí solo. Si cambia el esquema, hay migración y confirmación explícita.

## 12. Checklist antes de cerrar

### Backend

- [ ] El controller solo delega; no accede a repositorios ni a TypeORM.
- [ ] La lógica de negocio está en el service.
- [ ] El repository solo consulta y persiste; no lanza excepciones HTTP.
- [ ] La entidad solo tiene decoradores, columnas, relaciones y enums.
- [ ] No se importan repositorios ajenos ni se consultan entidades de otro módulo fuera de relaciones.
- [ ] No se agregó `EntityManager` a un service nuevo.
- [ ] Los DTOs validan la entrada y no se usa una entidad como DTO.
- [ ] Los errores se traducen en el service y no filtran datos sensibles.
- [ ] Se ejecutaron `lint`, `build` y el `test:*` del dominio.

### Frontend

- [ ] El componente no usa `HttpClient` directamente.
- [ ] La lógica pura está en `shared/utils` y los modelos están tipados.
- [ ] El estado local usa signals; no se agregó un store global.
- [ ] Se reutilizaron componentes y estilos existentes.
- [ ] Se probó escritorio y móvil.
- [ ] Se ejecutó `npm run build`.

### General

- [ ] No se modificó la base ni se aplicaron migraciones sin confirmación.
- [ ] No se agregaron dependencias ni patrones nuevos sin justificación.
- [ ] El diff resuelve el pedido completo y respeta el alcance.
- [ ] Si cambió una regla de arquitectura, se actualizó `docs/arquitectura.md`.
