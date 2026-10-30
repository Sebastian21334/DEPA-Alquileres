# Unificación de la política de contraseñas — RNF5

Fecha: 30/10/2026.

## Objetivo

Aplicar las mismas condiciones de contraseña en el frontend y el backend durante el registro y el restablecimiento, y reflejarlas en los mensajes de los formularios.

## Situación anterior

El frontend exigía un mínimo de 8 caracteres, una letra, un número y un carácter especial. Sin embargo, los DTO del backend solamente exigían texto de al menos 8 caracteres. Por lo tanto, una solicitud directa a la API podía superar la validación con una contraseña que el formulario rechazaba.

Además, el validador anterior del frontend consideraba los espacios como caracteres especiales y no establecía un máximo acorde con bcrypt.

## Política implementada

| Condición | Regla en frontend y backend |
| --- | --- |
| Longitud mínima | 12 caracteres Unicode. |
| Letras | Al menos una letra; se admiten letras con tilde y de otros alfabetos. |
| Números | Al menos un dígito del 0 al 9. |
| Símbolos | Al menos un signo de puntuación o símbolo Unicode; se admiten emojis. |
| Espacios e invisibles | Se rechazan espacios, tabulaciones, saltos de línea y caracteres Unicode de control o formato. |
| Longitud máxima | 72 bytes en UTF-8. |
| Mayúsculas y minúsculas | No es obligatorio combinar ambas. |

La longitud mínima cuenta caracteres Unicode completos, de modo que un emoji no se cuenta como dos caracteres. El máximo se mide en bytes: las letras con tilde y los emojis pueden ocupar varios bytes. Este límite evita que bcrypt ignore una parte de la contraseña por superar sus 72 bytes de entrada.

Las contraseñas no se recortan ni se normalizan antes de validarse o guardarse. Los formularios también mantienen la confirmación de contraseña y comprueban que ambos valores coincidan.

## Cambios en el backend

- Se agregó el decorador reutilizable `@ContraseniaSegura()`, basado en `class-validator`.
- Se aplicó en `RegisterDto.contrasenia` y `RestablecerContraseniaDto.nuevaContrasenia`.
- La validación se ejecuta mediante el `ValidationPipe` global existente, incluso si la solicitud se realiza directamente a la API.
- Se incorporó un mensaje que describe la política completa.

## Cambios en el frontend

- Se actualizó `passwordSeguraValidator()` con las mismas condiciones que el backend.
- Registro y restablecimiento reutilizan ese validador.
- Se centralizó el texto de ayuda y error de ambos formularios en `MENSAJE_CONTRASENIA_SEGURA`.
- Se eliminaron las indicaciones anteriores de un mínimo de 8 caracteres.

La política es la misma en ambas capas. El backend reutiliza un único decorador entre sus DTO y el frontend un único validador entre sus formularios; no se incorporó un paquete compartido entre las dos aplicaciones.

## Almacenamiento: hash con bcrypt

El proyecto ya utilizaba bcrypt y conserva ese mecanismo. Las contraseñas se almacenan como hashes, no como texto plano ni mediante cifrado reversible. Al generar cada hash, bcrypt incorpora una sal aleatoria; al ingresar, el backend utiliza `bcrypt.compare()` para verificar la contraseña.

El factor de costo se obtiene de `BCRYPT_COST`, con **12 como valor predeterminado**, y el archivo `.env.example` indica `BCRYPT_COST=12`.

**Aclaración sobre el RNF:** el código actual permite configurar otro costo y no fuerza un mínimo de 12. Por eso, corresponde describirlo como valor predeterminado. Si el requisito exige un mínimo obligatorio de 12, queda pendiente agregar una restricción sobre esa configuración. El cambio de política realizado no modificó el servicio de hash.

## Redacción del RNF acorde con la implementación

> Las contraseñas deberán contener como mínimo 12 caracteres, al menos una letra, un número y un símbolo; no deberán incluir espacios ni caracteres de control o formato invisibles y tendrán un máximo de 72 bytes en UTF-8. Estas condiciones se validarán tanto en el frontend como en el backend durante el registro y el restablecimiento de contraseña. Las contraseñas se almacenarán exclusivamente como hashes generados mediante bcrypt, con una sal aleatoria por contraseña y un factor de costo configurable, cuyo valor predeterminado será 12; nunca se almacenarán en texto plano.

## Compatibilidad y alcance

- Las contraseñas existentes siguen funcionando para iniciar sesión. La nueva política se exige al crear o restablecer una contraseña.
- No se modificaron las rutas ni los nombres de los campos de la API.
- No se requieren cambios en el esquema de la base de datos ni migraciones.
- El flujo existente de recuperación conserva su token aleatorio, su vencimiento de una hora y su consumo al restablecer la contraseña.

## Verificación realizada

Se completaron la compilación del backend y la compilación de desarrollo del frontend. Una comprobación breve confirmó la coincidencia entre el validador del frontend y ambos DTO para contraseñas válidas e inválidas, límites de longitud, caracteres Unicode y mensajes. No se agregó una batería de tests al repositorio ni se realizaron operaciones sobre la base de datos.

## Archivos involucrados

- `back/src/auth/validators/contrasenia-segura.decorator.ts` — nuevo decorador de validación.
- `back/src/auth/dto/register.dto.ts` — aplicación de la política al registro.
- `back/src/auth/dto/restablecer-contrasenia.dto.ts` — aplicación de la política al restablecimiento.
- `front/src/app/shared/validators/password.validators.ts` — reglas y mensaje reutilizables.
- `front/src/app/features/auth/register/register.component.ts` y `.html` — mensaje del formulario de registro.
- `front/src/app/features/auth/restablecer-contrasenia/restablecer-contrasenia.component.ts` y `.html` — mensaje del formulario de restablecimiento.
- `back/docs/seguridad.md` — documentación de la política.

Referencia técnica: [límite de entrada de bcrypt](https://github.com/kelektiv/node.bcrypt.js#security-issues-and-concerns).
