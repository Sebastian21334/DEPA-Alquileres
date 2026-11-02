# Seguridad, autenticación y usuarios

## Responsabilidades

- `SeguridadModule`: configuración compartida de JWT y Passport, `JwtAuthGuard`,
  `RolesGuard` y el decorador `Roles`. No consulta usuarios ni otros datos de negocio.
- `AuthModule`: coordina registro, ingreso, verificación de correo, cambio de contraseña y recuperación.
  Registra una sola `JwtStrategy`, que consulta el estado y el rol actuales del usuario.
- `UsuariosModule`: mantiene dos servicios sobre el mismo contrato de repositorio.
  `UsuariosService` administra alta, datos, perfil, fotos, roles y bloqueos.
  `UsuariosCredencialesService` administra hash y comparación de contraseñas,
  tokens de correo y recuperación, su vigencia y su consumo.

Los módulos que necesitan proteger endpoints o firmar autorizaciones importan
`SeguridadModule`. `AuthModule` permanece registrado en `AppModule` para que
Passport disponga de la estrategia JWT al iniciar la aplicación.

La dirección de dependencias es Auth → Usuarios → Catálogos y, desde cada uno,
hacia Seguridad. Ningún módulo de negocio necesita importar Auth para utilizar
JWT o guards compartidos. Esta separación elimina el ciclo previo y su uso de
`forwardRef`.

## Autorización por funcionalidad

`AnuncianteGuard` pertenece a `anunciantes/guards` y utiliza `AnunciantesService`.
`PropietarioPublicacionGuard` pertenece a `disponibilidad/guards` y utiliza
`DisponibilidadService`. Conservan sus controles y se ejecutan después del guard
JWT. Seguridad no importa esos módulos.

Las utilidades de fechas e importes, el error de registro en uso y
`AlmacenamientoModule` se mantienen en `common`.

## Política de contraseñas

Registro, cambio autenticado y restablecimiento exigen la misma definición en front y back:
al menos 12 caracteres Unicode, una letra (incluidas letras con tilde), un
número del 0 al 9 y un símbolo (puntuación o símbolo Unicode, incluidos emojis).
No se permiten espacios ni caracteres de control o formato invisibles. No es
obligatorio combinar mayúsculas y minúsculas.

El máximo es 72 bytes en UTF-8 para impedir el truncamiento de bcrypt; no
equivale necesariamente a 72 caracteres. La contraseña no se recorta ni se
normaliza antes de validarla o guardarla.

El back aplica `@ContraseniaSegura()` en `RegisterDto`, `CambiarContraseniaDto` y
`RestablecerContraseniaDto`, mediante el `ValidationPipe` global. El front
reutiliza `passwordSeguraValidator()` y el mismo mensaje en los tres formularios,
y exige que la confirmación coincida. El ingreso conserva la validación de
credenciales existentes: esta política se exige al crear una contraseña nueva.
El costo de bcrypt es configurable entre 12 y 31, con valor predeterminado 12;
una configuración fuera de ese rango impide generar hashes.

## Cambio y recuperación de contraseña

Desde **Mi perfil → Seguridad de la cuenta → Cambiar contraseña**, el usuario
autenticado informa la contraseña actual, una nueva distinta y su confirmación.
El backend toma la identidad del JWT, verifica la contraseña actual con bcrypt
y comprueba la política y la confirmación mediante los DTO. No usa un enlace
de correo para autorizar este cambio.

La recuperación es un proceso separado, sin sesión: el enlace vence en dos horas,
es de un solo uso y se invalida al solicitar otro, restablecer la contraseña o
cambiarla desde el perfil. Las cuentas bloqueadas no reciben enlaces y tampoco
pueden utilizar enlaces anteriores. La solicitud devuelve el mismo mensaje para
cuentas inexistentes, bloqueadas y habilitadas.

Ambos procesos envían una notificación por Azure Mail después de guardar el hash.
Si falla el correo, se registra el error y el cambio sigue siendo exitoso.
No se incluyen contraseñas ni tokens en el aviso. El envío usa el proveedor y sus
reintentos existentes; no se incorporó una cola persistente de notificaciones.
Los JWT existentes conservan su vigencia; no se agregó revocación de sesiones.

Rutas:

- `PATCH /auth/cambiar-contrasenia` (JWT): `contraseniaActual`,
  `nuevaContrasenia`, `confirmarContrasenia`.
- `POST /auth/recuperar-contrasenia`: `email`.
- `POST /auth/restablecer-contrasenia`: `token`, `nuevaContrasenia`,
  `confirmarContrasenia`. La confirmación ahora es obligatoria también en la API.

El cambio autenticado comprueba el hash anterior al actualizar. El restablecimiento
consume el token y actualiza la contraseña en una misma operación condicional,
para impedir su reutilización incluso con solicitudes simultáneas.

## Compatibilidad

Se conservan `JWT_SECRET`, `JWT_EXPIRES_SEC`, su valor por defecto y los hashes
existentes. `BCRYPT_COST` ahora exige un mínimo de 12. Los enlaces ya emitidos
mantienen su vencimiento guardado; los nuevos vencen en dos horas. No cambia el
esquema y no se necesita una migración.
Los JWT de prueba de vida y los presupuestos firmados siguen utilizando sus
validaciones y propósitos específicos.

## Verificación realizada

El 29/10/2026 se verificaron compilación y oxlint, 45 casos de seguridad e
integración HTTP y 45 casos de regresión de verificación del anunciante.
Las pruebas comprobaron registro, ingreso, verificación/reenvío de correo,
recuperación y restablecimiento, permisos de rol, bloqueo de cuentas, perfil,
fotos y guards de anunciante y propiedad. También se compararon todos los
controladores y los guards trasladados con sus versiones previas y se comprobó
que el grafo de módulos no contiene ciclos.

Se utilizaron servicios, JWT, bcrypt, validación e interceptores reales con
persistencia y proveedores externos simulados. No se ejecutaron operaciones
contra PostgreSQL ni envíos de correo o pagos reales. Las pruebas y su evidencia
se mantuvieron fuera del repositorio.
