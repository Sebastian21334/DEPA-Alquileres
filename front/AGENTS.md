# AGENTS.md — Frontend

> Reglas específicas de `front/`. Complementa el `AGENTS.md` de la raíz.
> Última revisión: 20/11/2026.

## 1. Stack y estructura

- Angular 22.1 standalone, TypeScript 6, signals, RxJS, formularios reactivos.
- Tailwind CSS 4 + SCSS por componente + clases globales `acct-*`.
- Lucide para iconos, Leaflet para mapas.
- La compilación genera solo navegador (`dist/front/browser`). No asumir SSR.

```text
front/src/app/
├── core/        # auth, guards, interceptors, servicios globales
├── shared/      # componentes presentacionales, modelos, servicios, utils, forms
└── features/    # un dominio por carpeta, con componentes y services propios
```

## 2. Componentes y estado

- Componentes standalone. No crear `NgModule` nuevos.
- Usar `inject()` para dependencias; evitar constructores largos.
- Estado local con `signal`, `computed` y `effect` solo cuando sea necesario.
- RxJS con `takeUntilDestroyed` o `DestroyRef`; no dejar suscripciones abiertas.
- No crear un store global nuevo sin pedido explícito. El estado compartido va en services con signals.
- Los componentes de `features/` orquestan; los de `shared/` son presentacionales.
- Mantener los componentes chicos. Si una pantalla concentra varias responsabilidades, extraer componentes presentacionales o un service.
- `admin.component.ts` es deuda existente: no hacerlo crecer. Al tocar una sección, evaluar extraerla.

## 3. HTTP y contratos

- HTTP **solo** en services (`core/services`, `shared/services` o `features/*/*.service.ts`).
- Un componente nunca usa `HttpClient` directamente.
- La URL base sale de `environment.apiUrl`; no hardcodear hosts.
- Tipar request y response; usar modelos de `shared/models` o interfaces junto al service.
- No replicar reglas de negocio del backend. El servidor vuelve a validar permisos, estados y cálculos.
- Manejar errores con mensajes claros y `toast` cuando corresponda.

Deuda actual: `reserva-resultado.component.ts` y `reembolso-chat.component.ts` usan `HttpClient` directamente. No agregar casos nuevos; al tocar esos archivos, mover la llamada al service.

## 4. Modelos, utils y formularios

- Modelos tipados en `shared/models` o junto al service. Sin `any`.
- Lógica pura en `shared/utils` (`rental-dates.ts`, `reservation-state.ts`, `orden-imagenes.ts`, `home-card-image.ts`).
- Formularios reactivos con validadores explícitos.
- El formulario de publicación es compartido: `shared/forms/publicacion-formulario.ts`. No duplicar controles ni validaciones en crear/editar.
- Validadores reutilizables en `shared/validators`; directivas en `shared/directives`.
- Los mensajes de error deben ser claros y mostrarse junto al campo.

## 5. Reutilización

Antes de crear un componente, revisar `shared/components`:

| Componente | Uso |
|---|---|
| `toast` + `ToastService` | Avisos de éxito, error, advertencia e info |
| `spinner` | Estados de carga |
| `avatar` | Foto o iniciales de usuario |
| `listing-card` | Tarjeta de publicación |
| `galeria-imagenes` | Galería y reordenamiento |
| `availability-calendar` | Calendario de disponibilidad |
| `selector-ubicacion` / `location-picker` | Provincia, ciudad y mapa |
| `chat-dock` / `conversation-panel` | Mensajería |
| `claim-history` / `reembolso-chat` | Reclamos y reembolsos |

- El paginador está duplicado en varias pantallas. Si se necesita de nuevo, extraer uno compartido en `shared/components`.
- El formato de importes está repetido. Reutilizar o extraer a `shared/utils`; no agregar otra variante.
- Reutilizar las clases globales `acct-card`, `acct-grid`, `acct-field`, `acct-alert`, `acct-btn` antes de crear estilos nuevos.

## 6. Rutas y guards

- Lazy loading con `loadComponent` por feature.
- Guards existentes: `authGuard`, `adminGuard`, `anuncianteGuard`.
- Respetar el orden de rutas específicas antes de las paramétricas (`publicaciones/nueva` antes de `publicaciones/:id`).
- Los guards del frontend son UX; la autorización real vive en el backend.
- Rutas administrativas con `canActivate: [adminGuard]` y `data` cuando corresponda.

## 7. Estilos, responsive y accesibilidad

- Estilos globales en `src/styles.css` y `src/app/app.css`; estilos del componente en su `.scss`.
- Tailwind 4 para utilidades; no mezclar con frameworks CSS nuevos.
- Evitar estilos inline extensos; si el componente crece, mover a `.scss`.
- Mobile first: probar escritorio y móvil en cada cambio de UI.
- Usar HTML semántico, `label` asociado, foco visible, navegación por teclado y `alt` descriptivo.
- No depender solo del color para comunicar estado.
- Respetar `prefers-reduced-motion` en animaciones.

## 8. Testing y verificación

```bash
npm start
npm run build
npm run test:imagenes-inicio
npm run test:vitalidad
```

- `npm run build` es la verificación principal.
- Usar `npm start`, no `ng serve`: el script limita workers de Angular.
- El build puede fallar sin red por Google Fonts; reintentar.
- Advertencias preexistentes: bundle inicial > 500 kB y `publication-detail.component.scss` > 12 kB. No ocultarlas cambiando presupuestos sin pedido.
- Tests en `test/*.cjs` con `node:test`; no crear frameworks nuevos.

## 9. Deuda y límites

- `HttpClient` en componentes (`reserva-resultado`, `reembolso-chat`).
- `confirm()` nativo en `admin.component.ts` y `publication-detail.component.ts`. Al tocar T03/T57, reemplazar por un diálogo propio.
- `admin.component.ts` gigante: no agregar lógica nueva sin extraer.
- Paginador y formato de importes duplicados.
- No crear un store global nuevo.
- No duplicar reglas de negocio del backend.
- No agregar dependencias de UI sin justificación.

## 10. Checklist frontend

- [ ] El componente no usa `HttpClient` directamente.
- [ ] La llamada HTTP vive en un service y está tipada.
- [ ] El estado local usa signals; no se agregó un store global.
- [ ] Se reutilizaron componentes, clases y utils existentes.
- [ ] Los formularios validan y muestran errores claros.
- [ ] Se probó escritorio y móvil.
- [ ] Se revisó foco, teclado y textos alternativos.
- [ ] `npm run build` pasa.
