---
name: verificar-seguridad-del-cambio
description: Revisa la seguridad de los flujos afectados al implementar o revisar cambios de código que reciben entradas externas, controlan accesos, manejan datos sensibles o usan integraciones.
---

# Verificar la seguridad del cambio

Seguí el flujo afectado desde la entrada hasta la operación y su resultado. Identificá qué datos vienen de fuera del sistema, quién puede iniciar la operación y qué recursos usa. Aplicá los controles pertinentes al cambio.

- **Entradas y salidas.** Validá el tipo, formato, tamaño y valores permitidos en el componente que aplica los controles de seguridad. Protegé la salida según el contexto donde se usa.
- **Permisos.** Verificá que quien inicia la operación tenga permiso para realizarla sobre el recurso concreto. Comprobá el propietario, el rol y el aislamiento entre organizaciones cuando corresponda.
- **Consultas e integraciones.** Usá consultas parametrizadas. Revisá los destinos, permisos y límites al acceder a archivos, ejecutar procesos o enviar solicitudes externas. Conservá los límites de carga y consumo y las verificaciones de certificados aplicables.
- **Secretos y datos sensibles.** Usá los mecanismos de protección disponibles y limitá los datos que aparecen en registros, errores y respuestas.
- **Autenticación y sesiones.** Cuando el cambio afecte estos mecanismos, verificá que los controles correspondientes se apliquen en todo el flujo. Conservá las protecciones de cookies, CSRF y CORS cuando correspondan.

## Verificar y cerrar

Durante una implementación, corregí los problemas de seguridad del flujo afectado dentro del alcance acordado. En una revisión, informá cada hallazgo con su ubicación, impacto y escenario.

Mantené activas las validaciones y los permisos durante la implementación y las pruebas. Si cambia una validación o un permiso, probá el flujo con un caso permitido y uno rechazado. Si hay un endpoint para ese flujo, ejecutá los casos a través de ese endpoint.

Si cambia el contrato HTTP, verificá el código de estado y el cuerpo de la respuesta. Cuando el frontend consuma ese contrato, comprobá también que el usuario pueda completar la acción esperada.

Si queda un riesgo que impide entregar el cambio de forma segura, indicá qué falta resolver.
