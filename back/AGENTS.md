# AGENTS.md — Backend

> Reglas específicas de `back/`. Complementa el `AGENTS.md` de la raíz.
> Última revisión: 20/11/2026.

## 1. Anatomía de un módulo

```text
back/src/<dominio>/
├── <dominio>.module.ts
├── controller/<nombre>.controller.ts
├── service/<caso-de-uso>.service.ts
├── repository/<nombre>.repository.interface.ts
├── repository/<nombre>.repository.ts
├── entity/<nombre>.entity.ts
├── dto/<accion>-<sustantivo>.dto.ts
└── proveedor/            # solo integraciones externas
    ├── <proveedor>.interface.ts
    └── <proveedor>.adapter.ts
```

- Archivos kebab-case, una clase por archivo.
- Nombres en español; sufijos técnicos en inglés (`Service`, `Repository`, `DTO`, `Adapter`).
- No crear un módulo nuevo si el concepto pertenece a uno existente.
- No crear una capa nueva para un caso aislado.

## 2. Capas y límites

### Controller

- Solo routing, guards, pipes, DTOs y delegación.
- No accede a repositorios, `DataSource` ni `EntityManager`.
- No decide reglas de negocio ni hace `try/catch` de dominio.
- Puede validar transporte (MIME, tamaño, `ParseIntPipe`) y usar `@Req()`.
- Usa `JwtAuthGuard`, `RolesGuard` y `@Roles('Administrador')` donde corresponda.

### Service

- Es dueño de la lógica: validaciones, autorización de dominio, cálculos, estados, plazos, idempotencia, orquestación y transacciones.
- Un método público = un caso de uso.
- Puede inyectar su repositorio y services exportados por otros módulos.
- No conoce `Request`/`Response`.
- Puede lanzar excepciones de aplicación de Nest; es la frontera del caso de uso.
- Si crece demasiado, se parte por caso de uso (`reserva-reprogramacion.service.ts`, `reserva-finalizacion.service.ts`).

### Repository

- Solo consultas y persistencia: `find`, `findOne`, `save`, `update`, `delete`, `createQueryBuilder`, agregaciones, paginación, locks y transacciones.
- No decide reglas, no calcula estados, no llama a services ni a otros repositorios.
- No lanza excepciones HTTP.
- Traduce errores de integridad con `common/persistence` (`ValorDuplicadoError`, `RegistroEnUsoError`, `guardarSinDuplicados`).
- Puede cargar relaciones TypeORM declaradas en su entidad, aunque pertenezcan a otro módulo.

### Entity

- Solo decoradores, columnas, relaciones y enums de tabla.
- Declarar explícitamente `name` en cada columna, incluida la clave.
- Usar `Relation<T>` para relaciones.
- Sin métodos, getters, setters, constructores con lógica, hooks (`@AfterLoad`, etc.) ni `toJSON`.
- Los estados derivados se calculan en services de consulta.

### DTO

- Ubicación: `dto/` del módulo dueño del contrato.
- Validación de formato con `class-validator`.
- Las reglas que consultan datos o dependen del dominio van al service.
- Un DTO por caso de uso; no usar una entidad como DTO de entrada.
- Sin lógica en el DTO.

## 3. Contrato de repositorio

Siempre dos archivos:

```ts
// repository/publicaciones.repository.interface.ts
export const PUBLICACIONES_REPOSITORY = 'PUBLICACIONES_REPOSITORY';

export interface IPublicacionesRepository {
  buscarPorId(id: number): Promise<Publicacion | null>;
  guardar(publicacion: Publicacion): Promise<Publicacion>;
}
```

```ts
// publicaciones.module.ts
providers: [
  PublicacionesRepository,
  { provide: PUBLICACIONES_REPOSITORY, useExisting: PublicacionesRepository },
  PublicacionesService,
],
exports: [PublicacionesService],
```

- El service inyecta por token y tipo interface.
- El módulo nunca exporta la implementación del repositorio.
- No existe un repositorio genérico/base: cada módulo declara sus métodos explícitos.

## 4. Transacciones

- El repositorio abre la transacción y entrega un repositorio transaccional más el `EntityManager`.
- Los services que participan reciben el `EntityManager` por parámetro.
- Patrón:

```ts
const guardada = await this.reservaRepository.conTransaccion(
  async (reservaRepository, transaccion) => {
    const reserva = await reservaRepository.buscarPorId(id, transaccion);
    await this.otroService.operar(reserva, transaccion);
    return reservaRepository.guardar(reserva);
  },
);
```

- No abrir transacciones nuevas con TypeORM dentro de un service.
- No hay transacciones distribuidas: usar idempotencia y compensación.
- Las llamadas externas (correo, pasarela, storage) van después del commit.

**Deuda:** 12 services importan `EntityManager` (`anunciantes`, `cancelaciones`, `disponibilidad`, `disputas`, `liquidaciones`, `operaciones-reserva`, `pagos`, `publicaciones`, `reclamos`, `reembolsos`, `reservas`, `usuarios`). No agregar más. Al tocar uno, evaluar si la parte nueva puede vivir en el repositorio.

## 5. DTOs y validación

- El `ValidationPipe` global de `main.ts` aplica `whitelist` y `forbidNonWhitelisted`.
- Varios controllers repiten un `ValidationPipe` por ruta con `transform`; conservar el patrón existente del módulo.
- Validar formato con decoradores; validar negocio en el service.
- Rechazar `null` en campos obligatorios: `@IsOptional()` deja pasar `null` y puede llegar a una columna NOT NULL.
- Los mensajes de error deben ser claros y no filtrar datos internos.

## 6. Estados y catálogos

- Los estados persistidos viven en `ambito`/`estado`, con FK compuesta y `CHECK` del ámbito.
- Los códigos TypeScript se exportan desde `catalogos/codigos-catalogo.ts`.
- `npm run db:seed` carga roles, ámbitos, estados, modalidades, monedas, tipos y ubicaciones. Es idempotente (`ON CONFLICT DO NOTHING`).
- `CatalogosService.onModuleInit()` exige los estados iniciales; no borrar ni renombrar códigos sin migración.
- No crear un enum nuevo para un estado persistido sin consultar (`decidir-enum-o-entidad`).
- Los estados derivados (`estado_estadia`, capacidades) se calculan en services de consulta, no en entidades.

## 7. Errores y persistencia

- Repositorio: propaga el error original o traduce integridad en `common/persistence`.
- Service: traduce a excepción de aplicación y registra contexto.
- Controller: sin `try/catch` salvo mapeo de transporte.
- Sin `catch` vacíos ni datos sensibles en logs o mensajes.
- Para paginación reutilizar `common/persistence/paginacion.ts` (`paginar`, `Pagina<T>`).

## 8. Integraciones externas

- Interface + token en `<módulo>/proveedor/` (por ejemplo `mercado-pago/proveedor/`).
- Mail y almacenamiento conservan sus contratos: `MAIL_SERVICE`, `ARCHIVO_REPOSITORY`.
- El adapter traduce errores de infraestructura; el service decide qué hacer.
- Respetar timeouts, límites de tamaño y validación de respuestas.

## 9. Seguridad por endpoint

- Endpoint privado: `JwtAuthGuard`. Administrativo: `RolesGuard` + `@Roles('Administrador')`.
- Validar propiedad del recurso en el service, no solo en el frontend.
- No confiar en IDs del body para decidir el usuario: usar la identidad del JWT.
- Consultas parametrizadas; nunca interpolar entrada en SQL.
- Validar MIME/tamaño de archivos y no exponer URLs privadas.
- No devolver entidades con datos sensibles; filtrar campos en DTOs de respuesta.
- Contraseñas: política de `docs/seguridad.md` (12 caracteres, 72 bytes, bcrypt 12–31).
- Webhook de Mercado Pago: validar firma si `MP_WEBHOOK_SECRET` está configurado.

## 10. Testing

- Archivos `test/*.test.cjs` con `node:test` y `assert/strict`.
- Los scripts `test:*` compilan antes de ejecutar. No existe `npm test`.
- No crear `.spec`; la única excepción son los CP de `test/jest/**/*.spec.ts` (requieren Node ≥ 24.9).
- Pruebas sin base real: usar PGlite/mocks de `test/soporte/`.
- Para migraciones/seed: base descartable; ejecutar el seed dos veces y verificar idempotencia.
- **Baseline 20/11/2026:** `test:condiciones-economicas` 28/29. El fallo es preexistente (mock sin `registrarPagoTardio`). No atribuirlo a cambios nuevos.

Comandos útiles:

```bash
npm run lint
npm run build
npm run test:condiciones-economicas
npm run test:papelera-publicaciones
npm run test:publicaciones-bloqueadas
npm run test:paginacion-admin
npm run test:cancelaciones-devoluciones
npm run test:bloqueo-anunciante
npm run test:liquidaciones
npm run test:liquidaciones-entidad
node --test test/*.test.cjs   # suite completa; compilar antes
```

## 11. Mapa de módulos

| Grupo | Módulos |
|---|---|
| Identidad y acceso | `auth`, `seguridad`, `usuarios`, `usuarios-consulta` |
| Anunciantes | `anunciantes`, `verificacion-anunciante` |
| Catálogo | `publicaciones`, `ubicacion`, `imagenes`, `catalogos`, `favoritos`, `mensajes` |
| Reservas | `disponibilidad`, `reservas`, `cancelaciones`, `reservas-consulta`, `bloqueo-anunciante` |
| Dinero | `cotizaciones`, `pagos`, `mercado-pago`, `operaciones-reserva`, `reembolsos`, `disputas`, `reclamos` |
| Liquidaciones | `liquidaciones` |
| Infraestructura | `mail`, `almacenamiento`, `common`, `models` |

Notas:

- `liquidaciones` y `pagos` no tienen controller propio: las rutas se coordinan desde `operaciones-reserva`.
- `mercado-pago` usa `proveedor/`, no repositorio.
- `disputas` sigue existiendo aunque el modelo v3.1 retira la entidad de disputa. No ampliar su alcance sin decisión.
- `common/` solo contiene código transversal sin reglas de dominio.

## 12. Deuda y límites

- No agregar `EntityManager` a services nuevos.
- No hacer que un repositorio consulte tablas de otro módulo.
- No agregar lógica a entidades.
- No duplicar validaciones entre controller y service.
- No agregar dependencias nuevas sin justificación.
- No aplicar migraciones ni scripts `--aplicar` sin confirmación.

El detalle actualizado está en `../docs/arquitectura.md` §9.

## 13. Checklist backend

- [ ] Controller delgado y con guards correctos.
- [ ] Lógica y autorización de dominio en el service.
- [ ] Repositorio con interface + token y sin reglas.
- [ ] Entidad anémica con columnas explícitas.
- [ ] DTO validado; sin `null` en campos obligatorios.
- [ ] Transacción en el repositorio, no en el service.
- [ ] Errores traducidos sin filtrar datos sensibles.
- [ ] `lint`, `build` y `test:*` del dominio ejecutados.
