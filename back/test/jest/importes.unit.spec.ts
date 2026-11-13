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
