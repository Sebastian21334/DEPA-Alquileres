# Eliminación de documentación de verificación

La política depende de eventos, sin plazos de retención. Borradores, pendientes
y reenviadas conservan sus archivos privados. La aprobación o el rechazo retira
las referencias de la solicitud y programa el borrado de DNI frente/dorso,
captura facial, matrícula y constancia de CUIT. Un rechazo requiere documentos
y prueba de vida nuevos para reenviar. No cambia la habilitación del anunciante
aprobado ni se eliminan los datos declarados del formulario.

La resolución, su historial y la cola privada `eliminacion_documento` se guardan
en la misma transacción. Después del COMMIT se intenta borrar en Azure; si falla,
el backend reintenta automáticamente, también después de reiniciar. La cola
conserva solo la URL necesaria hasta completar el borrado; no se publica en la
API ni se registran URLs o errores del proveedor. La fila desaparece al finalizar.
El resultado, fecha, responsable, motivo y fecha de prueba de vida se conservan.
Los nonces, hashes y autorizaciones de la prueba se limpian al resolver.

Cada proceso toma hasta 25 documentos mediante `FOR UPDATE SKIP LOCKED`, sin
bloquear solicitudes. Hay un intento inmediato tras resolver y un sondeo cada
30 segundos. Los fallos esperan entre 30 segundos y una hora, sin descartar
trabajos por alcanzar un máximo de intentos. Esos intervalos son reintentos
técnicos, no períodos de retención. Las URLs incluyen UUID: un trabajo antiguo
no elimina las nuevas capturas de un reenvío.

## Preparar y desplegar

Con el backend detenido, después de las migraciones de identidad y documentación
inmobiliaria, desde `back`:

```sh
node scripts/eliminacion-documentos.cjs
npm run db:eliminacion-documentos
```

El primer comando solo informa cantidades por estado, sin URLs ni contenido.
El segundo crea la cola y programa documentos de solicitudes históricas ya
aprobadas/rechazadas; retira sus referencias, sin alterar decisiones, fechas,
revisiones ni solicitudes que esperan evaluación. Es reejecutable. Al iniciar
el backend nuevo se procesan los archivos; la migración no contacta Azure.
Aplicar también en una base nueva después de `db:inicializar` y de las migraciones
previas. `synchronize` permanece desactivado.

## Requisito de Azure para eliminación permanente

El almacenamiento de verificaciones debe ser privado y no conservar copias
recuperables: configurar la cuenta destinada a estos documentos sin soft delete,
versionado, restauración temporal, copias de seguridad ni políticas de inmutabilidad
que retengan archivos. Estas opciones pueden afectar toda la cuenta; no se
modifican automáticamente ni se cambia el almacenamiento de fotos públicas.
Las copias históricas existentes requieren limpieza por el responsable de Azure:
desactivar una opción no elimina por sí solo copias anteriores.

El adaptador borra el blob con sus snapshots y consulta versiones, snapshots y
elementos eliminados con el nombre exacto. Si Azure conserva alguno o impide
comprobarlo, mantiene el trabajo pendiente y registra un aviso sin datos sensibles.
No se considera suficiente un HTTP exitoso que haya producido solo soft delete.
Consultar la cola por cantidades (`SELECT count(*) FROM eliminacion_documento`)
para detectar trabajos pendientes y revisar permisos o configuración del proveedor.

Referencia: [Delete Blob, Microsoft](https://learn.microsoft.com/rest/api/storageservices/delete-blob).
Las copias externas y respaldos de PostgreSQL requieren su propia gestión de acceso
y eliminación; este cambio no elimina respaldos de infraestructura.

## Verificación local

```sh
npm run test:eliminacion-documentos
```

Las pruebas no usan documentos reales ni conexiones a Azure o a la base desplegada.
