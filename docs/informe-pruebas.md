# Informe de pruebas unitarias de DEPA-Alquileres

## Proyecto y selección

El backend usa TypeScript, Node.js, NestJS y PostgreSQL mediante TypeORM. El frontend usa TypeScript y Angular. El backend ya tiene Jest con `ts-jest` y también cuenta con pruebas escritas para `node:test`. El frontend tiene scripts específicos con `node:test`. Reutilicé la configuración de Jest del backend y la convención `back/test/jest/*.spec.ts`, sin instalar dependencias adicionales.

| Función | Motivo de la elección |
| --- | --- |
| `decimalEntero` | Convierte importes y cotizaciones a enteros con una escala fija. Esta regla permite hacer los cálculos de reserva con precisión decimal y detectar importes con más decimales de los admitidos. |
| `importeTexto` | Aplica el rango admitido para el total de una reserva y asegura un formato de dos decimales. Los extremos tienen resultados observables y permiten verificar errores de un centavo. |
| `monedaPublicacion` | Determina si la moneda de una publicación es ARS o USD. Permite verificar alias, normalización y rechazo de monedas ambiguas o ajenas al catálogo admitido. |

Las tres funciones son pequeñas y las usan los servicios de reservas y pagos. El archivo `back/test/jest/importes.unit.spec.ts` importa directamente las funciones. Cada salida depende de sus argumentos, por lo que la suite se ejecuta sin mocks, base de datos, servidor HTTP ni internet.

## Diseño de casos

Las tres funciones están en `back/src/common/utils/importes.ts`. Cada fila corresponde a un test. Los valores marcados con `n` son de tipo `bigint`. Se usa punto como separador decimal.

### `decimalEntero(valor, decimales)`

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

### `importeTexto(centavos)`

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

### `monedaPublicacion(nombre)`

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

## Ejecución y cobertura

Se ejecutó con Node.js 24.19.0 y npm 11.17.0. Desde `back/`:

```powershell
npm run test:jest -- --runInBand --runTestsByPath test/jest/importes.unit.spec.ts --coverage --collectCoverageFrom=src/common/utils/importes.ts --coverageReporters=text
```

**Resultado de las pruebas unitarias:** 31 aprobadas de 31, en una suite. Ningún resultado observado en estos casos reveló un defecto en las funciones elegidas. El código de producción se mantuvo intacto.

| Archivo medido | Sentencias | Ramas | Funciones | Líneas |
| --- | ---: | ---: | ---: | ---: |
| `src/common/utils/importes.ts` | 100 % | 100 % | 100 % | 100 % |

El porcentaje corresponde únicamente al archivo medido. Por ejemplo, los tests pasan por la rama que admite un alias de USD usando «dólar estadounidense», aunque queden otros alias sin probar.

También ejecuté `npm run test:jest -- --runInBand` para comprobar la convivencia con las suites existentes. Jest reportó 4 suites y 59 tests, con 1 suite aprobada, 3 fallidas, 37 tests aprobados y 22 fallidos. Las suites existentes CP-06, CP-07 y CP-08 reportaron errores de entorno `connect EACCES 127.0.0.1` cuando Supertest intentó conectarse al servidor local. CP-07 también tuvo un error secundario al leer la contraseña de un usuario cuyo registro no llegó a completarse. La suite nueva aprobó completa en esa corrida. Las pruebas de integración que requieren ese acceso quedan sin validar en este entorno.

## Técnicas y alcance

- **Partición de equivalencia.** Elegí representantes de entradas que deberían recibir el mismo tratamiento. Por ejemplo, `EUR` representa monedas no habilitadas y `ARS/USD` representa etiquetas ambiguas.
- **Análisis de valores límite.** Probé el valor inmediatamente inferior, el exacto y el inmediatamente superior para cada extremo del rango de centavos y para el máximo de decimales en escala 2. Para escala 6 comprobé el máximo exacto usado en cotizaciones.
- **Casos raros.** Incluí `null`, `undefined`, cadenas vacías y texto en lugar de números. Para las entradas fuera del tipo declarado, las conversiones de tipo del test permiten simular lo que podría llegar en JavaScript. En `importeTexto`, se comprueba que esas entradas produzcan un `TypeError` de ejecución.

Quedan fuera del alcance todos los alias individuales de moneda, las combinaciones de separadores y espacios, las escalas distintas de 2 y 6, y los vecinos del máximo de seis decimales. Tampoco se prueban la multiplicación por días, el cálculo del tipo de cambio, los endpoints, la persistencia ni la interfaz.

## Cómo leer un test

`describe` agrupa los casos de una función. `it` registra un caso individual. En este archivo, `it.each` registra un test por cada fila de datos y usa la primera columna como nombre del caso. `expect` indica qué resultado debe verificar Jest.

Este ejemplo muestra I03 con los datos escritos dentro del test:

```typescript
describe('importeTexto', () => {
  it('I03 conserva el cero inicial de un centavo', () => {
    // Arrange: preparar el dato y el resultado esperado.
    const centavos = 1n;
    const esperado = '0.01';

    // Act: ejecutar la función.
    const resultado = importeTexto(centavos);

    // Assert: comprobar el resultado.
    expect(resultado).toBe(esperado);
  });
});
```

En los casos de error, se guarda la llamada en una función y se usa `expect(ejecutar).toThrow(...)`. Así Jest puede ejecutar la llamada y verificar el error que produce.

## Anexo. Código completo de las pruebas

Archivo `back/test/jest/importes.unit.spec.ts`.

```typescript
import {
  decimalEntero,
  importeTexto,
  monedaPublicacion,
} from '../../src/common/utils/importes';

const importeInvalido = 'Importe decimal inválido';
const excesoDecimales = 'El importe tiene demasiados decimales';
const fueraDeRango = 'El total supera el máximo admitido para una reserva';
const monedaNoHabilitada =
  'La moneda de la publicación no está habilitada para reservas';

// Las conversiones de tipo permiten probar entradas que TypeScript rechazaría.
const convertir = (valor: unknown, escala: number) =>
  decimalEntero(valor as Parameters<typeof decimalEntero>[0], escala);

const formatear = (centavos: unknown) =>
  importeTexto(centavos as Parameters<typeof importeTexto>[0]);

const normalizarMoneda = (nombre: string | null | undefined) =>
  monedaPublicacion(nombre as Parameters<typeof monedaPublicacion>[0]);

describe('decimalEntero', () => {
  it.each<[string, unknown, number, bigint]>([
    ['D01 convierte una cadena entera a centavos', '12', 2, 1200n],
    ['D02 completa con cero cuando hay un decimal', 12.3, 2, 1230n],
    ['D03 admite exactamente dos decimales', '12.34', 2, 1234n],
    ['D05 convierte una cotización de seis decimales', '123.456789', 6, 123456789n],
  ])('%s', (_caso, valor, escala, esperado) => {
    // Arrange: los argumentos y el resultado esperado se toman de la fila.

    // Act
    const resultado = convertir(valor, escala);

    // Assert
    expect(resultado).toBe(esperado);
  });

  it.each<[string, unknown, number, string]>([
    ['D04 rechaza tres decimales cuando la escala es dos', '12.345', 2, excesoDecimales],
    ['D06 rechaza un importe negativo', '-1', 2, importeInvalido],
    ['D07 rechaza la coma como separador decimal', '12,34', 2, importeInvalido],
    ['D08 rechaza texto no numérico', 'abc', 2, importeInvalido],
    ['D09 rechaza una cadena vacía', '', 2, importeInvalido],
    ['D10 rechaza null', null, 2, importeInvalido],
    ['D11 rechaza undefined', undefined, 2, importeInvalido],
  ])('%s', (_caso, valor, escala, esperado) => {
    // Arrange: los argumentos y el resultado esperado se toman de la fila.

    // Act
    const ejecutar = () => convertir(valor, escala);

    // Assert
    expect(ejecutar).toThrow(esperado);
  });
});

describe('importeTexto', () => {
  it.each<[string, bigint, string]>([
    ['I02 formatea el mínimo', 0n, '0.00'],
    ['I03 conserva el cero inicial de un centavo', 1n, '0.01'],
    ['I04 separa la parte entera de los centavos', 1234n, '12.34'],
    ['I05 formatea un centavo por debajo del máximo', 9999999998n, '99999999.98'],
    ['I06 admite el máximo', 9999999999n, '99999999.99'],
  ])('%s', (_caso, centavos, esperado) => {
    // Arrange: los argumentos y el resultado esperado se toman de la fila.

    // Act
    const resultado = formatear(centavos);

    // Assert
    expect(resultado).toBe(esperado);
  });

  it.each<[string, bigint]>([
    ['I01 rechaza un centavo por debajo del mínimo', -1n],
    ['I07 rechaza un centavo por encima del máximo', 10000000000n],
  ])('%s', (_caso, centavos) => {
    // Arrange: los argumentos y el resultado esperado se toman de la fila.

    // Act
    const ejecutar = () => formatear(centavos);

    // Assert
    expect(ejecutar).toThrow(fueraDeRango);
  });

  it.each<[string, unknown]>([
    ['I08 rechaza centavos como texto numérico', '123'],
    ['I09 rechaza centavos como texto vacío', ''],
    ['I10 rechaza centavos nulos', null],
    ['I11 rechaza centavos ausentes', undefined],
  ])('%s', (_caso, centavos) => {
    // Arrange: los argumentos y el resultado esperado se toman de la fila.

    // Act
    const ejecutar = () => formatear(centavos);

    // Assert
    expect(ejecutar).toThrow(TypeError);
  });
});

describe('monedaPublicacion', () => {
  it.each<[string, string, 'ARS' | 'USD']>([
    ['M01 reconoce el código ARS dentro de una etiqueta', 'Moneda ARS', 'ARS'],
    ['M02 reconoce el código USD dentro de una etiqueta', 'Moneda USD', 'USD'],
    ['M03 reconoce el alias de pesos con espacios y minúsculas', '  pesos argentinos  ', 'ARS'],
    ['M04 reconoce el alias de dólares con tilde y espacios', '  dólar estadounidense  ', 'USD'],
  ])('%s', (_caso, nombre, esperado) => {
    // Arrange: los argumentos y el resultado esperado se toman de la fila.

    // Act
    const resultado = normalizarMoneda(nombre);

    // Assert
    expect(resultado).toBe(esperado);
  });

  it.each<[string, string | null | undefined]>([
    ['M05 rechaza una moneda no habilitada', 'EUR'],
    ['M06 rechaza una etiqueta con ambos códigos', 'ARS/USD'],
    ['M07 rechaza un nombre vacío', ''],
    ['M08 rechaza un nombre nulo', null],
    ['M09 rechaza un nombre ausente', undefined],
  ])('%s', (_caso, nombre) => {
    // Arrange: los argumentos y el resultado esperado se toman de la fila.

    // Act
    const ejecutar = () => normalizarMoneda(nombre);

    // Assert
    expect(ejecutar).toThrow(monedaNoHabilitada);
  });
});
```
