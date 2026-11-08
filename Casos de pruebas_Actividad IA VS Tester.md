# Caso de prueba: Formato del titulo de una publicación

| Campo                | Valor                                                          |
| -------------------- | -------------------------------------------------------------- |
| **ID**               | CP-06.                                                         |
| **Requerimiento**    | RF8 Gestión de publicaciones; RN-5.                            |
| **Caso de uso**      | CU 10 Modificar Publicación, flujo Principal y alternativo A1. |
| **Referencia**       | Páginas 13, 17, 18, 27 y 40 del documento del proyecto.        |
| **Autor**            | Leandro Didrig.                                                |
| **Versión**          | 1.0.                                                           |
| **Prioridad**        | Baja.                                                          |
| **Tipo de testing**  | Funcional de caja negra                                        |
| **Técnica aplicada** | Partición de equivalencias                                     |

**Descripción:** El objetivo del caso de prueba es probar distintas particiones de strings para probar los títulos admitidos y no admitidos para el DTO de una publicación. Verificando títulos de string vacíos "", strings de mas de 255 caracteres, títulos con emojis, títulos con caracteres símbolos como @, ° |, {, etc.

## Precondición/es

- El backend de DEPA debe estar disponible y abierto a peticiones REST.
- Debe estar abierta una sesión del usuario de prueba "Tester_LD", que debe tener el rol de anunciante.
- El anunciante debe tener una publicación activa con el titulo original "Publicación original CP-06".

## Data

| Dato                        | Valor                                                                                                                                                                                                                                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nombre usuario              | Tester_LD                                                                                                                                                                                                                                                                                                      |
| Rol Usuario                 | Anunciante                                                                                                                                                                                                                                                                                                     |
| Titulo publicación original | "Publicación original CP-06"                                                                                                                                                                                                                                                                                   |
| Titulo Publicación 1        | ""                                                                                                                                                                                                                                                                                                             |
| Titulo publicación 2        | " "                                                                                                                                                                                                                                                                                                            |
| Titulo publicación 3        | "hola"                                                                                                                                                                                                                                                                                                         |
| Titulo Publicación 4        | "Titulo de prueba para validar el limite maximo de caracteres Titulo de prueba para validar el limite maximo de caracteres Titulo de prueba para validar el limite maximo de caracteres Titulo de prueba para validar el limite maximo de caracteres Titulo de prueba para validar el limite maximo de caract" |
| Titulo publicación 5        | "°\|¬!"#$%&/()=?¡¿'¨*+~[]{}^`<>;:,.-_@€£¥©®™§¶•±×÷µ¼½¾«»‰†‡∞≠≤≥√∑∆Ωπ←→↑↓✓✗★♥♦♣♠ñÑáéíóúüÇ¬"                                                                                                                                                                                                                     |
| Titulo publicación 6        | "😀😂🥲😍🤔😴🔥💯✅❌⭐❤️👍👍🏽👋🏿🙏🎉🚀🍕⚽🐶🐱🌎🌈💻📱🏠🔑👨‍👩‍👧‍👦👩🏻‍💻🧑‍🚀🏳️‍🌈"                                                                                                                                                                                                                        |
| Titulo publicación 7        | "Titulo de prueba correcto"                                                                                                                                                                                                                                                                                    |

## Pasos

| Acción                                                                                                                                                                                                                                                                                                                                                            | Paso | Resultado esperado                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| El anunciante "Tester_LD", ya autenticado, intenta modificar el titulo de la publicación con titulo: "Publicación original CP-06" por "".                                                                                                                                                                                                                         | 1    | El sistema detecta el string vació y devuelve un error controlado, no admitiendo la modificación de la publicación.                                             |
| El anunciante intenta el titulo " " en la publicación.                                                                                                                                                                                                                                                                                                            | 2    | El sistema detecta el string con solo un espacio y devuelve un error controlado, no admitiendo la modificación de la publicación.                               |
| El anunciante intenta el titulo "hola" en la publicación.                                                                                                                                                                                                                                                                                                         | 3    | El sistema detecta el string con solo 4 caracteres y devuelve un error controlado, no admitiendo la modificación de la publicación.                             |
| El anunciante intenta el titulo "Titulo de prueba para validar el limite maximo de caracteres Titulo de prueba para validar el limite maximo de caracteres Titulo de prueba para validar el limite maximo de caracteres Titulo de prueba para validar el limite maximo de caracteres Titulo de prueba para validar el limite maximo de caract" en la publicación. | 4    | El sistema detecta el string con mas de 255 caracteres y devuelve un error controlado, no admitiendo la modificación de la publicación.                         |
| El anunciante intenta el titulo "°\|¬!"#$%&/()=?¡¿'¨*+~[]{}^`<>;:,.-_@€£¥©®™§¶•±×÷µ¼½¾«»‰†‡∞≠≤≥√∑∆Ωπ←→↑↓✓✗★♥♦♣♠ñÑáéíóúüÇ¬" en la publicación.                                                                                                                                                                                                                     | 5    | El sistema detecta el string con simbolos no permitidos en forma de caracteres y devuelve un error controlado, no admitiendo la modificación de la publicación. |
| El anunciante intenta el titulo "😀😂🥲😍🤔😴🔥💯✅❌⭐❤️👍👍🏽👋🏿🙏🎉🚀🍕⚽🐶🐱🌎🌈💻📱🏠🔑👨‍👩‍👧‍👦👩🏻‍💻🧑‍🚀🏳️‍🌈" en la publicación.                                                                                                                                                                                                                        | 6    | El sistema detecta el string con emojis y devuelve un error controlado, no admitiendo la modificación de la publicación.                                        |
| Finalmente, el anunciante intenta el titulo "Titulo de prueba correcto" en la publicación.                                                                                                                                                                                                                                                                        | 7    | El sistema permite modificar el titulo de la publicación correctamente.                                                                                         |

## PostCondición

El sistema no admitió modificar ninguno de los títulos de prueba del 1 al 6, pero si el ultimo, el cual tiene el formato correcto.

---
# Caso de prueba: Valores limite de las contraseñas de usuario

| Campo                | Valor                                                              |
| -------------------- | ------------------------------------------------------------------ |
| **ID**               | CP-07                                                              |
| **Requerimiento**    | RF1 Gestión de cuentas; RNF5 Seguridad de contraseñas; RN-1; RN-32 |
| **Caso de uso**      | CU 1 Crear usuario, flujo principal / alternativo A2               |
| **Referencia**       | Páginas 14, 19, 26, 29 y 41 del documento del proyecto             |
| **Autor**            | Leandro Didrig                                                     |
| **Versión**          | 1.0                                                                |
| **Prioridad**        | Alta                                                               |
| **Tipo de testing**  | Funcional de caja negra                                            |
| **Tecnica aplicada** | Valores limite                                                     |

**Descripción:** Verificar que el sistema se comporte de la manera correcta en el proceso de registro ante valores limites de caracteres y bytes en contraseñas, incluyendo contraseñas con caracteres que incluyan mas de 2 bytes, como "ñ" y "é". 

## Precondición/es

- El backend de DEPA debe estar disponible y abierto a peticiones REST.
## Data

| Dato                        | Valor                                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Datos usuario a registrar 1 | {"nombre": "Tester_NuevoLD1", "apellido": "Prueba", "email": "leandro.prueba1@gmail.com", "telefono": "6942067"} |
| Datos usuario a registrar 2 | {"nombre": "Tester_NuevoLD2", "apellido": "Prueba", "email": "leandro.prueba2@gmail.com", "telefono": "6942067"} |
| Datos usuario a registrar 3 | {"nombre": "Tester_NuevoLD3", "apellido": "Prueba", "email": "leandro.prueba3@gmail.com", "telefono": "6942067"} |
| Contraseña 1                | Depa2026!xy                                                                                                      |
| Contraseña 2                | Depa2026!xyz                                                                                                     |
| Contraseña 3                | DepaAlquileres2026!SeminarioIntegradorUTNVillaMaria2026#ReservaSegura$Ok                                         |
| Contraseña 4                | DepaAlquileres2026!SeminarioIntegradorUTNVillaMaria2026#ReservaSegura$Oka                                        |
| Contraseña 5                | ÑandúCañónAcciónCanción2026!PingüinoÁrbolMañanaCorazónÉxitoñ                                                     |
| Contraseña 6                | ÑandúCañónAcciónCanción2026!PingüinoÁrbolMañanaCorazónÉxitoña                                                    |

## Pasos

| Paso | Acción                                                                                                                 | Resultado esperado                                                                                    |
| ---- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1    | En el backend levantado, intentar<br>registrarse con "Datos usuario a registrar 1" y la contraseña 1.                  | El sistema no acepta el registro de usuario<br>debido a que la contraseña es muy corta en caracteres. |
| 2    | Se intenta registrar con los mismos datos pero con la contraseña 2.                                                    | El sistema acepta el registro del usuario y se espera la verificación<br>del email registrado.        |
| 3    | Se prueba a registrar con otros datos de usuario, en este caso con "Datos usuario a registrar 2"<br>y la contraseña 4. | El sistema no acepta el registro de usuario<br>debido a que la contraseña es muy larga en bytes.      |
| 4    | Se intenta registrar con los mismos datos pero con la contraseña 3.                                                    | El sistema acepta el registro del usuario y se espera la verificación<br>del email registrado.        |
| 5    | Se prueba a registrar con otros datos de usuario, en este caso con "Datos usuario a registrar 3"<br>y la contraseña 6. | El sistema no acepta el registro de usuario<br>debido a que la contraseña es muy larga en bytes.      |
| 6    | Se intenta registrar con los mismos datos pero con la contraseña 5.                                                    | El sistema acepta el registro del usuario y se espera la verificación<br>del email registrado.        |

## Postcondición

El sistema permite el registro de los usuarios "Tester_NuevoLD1", "Tester_NuevoLD2" Y "Tester_NuevoLD3" pero solo con las contraseñas 2, 3 y 5 respectivamente.

---
# Caso de prueba: Inicio de sesión con tablas de decisión

| Campo                | Valor                                                                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**               | CP-08                                                                                                                                                       |
| **Requerimiento**    | RF2 Autenticación; RF3 Verificación de correo; RF20 Administración de usuarios; RF22 Cambio de contraseña; RN-2; RN-36; RN-43; RNF13 Seguridad de usuarios. |
| **Caso de uso**      | CU 2 Iniciar sesión.                                                                                                                                        |
| **Referencia**       | Páginas 14, 17, 18, 19, 21, 26 y 29 del documento del proyecto.                                                                                             |
| **Autor**            | Leandro Didrig                                                                                                                                              |
| **Versión**          | 1.0                                                                                                                                                         |
| **Prioridad**        | Alta                                                                                                                                                        |
| **Tipo de testing**  | Funcional de caja negra                                                                                                                                     |
| **Tecnica aplicada** | Tablas de decisión                                                                                                                                          |

**Descripción:** Verificar que todos los caminos posibles para el inicio de sesión de una cuenta sean implementados correctamente con respecto a la documentación. Se tiene la siguiente tabla de decisión para este caso de prueba:

| Condición/Regla              | R1                               | R2                                | R3                                 | R4                 |
| ---------------------------- | -------------------------------- | --------------------------------- | ---------------------------------- | ------------------ |
| Email y contraseña correctos | N                                | S                                 | S                                  | S                  |
| Cuenta activa                | -                                | N                                 | S                                  | S                  |
| Cuenta bloqueada             | -                                | -                                 | S                                  | N                  |
| Resultado                    | 401 "Credenciales <br>invalidas" | 403 "Tu cuenta <br>esta inactiva" | 403 "Tu usuario<br>esta bloqueado" | Ingresa<br>(token) |

## Precondición/es

- El backend de DEPA debe estar disponible y abierto a peticiones REST.
- El usuario "Tester_LD_TD" debe estar registrado con el email "cuentadepruebadidrih1@gmail.com" y contraseña "ContraseñitaDePruebovich123*", pero no debe tener su cuenta activa todavia y el usuario con el email "leandrodidrig@gmail.com" debe tener el rol de admin.

## Data

| Dato                                | Valor                           |
| ----------------------------------- | ------------------------------- |
| Email Usuario 1                     | cuentadepruebadidrih1@gmail.com |
| Contraseña incorrecta<br>Usuario 1  | ContraseñitaDePruebovich123     |
| Contraseña Usuario 1                | ContraseñitaDePruebovich123*    |
| Estado inicial <br>cuenta Usuario 1 | Inactiva                        |
| Email Usuario 2                     | leandrodidrig@gmail.com         |
| Contraseña Usuario 2                | ContraseñitaDePruebovich123*    |
| Rol Usuario 2                       | Admin                           |

## Pasos

| Paso | Acción                                                                                                                                   | Resultado esperado                                                                                              |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1    | Con el backend levantado, se intenta iniciar sesión con<br>las credenciales de "Email Usuario 1" y "Contraseña<br>incorrecta Usuario 1". | El sistema debe arrojar el error<br>401 "Credenciales invalidas" y <br>no permite el acceso al usuario.         |
| 2    | Se intenta iniciar sesión nuevamente, pero esta vez <br>con la "Contraseña Usuario 1".                                                   | El sistema debe arrojar el error<br>403 "Tu cuenta esta inactiva" y <br>no permite el acceso al usuario.        |
| 3    | El usuario 1 verifica su mail para que su cuenta cambie <br>su estado a activa.                                                          | El sistema cambia el estado de <br>la cuenta asociada al mail <br>verificado a "activa=t".                      |
| 4    | El usuario 2 inicia sesión con sus credenciales <br>"Email Usuario 2" y "Contraseña Usuario 2" y bloquea <br>al usuario 1.               | El usuario inicia sesión<br>correctamente y cambia el<br>estado de la cuenta del <br>usuario 1 a "bloqueado=t". |
| 5    | El usuario 1 intenta iniciar sesión con sus credenciales <br>correctas y su cuenta activa.                                               | El sistema debe arrojar el error<br>403 "Tu usuario esta<br>bloqueado" y <br>no permite el acceso al usuario.   |
| 6    | El usuario 2 habilita nuevamente al usuario 1.                                                                                           | El sistema cambia el estado de<br>la cuenta del usuario 2 a<br>"bloqueado=f"                                    |
| 7    | El usuario 1 intenta iniciar sesión nuevamente <br>con sus credenciales correctas y su cuenta activa.                                    | El sistema entrega el token <br>al usuario 1.                                                                   |

## Postcondición

El sistema entrega el token al usuario con nombre "Tester_LD_TD" si y solo si las credenciales son validas, tiene su cuenta activa y no esta bloqueado.

---
## Resumen de resultados 

| ID    | Caso de prueba                               | Estado    | Resultado | Severidad de la falla |
| ----- | -------------------------------------------- | --------- | --------- | --------------------- |
| CP-06 | Formato del titulo de una publicación        | Ejecutado | Positivo  | Media                 |
| CP-07 | Valores limite de las contraseñas de usuario | Ejecutado | Negativo  | -                     |
| CP-08 | Inicio de sesión con tablas de decisión      | Ejecutado | Positivo  | Baja                  |


