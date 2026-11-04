# Datos preparados para las pruebas de RNF8

Fecha: 02/11/2026.

## Lote creado

Identificador: `rnf8-20261102-cd588e`.

La carga se realizó en la base de pruebas configurada en `back/.env`, conservando
los datos que se habían restaurado del respaldo de producción.

| Dato nuevo | Cantidad |
| --- | --- |
| Publicaciones activas con imágenes | 1.000 |
| Usuarios y anunciantes ficticios | 5 |
| Publicaciones temporales | 600 |
| Publicaciones de largo plazo | 400 |
| Publicaciones en ARS | 700 |
| Publicaciones en USD | 300 |
| Ciudades | 7 |
| Provincias | 3 |
| Tipos de propiedad | 6 |
| Registros de imágenes | 3.000, entre 1 y 5 por publicación |
| Archivos copiados a Azure | 24, reutilizados dentro del lote |
| Días disponibles para temporales | 18.000: 30 días por cada publicación temporal |

Las direcciones son ficticias y las coordenadas quedan sin asignar. Los títulos
identifican explícitamente los datos de RNF8 y las descripciones aclaran que no
corresponden a propiedades reales. Los usuarios tienen correos terminados en
`@pruebas.invalid`, contactos ficticios y contraseñas aleatorias no registradas.
La carga directa no envía correos ni crea pagos, reservas o documentos de identidad.

Se conservaron las 18 publicaciones anteriores. La base contiene por lo tanto
**1.018 publicaciones en total**. El volumen real debe registrarse al medir RNF8;
no debe presentarse el catálogo completo como si contuviera exactamente 1.000.
Para consultar únicamente las nuevas, buscar `rnf8-20261102-cd588e`.

## Imágenes separadas de producción

Las fotos se copiaron al contenedor exclusivo `rnf8-20261102-cd588e` de la misma
cuenta de Azure. Los archivos originales no se movieron, sobrescribieron ni borraron.
Las 3.000 referencias nuevas apuntan a las copias de prueba.

En `back/.env`, `AZURE_STORAGE_CONTAINER` apunta al contenedor del lote para que
las siguientes subidas del backend local también queden separadas. Se conserva
el nombre del contenedor de origen en `RNF8_SOURCE_CONTAINER`, utilizado solo
para leer las fotos durante futuras cargas.

**Reiniciar el backend** si ya estaba ejecutándose para que lea la configuración
actualizada. Las URLs de las fotos copiadas anteriormente desde producción siguen
perteneciendo al almacenamiento original; el lote nuevo no las utiliza.

## Identificación y protección del destino

`RNF8_DATABASE_FINGERPRINT` identifica la conexión de pruebas sin guardar la
contraseña. Los scripts rechazan otra conexión si se cambia `DATABASE_URL` y
la identificación deja de coincidir. No modificar esta marca para ejecutar los
scripts sobre producción.

El manifiesto local está en:

`back/backups/rnf8-20261102-cd588e.json`

Contiene los IDs exactos creados, nombres de las copias en Azure, catálogos,
cantidades y comprobaciones de conservación de los registros originales.
`back/backups/` está excluido de Git. Conservar este archivo para verificar o
limpiar el lote; no depende de adivinar rangos de IDs.

## Comandos disponibles

Ejecutar desde `back`.

Consultar el plan de una carga:

```powershell
npm run db:datos-rnf8
```

Crear un lote en un destino de pruebas identificado:

```powershell
npm run db:datos-rnf8 -- --aplicar
```

La carga ya fue ejecutada. Si detecta otro lote RNF8, el comando no agrega otras
1.000 publicaciones accidentalmente.

Verificar los datos existentes usando las consultas de la aplicación:

```powershell
npm run db:verificar-datos-rnf8 -- backups/rnf8-20261102-cd588e.json
```

La verificación requiere el backend compilado (`npm run build`). Comprueba la
búsqueda por lote, la paginación de 12 resultados, las modalidades, filtros
combinados, ordenamiento, fotos del contenedor exclusivo y conservación de los
registros originales. Esto comprueba la preparación de datos; **no es la prueba
de rendimiento con diez usuarios concurrentes**.

## Limpieza posterior

Consultar primero qué se eliminaría, sin borrar registros ni archivos:

```powershell
npm run db:datos-rnf8 -- --limpiar=backups/rnf8-20261102-cd588e.json
```

Cuando se decida retirar el lote, ejecutar:

```powershell
npm run db:datos-rnf8 -- --limpiar=backups/rnf8-20261102-cd588e.json --aplicar
```

La limpieza elimina solo las publicaciones e identidades ficticias identificadas
en el manifiesto; sus imágenes y fechas se eliminan de la base mediante las
relaciones correspondientes. En Azure elimina únicamente las 24 copias del lote,
después de comprobar la marca del contenedor. No borra contenedores completos ni
archivos originales de producción. El contenedor exclusivo permanece disponible.

Si se crearon reservas para estas publicaciones, se bloquea la limpieza automática
para no eliminar operaciones económicas. Si se suben otras fotos posteriormente,
esas fotos no forman parte de la lista inicial y requieren una revisión adicional.

La limpieza efectiva no fue ejecutada: el lote permanece cargado para las pruebas.
