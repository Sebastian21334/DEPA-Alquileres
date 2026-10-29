# Prueba de vida y revisión manual de identidad

## Organización del código

`VerificacionAnuncianteModule` concentra el trámite, sus DTO, solicitudes,
revisiones y repositorios. `VerificacionAnuncianteService` coordina documentos y
resoluciones administrativas; `PruebaVidaService` gestiona desafíos y capturas.
Ambos servicios son internos al módulo. `AnunciantesModule` conserva la entidad,
su repositorio y el servicio para crear y consultar anunciantes.

Las rutas públicas siguen bajo `/anunciantes`, incluida
`/anunciantes/verificacion-facial`. El cambio de carpetas no modifica las tablas,
columnas ni relaciones y no requiere una migración adicional. La aprobación,
la habilitación del anunciante y el historial conservan la misma transacción.

## Comportamiento

MediaPipe guía los gestos en el navegador. El servidor verifica las capturas de
la prueba de vida con face-api/TensorFlow, incluida la continuidad entre sus
fotogramas. No compara el rostro con la fotografía del DNI. Esa correspondencia
la revisa el Administrador en el panel antes de aprobar o rechazar.

El desafío dura diez minutos y se vincula al usuario, solicitud y revisión.
Cambiar los gestos invalida el desafío anterior. Validarlo emite una autorización
de cinco minutos ligada al hash de la captura final. No aprueba la identidad.
La autorización se consume al confirmar los tres documentos y el paso a pendiente,
en una misma transacción. Los nonces y hashes no se serializan en la API.

Solo borradores o solicitudes rechazadas admiten otra captura. Los reenvíos abren
la siguiente revisión. Una solicitud pendiente no permite cambiar documentos;
el administrador debe resolver exactamente el `numero_revision` que consultó.
Los endpoints administrativos exigen dicho número en el cuerpo. El rechazo
también exige `motivo`, de 5 a 500 caracteres después de quitar espacios.

La decisión, el responsable autenticado y la habilitación del anunciante se
guardan en una misma transacción. Las operaciones usan un bloqueo de la solicitud;
la carga externa de archivos y los correos quedan fuera del bloqueo. Una
presentación fallida intenta borrar solo los archivos que acaba de subir. Esto
no implementa la política general de retención o eliminación de DNI.

## Preparación de una base existente

Con el backend detenido, desde `back`:

```sh
node scripts/verificacion-identidad.cjs
npm run db:verificacion-identidad
```

El primer comando informa columnas existentes; el segundo aplica la migración
repetible. `synchronize` permanece desactivado. No se inventan pruebas de vida ni
administradores para datos históricos. Las aprobaciones anteriores se conservan.
Una solicitud antigua pendiente sin evidencia registrada debe rechazarse con un
motivo que solicite una nueva captura; después puede reenviarse con el nuevo flujo.
Las pruebas y autorizaciones emitidas por la versión anterior deben repetirse.

Aplicar primero la migración y desplegar backend y frontend coordinadamente: el
panel actualizado envía `numero_revision` al aprobar o rechazar. Retirar
`VALIDAR_COINCIDENCIA_DNI` de la configuración; ya no tiene efecto. Mantener las
dependencias y los modelos faciales necesarios para la prueba de vida.
