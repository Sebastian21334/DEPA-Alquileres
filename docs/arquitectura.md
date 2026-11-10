# Arquitectura y políticas de código — DEPA

> Documento de detalle del proyecto. Las reglas normativas están en `AGENTS.md` §4.3 y §4.4; este documento explica la arquitectura, los patrones canónicos y la deuda técnica.
> Última revisión: 08/11/2026.
> Si hay contradicción entre este documento y `AGENTS.md`, prevalece `AGENTS.md`.

## 1. Propósito y alcance

Este documento fija el modelo arquitectónico del sistema y el criterio para decidir dónde va cada cambio. Alcanza a:

- `Proyect/back`: NestJS, TypeORM y PostgreSQL.
- `Proyect/front`: Angular standalone con signals.
- La documentación de dominio en `Proyect/back/docs/`.

No describe el detalle funcional de cada caso de uso; para eso están los documentos de dominio y el código. Su objetivo es que un agente o un desarrollador nuevo pueda responder sin ambigüedad:

1. ¿En qué capa va este cambio?
2. ¿Puede este módulo comunicarse con tal otro? ¿Por dónde?
3. ¿Esta consulta va en el repository o en el service?
4. ¿Esta regla puede vivir en la entidad?
5. ¿Qué deuda existe y qué no se debe replicar?

Estas políticas formalizan la revisión de arquitectura del 08/11/2026: comunicación entre módulos solo por services, lógica de negocio en el service, repositorios con interface + implementación y solo acceso a datos, y entidades TypeORM con decoradores sin mapeo.

## 2. Decisiones de arquitectura aceptadas

Estas decisiones son deliberadas. No se cambian sin pedido explícito y sin actualizar este documento.

- **Monolito modular:** un solo backend NestJS, organizado por dominios. No microservicios, no event bus, no CQRS como framework.
- **Entidades TypeORM con decoradores:** la entidad es el modelo de persistencia y se lee directamente. No hay modelo de dominio separado ni mappers.
- **Acoplamiento aceptado:** las entidades conocen TypeORM. Ese acoplamiento no se extiende a controllers ni services.
- **Repositorios explícitos:** todo módulo que accede a datos declara su interface, su token y su implementación. No hay repositorio genérico ni base class.
- **PostgreSQL con `synchronize: false`:** el esquema se aplica con migraciones/scripts de `Proyect/back/migrations/`.
- **Frontend standalone + signals:** no se agrega NgRx ni un store global nuevo sin pedido explícito.
- **API REST:** los controllers exponen endpoints HTTP y delegan en services.
- **Tipos y enums cruzados:** se permite `import type` de entidades ajenas y enums/constantes de estado exportados por el módulo dueño. No habilitan consultas ni persistencia.

Lo que **no** se agrega sin pedido explícito:

- Carpeta `domain/` o `application/` con modelos paralelos.
- Mappers entidad ↔ modelo de dominio.
- Repositorio base genérico.
- Librería de estado global en el frontend.
- Patrones de mensajería/eventos entre módulos.

## 3. Vista de capas

```text
┌──────────────────────────┐
│ Controller               │  HTTP, guards, pipes, DTOs
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐        ┌──────────────────────────┐
│ Service                  │───────▶│ Service de otro módulo   │
│ lógica, estados, cálculos│        │ API pública del módulo   │
└────────────┬─────────────┘        └──────────────────────────┘
             │
┌────────────▼─────────────┐
│ Repository               │  consultas, persistencia, locks
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│ Entity                   │  columnas, relaciones, enums
└──────────────────────────┘
```

| Capa | Responsabilidad | Puede depender de | No puede |
|---|---|---|---|
| `controller` | Routing, guards, pipes, DTOs y delegación | `service`, DTOs, guards | Repositorios, TypeORM, otro controller |
| `service` | Lógica de negocio, validaciones, estados, cálculos, orquestación y transacciones | Su repositorio, services de otros módulos, ports | TypeORM, `Request`/`Response`, repositorios ajenos |
| `repository` | Consultas y persistencia | Entidades, TypeORM, `common/persistence` | Services, otros repositorios, excepciones HTTP |
| `entity` | Columnas, relaciones y enums de tabla | TypeORM y entidades relacionadas | Services, repositorios, lógica de negocio |

### Flujo de un request

Ejemplo: `POST /reservas`.

1. `ReservasController` valida el DTO y llama a `ReservasService`.
2. `ReservasService` aplica las reglas del caso de uso y consulta su `IReservaRepository`.
3. `ReservaRepository` ejecuta la consulta/persistencia con TypeORM.
4. `Reserva` solo aporta columnas y relaciones.
5. Si el caso de uso necesita disponibilidad, `ReservasService` llama a `DisponibilidadService`; nunca a `FechaRepository`.

## 4. Estructura backend

```text
Proyect/back/src/
├── <dominio>/
│   ├── <dominio>.module.ts
│   ├── controller/
│   │   └── <nombre>.controller.ts
│   ├── service/
│   │   └── <caso-de-uso>.service.ts
│   ├── repository/
│   │   ├── <nombre>.repository.interface.ts
│   │   └── <nombre>.repository.ts
│   ├── entity/
│   │   └── <nombre>.entity.ts
│   └── dto/
│       └── <accion>-<sustantivo>.dto.ts
├── common/
│   ├── almacenamiento/
│   ├── dto/
│   ├── persistence/
│   └── utils/
├── seguridad/
└── models/          # modelos de face-api; no borrar
```

Un módulo nuevo debe:

- Tener `<dominio>.module.ts`.
- Declarar solo los providers y controllers que usa.
- Exportar únicamente services, guards o ports que otros módulos necesiten.
- Registrar su repositorio con interface + token + implementación.
- No exportar repositorios.

## 5. Mapa de módulos

| Módulo | Responsabilidad | API exportada | Depende de |
|---|---|---|---|
| `auth` | Registro, login, verificación de email, recuperación y cambio de contraseña | — | `usuarios`, `mail`, `seguridad` |
| `usuarios` | Cuentas, roles, perfil, baja lógica, bloqueo, foto y administración | `UsuariosService`, `UsuariosCredencialesService` | `catalogos`, `mail`, `seguridad`, `almacenamiento` |
| `anunciantes` | Datos del anunciante y guard de anunciante verificado | `AnunciantesService`, `AnuncianteGuard` | TypeORM |
| `verificacion-anunciante` | Alta de anunciante, documentación inmobiliaria, revisión manual, prueba de vida y eliminación de documentos | — | `usuarios`, `anunciantes`, `catalogos`, `mail`, `seguridad` |
| `publicaciones` | CRUD de publicaciones, catálogo público, bajas administrativas y política de visibilidad | `PublicacionesService` | `anunciantes`, `catalogos`, `mail`, `seguridad`, `ubicacion` |
| `imagenes` | Subida, orden y eliminación de imágenes de publicaciones | — | `anunciantes`, `publicaciones`, `seguridad`, `almacenamiento` |
| `disponibilidad` | Calendario por día, bloqueos, reserva de fechas y transacción del calendario | `DisponibilidadService`, `TRANSACCION_CALENDARIO` (deuda D-01) | `publicaciones`, `seguridad` |
| `reservas` | Ciclo de vida de la reserva, expiración, confirmación, cancelación, reprogramación, código de alojamiento, liquidaciones y bloqueo de Anunciante | `ReservasService`, `ReservaEstadoService`, `ReservaCicloVidaService`, `ReservaCancelacionesService`, `ReservaBloqueoAnuncianteService`, `ReservaReembolsoAplicacionService`, `ReservaConsultaService`, `RESERVAS_TRANSACCIONALES` | `disponibilidad`, `usuarios`, `publicaciones`, `reembolsos`, `pagos`, `mail`, `notificaciones`, `seguridad` |
| `cotizaciones` | Cotización USD/ARS, actualización periódica e histórico administrativo | `CotizacionesService` | `seguridad` |
| `pagos` | Núcleo de estado y persistencia del pago | `PagosService`, `PAGOS_TRANSACCIONALES` | `pasarela` |
| `pagos-aplicacion` | Checkout, webhook, conciliación, presupuestos y consultas que cruzan pagos con reservas, reembolsos y disputas | — | `pagos`, `reservas`, `reembolsos`, `disputas`, `cotizaciones`, `disponibilidad`, `publicaciones`, `seguridad` |
| `reembolsos` | Solicitudes, ejecución automática o manual, confirmación, cancelación, reconciliación y consulta | `ReembolsosService` | `pagos`, `pasarela`, `notificaciones`, `seguridad` |
| `disputas` | Contracargos, resolución administrativa y cierre | `DisputasService` | `reservas`, `pagos`, `reembolsos`, `notificaciones`, `seguridad` |
| `reclamos` | Reclamos de reserva, evidencias, mensajes, resolución y cierre | `ReclamosService` | `reservas`, `pagos`, `reembolsos`, `notificaciones`, `almacenamiento`, `seguridad` |
| `bloqueo-anunciante` | Caso de uso de bloqueo de cuenta que coordina usuarios y reservas | `BloqueoAnuncianteService` | `usuarios`, `reservas`, `seguridad` |
| `notificaciones` | Avisos transaccionales de cancelaciones, reembolsos, reclamos, disputas y bloqueos | `NotificacionesService` | `mail`, `usuarios` |
| `mensajes` | Mensajería entre usuarios por publicación/reserva | — | `mail`, `publicaciones`, `reservas`, `usuarios`, `seguridad` |
| `favoritos` | Favoritos de publicaciones | — | `publicaciones`, `seguridad` |
| `catalogos` | Roles, tipos de anunciante/propiedad/moneda y modalidades | `CatalogosService` | `seguridad` |
| `ubicacion` | Provincias, ciudades y geocodificación | `UbicacionService` | `seguridad` |
| `mail` | Envío de correos por Azure Communication Services | `MAIL_SERVICE` | Config |
| `seguridad` | JWT, guards, roles y decoradores | `JwtModule`, `PassportModule`, `JwtAuthGuard`, `RolesGuard` | Config |
| `common/almacenamiento` | Azure Blob Storage | `ARCHIVO_REPOSITORY` | Config |
| `pagos/pasarela` | Adaptadores de Mercado Pago | `PASARELA_PAGOS`, `PASARELA_REEMBOLSOS` | Config |

### Grafo de dependencias

```text
pagos-aplicacion -> pagos, reservas, reembolsos, disputas, cotizaciones,
                    disponibilidad, publicaciones, seguridad
pagos            -> pasarela
reservas         -> disponibilidad, usuarios, publicaciones, reembolsos, pagos,
                    mail, notificaciones, seguridad
reembolsos       -> pagos, pasarela, notificaciones, seguridad
disputas         -> reservas, pagos, reembolsos, notificaciones, seguridad
reclamos         -> reservas, pagos, reembolsos, notificaciones, almacenamiento,
                    seguridad
bloqueo-anunciante -> usuarios, reservas, seguridad
notificaciones   -> mail, usuarios
mensajes         -> mail, publicaciones, reservas, usuarios, seguridad
publicaciones    -> anunciantes, catalogos, mail, seguridad, ubicacion
imagenes         -> anunciantes, publicaciones, seguridad, almacenamiento
favoritos        -> publicaciones, seguridad
```

El grafo es acíclico. Si aparece un ciclo, no se resuelve con `forwardRef`: se extrae lógica compartida a un módulo nuevo o se invierte la dependencia con un puerto.

### Relaciones TypeORM vs consultas cruzadas

Cargar una relación declarada en la entidad propia (`relations: { anunciante: true }`) es parte del mapeo y está permitido. Lo prohibido es inyectar `Repository<OtraEntidad>` o consultar una entidad ajena fuera de una relación declarada. Ejemplo: `publicaciones.repository.ts` puede cargar `publicacion.anunciante`, pero no inyectar `Repository<Reserva>`.

### Lecturas cruzadas que crearían ciclos

Si un módulo necesita datos de otro que ya lo importa, no se invierte la dependencia. Ejemplos:

- `publicaciones` no puede importar `reservas` porque `reservas` ya importa `publicaciones`.
- `usuarios` no puede importar `reservas` porque `reservas` ya importa `usuarios`.
- `pagos` no debe importar `disputas`, `reembolsos` ni `reservas`: esos casos de uso viven en `pagos-aplicacion`.
- `reembolsos` puede importar el núcleo `pagos`; la composición con reservas y disputas vive en los módulos de aplicación.

En esos casos se crea un **módulo de lectura/composición** que importa a ambos y expone el resultado, o se define un puerto en un módulo neutral. El módulo dueño no importa al consumidor.

### Flujos críticos

**Reserva y pago**

1. `PresupuestosService` (pagos) cotiza y firma las condiciones.
2. `ReservasService.crearPendiente` crea la reserva y bloquea el calendario.
3. `PagosService.crearCheckout` crea la preferencia de Mercado Pago.
4. El webhook entra por `PagosService.procesarWebhook`.
5. `ReservasService.confirmarPago` confirma y `DisponibilidadService.marcarComoReservadas` consolida las fechas.
6. `ReservaNotificacionesService` envía los correos.

**Cancelación y devolución**

1. `ReservasService.solicitarCancelacion` registra la solicitud.
2. El administrador la resuelve con `ReservasService.resolverSolicitudCancelacion`.
3. `ReembolsosService.crearSolicitud` / `ejecutar` ejecuta la devolución.
4. La pasarela confirma y `ReservasService.aplicarReembolsoConfirmado` actualiza la reserva.

**Reprogramación**

`ReservaReprogramacionService.actualizarFechas` valida el rango, llama a `DisponibilidadService.reprogramarReserva` y notifica al anunciante.

**Verificación de anunciante**

`VerificacionAnuncianteService.solicitarAlta` recibe los datos, `PruebaVidaService` valida la identidad, `AnunciantesService`/`UsuariosService` actualizan el estado y `MailService` envía el resultado.

**Reclamos y disputas**

`ReclamosService` y `DisputasService` abren el expediente y congelan la liquidación en una transacción local. La devolución se ejecuta fuera de la transacción; al confirmarse, se aplica a la reserva y se cierra el expediente en una segunda transacción. `NotificacionesService` avisa a las partes después de cada confirmación.

**Bloqueo de Anunciante**

`BloqueoAnuncianteService` cambia el bloqueo y llama a `ReservaBloqueoAnuncianteService`. Una reserva se preserva si está en curso (pago aprobado, fecha actual dentro del rango y código validado) o si ya finalizó. Las demás se cancelan; las que tienen pago aprobado generan una devolución total.

**Reclamo y disputa no son lo mismo**

Un reclamo es un expediente interno entre Inquilino, Anunciante y Administrador; puede resolverse con o sin devolución. Una disputa es un contracargo informado por Mercado Pago: el dinero ya fue debitado o retenido y la plataforma debe responder con evidencia. Un reclamo puede existir sin disputa y una disputa puede existir sin reclamo; ambos se vinculan por la reserva y el pago. `Reclamo.CERRADO` y `Disputa.CERRADA` son cierres administrativos posteriores a una resolución; `Reembolso.CANCELADO` anula una solicitud que todavía no movió dinero.

## 6. Patrones canónicos

### 6.1 Controller

```ts
@Controller('favoritos')
@UseGuards(JwtAuthGuard)
export class FavoritosController {
  constructor(private readonly favoritos: FavoritosService) {}

  @Get()
  listar(@Req() req: AuthenticatedRequest) {
    return this.favoritos.listar(req.user.id);
  }

  @Post(':idPublicacion')
  agregar(
    @Param('idPublicacion', ParseIntPipe) idPublicacion: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.favoritos.agregar(req.user.id, idPublicacion);
  }
}
```

El controller no decide si la publicación es visible, no consulta la base y no arma queries.

### 6.2 Service

```ts
async crearRol(datos: RolDto) {
  const existente = await this.catalogosRepo.buscarRolPorNombre(datos.nombre);
  if (existente) {
    throw new ConflictException(`Ya existe el rol '${datos.nombre}'`);
  }
  return this.catalogosRepo.crearRol(datos);
}
```

La regla de unicidad, el mensaje y la excepción viven en el service.

### 6.3 Repository: interface + implementación

```ts
export const FAVORITOS_REPOSITORY = 'FAVORITOS_REPOSITORY';

export interface IFavoritosRepository {
  buscarPorUsuario(idUsuario: number): Promise<Favorito[]>;
  existe(idUsuario: number, idPublicacion: number): Promise<boolean>;
  agregar(idUsuario: number, idPublicacion: number): Promise<void>;
  quitar(idUsuario: number, idPublicacion: number): Promise<void>;
}
```

```ts
@Injectable()
export class FavoritosRepository implements IFavoritosRepository {
  constructor(
    @InjectRepository(Favorito)
    private readonly favoritos: Repository<Favorito>,
  ) {}

  buscarPorUsuario(idUsuario: number): Promise<Favorito[]> {
    return this.favoritos.find({
      where: { usuario: { id: idUsuario } },
      relations: { publicacion: true },
      order: { creado_en: 'DESC' },
    });
  }

  existe(idUsuario: number, idPublicacion: number): Promise<boolean> {
    return this.favoritos.exists({
      where: { usuario: { id: idUsuario }, publicacion: { id: idPublicacion } },
    });
  }
}
```

El repository traduce la consulta, pero no decide si el favorito se puede agregar.

### 6.4 Entity

```ts
@Entity('favorito')
@Index(['usuario', 'publicacion'], { unique: true })
export class Favorito {
  @PrimaryGeneratedColumn({ name: 'id_favorito' })
  id: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Relation<Usuario>;

  @ManyToOne(() => Publicacion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_publicacion' })
  publicacion: Relation<Publicacion>;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creado_en: Date;
}
```

La entidad solo declara columnas y relaciones. La unicidad está en el índice de base de datos y la regla de negocio en el service.

### 6.5 Module

```ts
@Module({
  imports: [
    TypeOrmModule.forFeature([Favorito]),
    SeguridadModule,
    PublicacionesModule,
  ],
  controllers: [FavoritosController],
  providers: [
    FavoritosService,
    FavoritosRepository,
    { provide: FAVORITOS_REPOSITORY, useExisting: FavoritosRepository },
  ],
})
export class FavoritosModule {}
```

### 6.6 Comunicación entre módulos

```ts
@Injectable()
export class PagosService {
  constructor(
    private readonly reservasService: ReservasService,
    private readonly reembolsosService: ReembolsosService,
    private readonly disputasService: DisputasService,
  ) {}
}
```

El service consumidor depende de services exportados, no de los repositorios del otro módulo.

## 7. Deuda técnica

La deuda se declara para que no se replique. No es una lista de tareas para ejecutar en bloque. Las líneas corresponden al 08/11/2026; si el archivo cambió, ubicar el símbolo por nombre.

| ID | Evidencia | Regla | Corrección objetivo | Prioridad |
|---|---|---|---|---|
| D-01 | `disponibilidad/repository/transaccion-calendario.ts:7` importa `ReservaRepository`; `transaccion-calendario.interface.ts:2` expone `IReservaRepository` | ARQ-07, ARQ-09 | Puerto de transacción con operaciones (`bloquearPublicacion`, `marcarReservadas`, `liberar`, `reprogramar`) en el módulo dueño o en un módulo de composición; no exponer repositorios | Alta |
| D-02 | `reservas/service/reservas.service.ts:8`, `reserva-liquidaciones.service.ts:8`, `reserva-notificaciones.service.ts:14`, `reserva-reprogramacion.service.ts:13` importan el puerto anterior | ARQ-07 | Consumir `DisponibilidadService` o el puerto de operaciones de D-01 | Alta |
| D-03 | `publicaciones/repository/publicaciones.repository.ts:13-22` importa e inyecta `Repository<Reserva>` y consulta reservas | ARQ-07 | Módulo de lectura/composición o read model; no hacer que `publicaciones` importe `reservas` (ciclo) | Media |
| D-04 | `usuarios/service/usuarios.service.ts:21,22-29,60` usa `DataSource`, `EntityManager` y query builders sobre `Publicacion`, `Reserva` y `Pago` | ARQ-01, ARQ-03, ARQ-07, ARQ-09 | Repositorios por módulo, módulo de lectura/composición para el panel y puerto transaccional para la baja; no hacer que `usuarios` importe `reservas`/`pagos` (ciclo) | Alta |
| D-05 | `reservas/service/reserva-finalizacion.service.ts:2-3,15-16` inyecta `Repository<Reserva>` | ARQ-03, ARQ-04 | `IReservaRepository.marcarFinalizadas(fechaCorte)` | Media |
| D-06 | `disputas/service/disputas.service.ts:6-7,29-34` inyecta repositorios de `Disputa`, `Reserva` y `Pago` | ARQ-03, ARQ-07 | `IDisputasRepository` + `ReservasService`; para el pago, puerto/read model sin crear el ciclo `pagos` ↔ `disputas` | Media |
| D-07 | `reclamos/service/reclamos.service.ts:9-10,49-55` inyecta cuatro repositorios, uno de `Reserva` | ARQ-03, ARQ-07 | `IReclamosRepository` + services de reservas/reembolsos | Media |
| D-08 | `reembolsos/service/reembolsos.service.ts:11,50,63,71` usa `DataSource` y repositorios de `Pago`/`Reembolso` | ARQ-01, ARQ-03, ARQ-07, ARQ-09 | `IReembolsosRepository` con operaciones transaccionales; para el pago, puerto/read model o módulo de datos que evite el ciclo `pagos` ↔ `reembolsos` | Alta |
| D-09 | Entidades con lógica: `reserva.entity.ts` (~31 métodos), `solicitud-verificacion.entity.ts` (~17), `usuario.entity.ts` (~11), `publicacion.entity.ts` (~10), `fecha.entity.ts` (~6), `anunciante.entity.ts` (~6), `pago.entity.ts` (~5) y `modalidad.entity.ts` (hook + funciones de política) | ARQ-06 | Extraer a services o `politica-*.ts`; dejar solo decoradores, columnas y relaciones | Alta |
| D-10 | `imagenes/repository/imagenes.repository.ts:1,60` lanza `ConflictException`; `disponibilidad/repository/fecha.repository.ts:1,28` lanza `NotFoundException`; `verificacion-anunciante/repository/face-api-analisis.repository.ts:2,6,72,86` lanza excepciones HTTP | ARQ-04, ARQ-11 | Errores de infraestructura y traducción en el service | Media |
| D-11 | `imagenes/repository/imagenes.repository.ts:22-30,50-67` calcula `orden` y valida la galería; `verificacion-anunciante/repository/verificacion.repository.ts:73-98` aplica backoff; `reembolsos/repository/reembolsos.repository.ts:73` suma en JS; `publicaciones/repository/publicaciones.repository.ts:273-275` usa `sqlAdmiteReservaPorFecha` desde `catalogos/entity/modalidad.entity.ts` | ARQ-04 | La decisión va al service; el repository solo consulta/persiste | Media |
| D-12 | `cotizaciones/controller/cotizaciones.controller.ts:51` valida el rango de fechas | ARQ-02 | Mover al DTO o al service | Baja |
| D-13 | `disponibilidad/repository/fecha.repository.ts:19-28` consulta `Publicacion` para bloquearla; `imagenes/repository/imagenes.repository.ts:22,52` hace lo mismo | ARQ-07 | Operación de bloqueo en el módulo dueño o read model; no consultar tablas ajenas | Media |
| D-14 | `usuarios/repository/usuarios.repository.ts:44-53` hace `leftJoinAndMapOne` sobre `Anunciante` y usa `Anunciante.digitosCuit` | ARQ-06, ARQ-07 | `AnunciantesService` o read model de administración; la regla de CUIT fuera de la entidad | Media |
| D-15 | `mail/repository`, `ubicacion/repository` y `verificacion-anunciante/repository/face-api-analisis.repository.ts` son adaptadores externos dentro de `repository/` | ARQ-08 | Mover a `ports/`/`adapters/` cuando se toque el archivo | Baja |

### Actualización 09/11/2026 — refactor de los ítems 11 y 14

- **D-05 resuelto:** `ReservaFinalizacionService` usa `IReservaRepository.marcarFinalizadas(fechaCorte)`.
- **D-06 resuelto:** `IDisputasRepository`; `DisputasService` usa `DisputasUnitOfWork`, `ReservaCicloVidaService`, `PagosService` y `ReembolsosService`; la devolución externa se ejecuta fuera de la transacción y se aplica en una segunda fase.
- **D-07 resuelto:** `IReclamosRepository`; `ReclamosService` usa `ReclamosUnitOfWork` para reclamo y reserva, y no inyecta `Repository<Reclamo/Evidencia/Mensaje/Reserva>`.
- **D-08 resuelto:** `IReembolsosRepository` con operaciones transaccionales; `ReembolsosService` sin `DataSource` y sin acceso directo a `Pago`; `registrarOejecutar` centraliza el modo automático/manual.
- **D-09 parcial:** `Reserva`, `Pago` y `Reembolso` quedaron anémicas. `estado_estadia` vive en `ReservaEstadoService` y se expone con `ReservaConsultaService`. Siguen con comportamiento `SolicitudVerificacion`, `Usuario`, `Publicacion`, `Fecha`, `Anunciante` y `Modalidad`.
- **Pagos:** `PagosModule` quedó como núcleo sin dependencias de dominio; `PagosAplicacionModule` concentra checkout, webhook, conciliación y consultas.
- **Reclamos y disputas:** `ReclamosUnitOfWork` y `DisputasUnitOfWork` coordinan reclamo/disputa con reserva, pago y fechas; la llamada a Mercado Pago queda fuera de la transacción y se compensa o reintenta.
- **Reembolsos:** `registrarOejecutar` es el único punto que decide modo automático o manual; no hay condicionales de `MP_REFUNDS_ENABLED` en los casos de uso consumidores.
- **Notificaciones:** `NotificacionesModule` centraliza avisos de cancelaciones, reembolsos, reclamos, disputas y bloqueos.
- **Cierre de expedientes:** `Reclamo.CERRADO`, `Disputa.CERRADA` y `Reembolso.CANCELADO` tienen operaciones administrativas explícitas.
- **Pendiente:** D-01/D-02 (`transaccion-calendario` expone repositorios), D-03/D-04 (lecturas cruzadas de publicaciones y usuarios), D-10/D-11 (errores y reglas en repositorios) y D-12 a D-15.



1. **Congelar:** no se agregan violaciones nuevas. El checklist de `AGENTS.md` §8 se aplica en cada cambio.
2. **Extraer al tocar:** si un cambio obliga a modificar un archivo con deuda, se extrae la parte local y de bajo riesgo.
3. **Repositorios faltantes:** crear `IDisputasRepository` e `IReclamosRepository`, y ampliar `IUsuariosRepository` con los métodos que hoy están en los services.
4. **Puertos de transacción:** reemplazar `transaccion-calendario` por operaciones del módulo dueño; evitar exponer repositorios ajenos.
5. **Entidades:** extraer la lógica de `reservas` con pruebas de caracterización antes de tocar estados, plazos o liquidaciones.
6. **Refactors grandes:** no se mezclan con features. Cada uno debe tener alcance, pruebas y una actualización de este documento.

## 8. Frontend

### Estructura

```text
Proyect/front/src/app/
├── core/
│   ├── guards/
│   ├── interceptors/
│   └── services/
├── shared/
│   ├── components/
│   ├── directives/
│   ├── forms/
│   ├── models/
│   ├── pipes/
│   ├── services/
│   ├── utils/
│   └── validators/
├── features/
│   ├── admin/
│   ├── auth/
│   ├── home/
│   ├── mis-reservas/
│   └── ...
├── app.config.ts
└── app.routes.ts
```

### Reglas

- **`core/`** contiene singletons y infraestructura: autenticación, guards, interceptors, servicios globales. No depende de `features/`.
- **`shared/`** contiene piezas reutilizables y sin dependencia de una feature concreta.
- **`features/`** agrupa el dominio: componentes, servicios de API y modelos propios.
- Los componentes son standalone y usan `signals` para el estado local.
- Los componentes de `features/` orquestan; los de `shared/` son presentacionales.
- El HTTP vive en services. Un componente nunca inyecta `HttpClient` directamente.
- La lógica pura va en `shared/utils`; no se duplican reglas del backend.
- Las rutas usan `loadComponent` y guards de `core/guards`.
- No se agrega NgRx ni un store global nuevo sin pedido explícito.
- Verificación: `npm run build`; pruebas disponibles: `npm run test:imagenes-inicio` y `npm run test:vitalidad`.

### Ejemplo de service

```ts
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  listar() {
    return this.http.get<Publicacion[]>(`${this.api}/favoritos`);
  }

  agregar(idPublicacion: number) {
    return this.http.post(`${this.api}/favoritos/${idPublicacion}`, {});
  }
}
```

### Ejemplo de componente

```ts
@Component({
  selector: 'app-favorites',
  standalone: true,
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent {
  private readonly favoritosApi = inject(FavoritesService);
  protected readonly publicaciones = signal<Publicacion[]>([]);
  protected readonly cargando = signal(true);

  constructor() {
    this.favoritosApi.listar().subscribe((datos) => {
      this.publicaciones.set(datos);
      this.cargando.set(false);
    });
  }
}
```

## 9. Checklist de arquitectura

Además del checklist operativo de `AGENTS.md` §8:

- [ ] El módulo nuevo tiene `*.module.ts` y declara solo lo que usa.
- [ ] El controller no importa TypeORM, repositorios ni entidades para consultar.
- [ ] El service contiene la regla de negocio y no importa TypeORM.
- [ ] El repository tiene interface + token + implementación.
- [ ] El repository no llama a services, no decide estados y no lanza excepciones HTTP.
- [ ] La entidad no tiene métodos de negocio ni hooks con reglas.
- [ ] No se importa un repositorio de otro módulo.
- [ ] No se consultan ni persisten entidades de otro módulo; los imports de tipo/enums son solo para firmas.
- [ ] Las transacciones se resuelven por repositorio o puerto, no con `DataSource` en el service.
- [ ] Los DTOs validan la entrada.
- [ ] El frontend no usa `HttpClient` en componentes.
- [ ] Se actualizó este documento si cambió una regla.

## 10. Verificación rápida

Estas búsquedas, ejecutadas desde la raíz del workspace, ayudan a detectar violaciones nuevas. Algunos resultados son deuda conocida; la idea es que no aumenten.

```bash
# TypeORM en services
grep -R "from 'typeorm'" Proyect/back/src/*/service

# Repositorios o TypeORM en controllers
grep -R "InjectRepository\|DataSource\|EntityManager\|Repository<" Proyect/back/src/*/controller

# Servicios que importan repositorios de otro módulo
grep -R "from '../../.*/repository/" Proyect/back/src/*/service

# Entidades con métodos de negocio
grep -R "static \|^  [a-zA-Z_].*(" Proyect/back/src/*/entity/*.entity.ts

# Repositorios que lanzan excepciones HTTP
grep -R "Exception" Proyect/back/src/*/repository/*.repository.ts
```

## 11. Referencias

- `AGENTS.md` (raíz del workspace) — reglas normativas y operación.
- `Proyect/back/docs/estados-estadia.md` — estados de la estadía.
- `Proyect/back/docs/reprogramaciones.md` — reprogramación de reservas.
- `Proyect/back/docs/cotizaciones-cobros.md` — cotizaciones y cobros.
- `Proyect/back/docs/cancelaciones-devoluciones.md` — cancelaciones y devoluciones.
- `Proyect/back/docs/seguridad.md` — autenticación y roles.
- `Proyect/back/docs/verificacion-identidad.md` — verificación de identidad.
- `Proyect/back/docs/eliminacion-documentos.md` — eliminación de documentos.
- `Proyect/back/migrations/README.md` — migraciones y scripts de base.
- `Proyect/docs/checklist-14-dependencia.md` — checklist del ítem 14.
