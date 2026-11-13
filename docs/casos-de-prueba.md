# Casos de prueba unitarios de importes y monedas

Las tres funciones están en `back/src/common/utils/importes.ts`. Cada fila corresponde a un test. Los valores marcados con `n` son de tipo `bigint`. Se usa punto como separador decimal.

## `decimalEntero(valor, decimales)`

La escala indica cuántos dígitos fraccionarios se admiten y a qué unidad entera se convierte el valor. Las llamadas del proyecto usan escala 2 para importes y 6 para cotizaciones.

| Entrada | Resultado esperado | Técnica |
| --- | --- | --- |
| D01 · `('12', 2)` | `1200n` | Partición válida: cadena entera |
| D02 · `(12.3, 2)` | `1230n` | Valor límite: un decimal por debajo del máximo |
| D03 · `('12.34', 2)` | `1234n` | Valor límite: máximo de dos decimales |
| D04 · `('12.345', 2)` | Error `El importe tiene demasiados decimales` | Valor límite: un decimal por encima del máximo |
| D05 · `('123.456789', 6)` | `123456789n` | Valor límite: máximo de seis decimales para cotizaciones |
| D06 · `('-1', 2)` | Error `Importe decimal inválido` | Partición inválida: importe negativo |
| D07 · `('12,34', 2)` | Error `Importe decimal inválido` | Partición inválida: separador decimal no admitido |
| D08 · `('abc', 2)` | Error `Importe decimal inválido` | Caso raro: texto no numérico |
| D09 · `('', 2)` | Error `Importe decimal inválido` | Caso raro: cadena vacía |
| D10 · `(null, 2)` | Error `Importe decimal inválido` | Caso raro: nulo fuera del tipo declarado |
| D11 · `(undefined, 2)` | Error `Importe decimal inválido` | Caso raro: valor ausente fuera del tipo declarado |

## `importeTexto(centavos)`

El rango admitido en centavos va de `0n` a `9999999999n`, ambos inclusive. Un valor válido se representa con exactamente dos decimales.

| Entrada | Resultado esperado | Técnica |
| --- | --- | --- |
| I01 · `-1n` | Error `El total supera el máximo admitido para una reserva` | Valor límite: un centavo por debajo del mínimo |
| I02 · `0n` | `'0.00'` | Valor límite: mínimo |
| I03 · `1n` | `'0.01'` | Valor límite: un centavo por encima del mínimo |
| I04 · `1234n` | `'12.34'` | Partición válida: importe interior con parte entera y centavos |
| I05 · `9999999998n` | `'99999999.98'` | Valor límite: un centavo por debajo del máximo |
| I06 · `9999999999n` | `'99999999.99'` | Valor límite: máximo |
| I07 · `10000000000n` | Error `El total supera el máximo admitido para una reserva` | Valor límite: un centavo por encima del máximo |
| I08 · `'123'` | `TypeError` | Caso raro: texto numérico fuera del tipo declarado |
| I09 · `''` | `TypeError` | Caso raro: texto vacío fuera del tipo declarado |
| I10 · `null` | `TypeError` | Caso raro: nulo fuera del tipo declarado |
| I11 · `undefined` | `TypeError` | Caso raro: valor ausente fuera del tipo declarado |

## `monedaPublicacion(nombre)`

Las publicaciones pueden usar pesos argentinos o dólares estadounidenses. Se admiten códigos y alias reconocidos, con normalización de espacios, mayúsculas y tildes.

| Entrada | Resultado esperado | Técnica |
| --- | --- | --- |
| M01 · `'Moneda ARS'` | `'ARS'` | Partición válida: código ARS dentro de una etiqueta |
| M02 · `'Moneda USD'` | `'USD'` | Partición válida: código USD dentro de una etiqueta |
| M03 · `'  pesos argentinos  '` | `'ARS'` | Partición válida: alias de pesos con espacios externos y minúsculas |
| M04 · `'  dólar estadounidense  '` | `'USD'` | Partición válida: alias de dólares con tilde, espacios externos y minúsculas |
| M05 · `'EUR'` | Error `La moneda de la publicación no está habilitada para reservas` | Partición inválida: moneda no habilitada |
| M06 · `'ARS/USD'` | Error `La moneda de la publicación no está habilitada para reservas` | Partición inválida: etiqueta ambigua con ambos códigos |
| M07 · `''` | Error `La moneda de la publicación no está habilitada para reservas` | Caso raro: cadena vacía |
| M08 · `null` | Error `La moneda de la publicación no está habilitada para reservas` | Caso raro: nulo fuera del tipo declarado |
| M09 · `undefined` | Error `La moneda de la publicación no está habilitada para reservas` | Caso raro: argumento opcional ausente |

La moneda es una categoría. Los análisis de valores límite se aplican a los rangos y a la precisión de las funciones de importes.
