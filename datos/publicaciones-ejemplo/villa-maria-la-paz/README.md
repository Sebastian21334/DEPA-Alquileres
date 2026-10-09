# Nueva carga: Villa María, alrededores y La Paz

Las 34 fotos proporcionadas se agrupan en ocho inmuebles, cada uno con una sola publicación. Se mantienen títulos naturales y galerías distintas. Cinco anuncios se ubican en Villa María, Villa Nueva y Tío Pujio (Córdoba); tres en La Paz (Entre Ríos). Las seis publicaciones anteriores se conservan.

Hay tres alquileres temporales y cinco de largo plazo. Los temporales tienen disponibilidad del 10/10/2026 al 31/01/2027, inclusive; los de largo plazo no tienen calendario de reservas.

Los datos corresponden a la demostración solicitada: precios, direcciones, ambientes y superficies son valores ilustrativos. Las localidades se toman del catálogo importado de Georef. Cada dirección se buscó y su punto se confirmó con el botón del selector Leaflet, según la indicación del usuario. Los ocho anuncios usan las coordenadas elegidas, con marcadores distintos y resultados que incluyen la altura. Se precisaron las direcciones de Buenos Aires e Italia para confirmar puntos con número reconocido. Las capturas `mapa-*.jpg` y `ubicaciones-encontradas.json` registran las confirmaciones. Las fotos conservan sus marcas originales y se procesan con el servicio habitual de imágenes.

Desde `back`, usando la cuenta de un anunciante ya verificado y el proyecto compilado:

```powershell
node scripts/cargar-publicaciones-ejemplo.cjs --lote ../datos/publicaciones-ejemplo/lote-villa-maria-la-paz.json --usuario <email>
node scripts/verificar-lote-villa-maria-la-paz.cjs --antes
node scripts/cargar-publicaciones-ejemplo.cjs --lote ../datos/publicaciones-ejemplo/lote-villa-maria-la-paz.json --usuario <email> --aplicar
node scripts/verificar-lote-villa-maria-la-paz.cjs
```

La primera ejecución valida sin crear anuncios. El manifiesto `carga-2026-10-09.json` registra los IDs y hashes de las fotos para permitir reanudar una carga interrumpida. Este lote usa un manifiesto separado y no retira anuncios existentes. `estado-anterior.json` y `verificacion.json` permiten comprobar que los anuncios anteriores conservan sus datos y galerías, y que las 34 nuevas imágenes son accesibles.
