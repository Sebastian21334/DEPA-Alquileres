# Publicaciones de ejemplo del 9 de octubre de 2026

Las 29 imágenes proporcionadas se agrupan en seis propiedades distintas. Cada propiedad tiene una única modalidad: tres temporales (dúplex, departamento con amenities y casa con pileta) y tres de largo plazo (PH, monoambiente y departamento con parquet). Las galerías no se repiten entre publicaciones.

Los títulos y las descripciones están redactados como anuncios habituales, sin etiquetas de ejemplo ni modalidades en el título, según la preferencia del usuario. Precios, superficies, cantidad de ambientes, direcciones y ubicaciones siguen siendo datos de demostración. Las coordenadas provienen del centroide de la localidad importada de Georef. Las fotos del grupo `we23` muestran espacios comunes y las del grupo `sv75` incluyen el entorno.

Los temporales tienen disponibilidad del 10/10/2026 al 31/01/2027, inclusive (114 días por publicación). Los ejemplos de largo plazo no tienen calendario de reservas.

Desde `back`, con el proyecto compilado y sus variables de conexión configuradas:

```powershell
node scripts/cargar-publicaciones-ejemplo.cjs --usuario <email-del-anunciante-verificado>
node scripts/cargar-publicaciones-ejemplo.cjs --usuario <email-del-anunciante-verificado> --aplicar
```

La primera ejecución valida archivos, cuenta y catálogos sin crear registros. La segunda utiliza los servicios existentes de publicaciones e imágenes, conserva el procesamiento habitual de las fotos y exige una cuenta habilitada y un anunciante ya verificado. El calendario se ajusta en una transacción con fechas `YYYY-MM-DD`, para evitar desplazamientos de día por zona horaria; conserva las fechas ocupadas y sólo retira filas duplicadas o fuera del rango sin reserva. La conexión no sincroniza ni modifica el esquema.

`carga-2026-10-09.json` registra los seis anuncios finales, sus IDs, galerías y comprobaciones. Permite reanudar la carga sin crear duplicados; si cambió una galería o archivo, el proceso se detiene para revisarlo. La corrección de la primera carga conserva un respaldo en `carga-2026-10-09-antes-de-corregir.json` y retira únicamente los anuncios duplicados de esta carga sin reservas, mensajes o favoritos.
