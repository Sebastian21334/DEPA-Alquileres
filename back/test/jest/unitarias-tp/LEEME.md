# Pruebas unitarias de DEPA: PU-01 a PU-16

Se implementan exactamente los 16 casos del informe **Pruebas Unitarias - TP.pdf** de Santiago Gomez y Sebastián Gonzalez. Se conservan las entradas, los resultados esperados y las técnicas del PDF. Cada fila genera un test de Jest con su ID; no hay tests omitidos, `todo`, `test.failing` ni casos adicionales con numeración PU.

Repositorio: https://github.com/Sebastian21334/DEPA-Alquileres

Base revisada y ejecutada: `main`, commit `c96c49517c977d28c43dfe57e1cfc03ad951ae99`, consultado el 13/11/2026. Los únicos cambios de la entrega son los cuatro archivos de prueba y esta documentación. No se modificó el backend, su configuración, sus dependencias ni su lockfile. No se publicó una rama ni un PR.

## Instalación y ejecución

El repositorio ya incluye Jest, ts-jest, @types/jest, @nestjs/testing, class-validator y class-transformer. También incluye `back/test/jest/jest.config.cjs`, `back/test/jest/tsconfig.json` y el script `test:jest`. No hace falta crear otra configuración ni instalar una versión diferente de Jest.

1. Usar Node **24.9 o superior**, como exige la configuración real de Jest por Nest 12 y su carga ESM.
2. Copiar la carpeta `back/test/jest/unitarias-tp/` de esta entrega a la misma ubicación del repositorio. Si se usa la copia local incluida, los archivos ya están allí.
3. Abrir una terminal en `back/` y ejecutar:

```sh
npm ci
npm run test:jest -- --runInBand --testPathPatterns=unitarias-tp
```

El comando selecciona solamente las cuatro suites de este informe. `npm run test:jest` sin filtro también las descubre, pero ejecuta además las otras suites del proyecto. No se agrega un script `npm test` porque el repositorio usa `test:jest`.

Para generar un resultado JSON en tu entorno:

```sh
npm run test:jest -- --runInBand --testPathPatterns=unitarias-tp --json --outputFile=resultado-unitarias-tp.json
```

No se necesita `.env`, PostgreSQL, credenciales, Mercado Pago ni iniciar el servidor. No se ejecutan migraciones ni seeds.

## Correspondencia exacta con el informe

En todas las fechas de esta tabla, el mes y año son diciembre de 2026. Los archivos usan ISO `YYYY-MM-DD` y fechas UTC, como espera el backend; no usan el parseo ambiguo de `DD/MM/YYYY`.

| ID | Entrada del PDF | Resultado esperado conservado | Técnica del PDF | Archivo |
| --- | --- | --- | --- | --- |
| PU-01 | Precio 150000 | Aceptado | Partición válida | cp-01-precio.spec.ts |
| PU-02 | Precio -100 | Rechazado | Partición inválida | cp-01-precio.spec.ts |
| PU-03 | Precio 0 | Rechazado | Valor límite | cp-01-precio.spec.ts |
| PU-04 | Precio 1 | Aceptado | Valor límite | cp-01-precio.spec.ts |
| PU-05 | Entrada 10/12, salida 15/12 | Aceptado | Partición válida | cp-02-fechas.spec.ts |
| PU-06 | Entrada 15/12, salida 10/12 | Rechazado | Partición inválida | cp-02-fechas.spec.ts |
| PU-07 | Entrada 10/12, salida 10/12 | Aceptado | Valor límite | cp-02-fechas.spec.ts |
| PU-08 | ejemplo@gmail.com | Aceptado | Partición válida | cp-03-correo.spec.ts |
| PU-09 | ejemplo.com | Rechazado | Partición inválida | cp-03-correo.spec.ts |
| PU-10 | ejemplo@ | Rechazado | Partición inválida | cp-03-correo.spec.ts |
| PU-11 | Cadena vacía `""` | Rechazado | Valor límite | cp-03-correo.spec.ts |
| PU-12 | ejemplo@gmail | Rechazado | Partición inválida | cp-03-correo.spec.ts |
| PU-13 | Entrada 20/12, salida 23/12 | Aceptado / Disponible | Partición válida | cp-04-superposicion.spec.ts |
| PU-14 | Entrada 12/12, salida 13/12 | Rechazado / No disponible | Partición inválida | cp-04-superposicion.spec.ts |
| PU-15 | Entrada 16/12, salida 20/12 | Aceptado / Disponible | Valor límite | cp-04-superposicion.spec.ts |
| PU-16 | Entrada 15/12, salida 20/12 | Rechazado / No disponible | Valor límite | cp-04-superposicion.spec.ts |

## Qué implementación real se ejecuta

**CP-01:** `CrearPublicacionDto.precio` usa `@IsNumber()` y `@IsPositive()`. Se ejecuta `ValidationPipe.transform()` con el DTO completo y las opciones globales de `src/main.ts`: `whitelist: true`, `forbidNonWhitelisted: true`. Todos los otros campos son válidos. En los rechazos se exige el error de precio, evitando que un campo ajeno haga pasar el test por equivocación. Es la validación de entrada de **POST /publicaciones**, no una llamada HTTP ni una inserción de publicación. No se inventa un método `validarPrecio` en el servicio.

**CP-02:** se ejecuta **ReservasService.crearPendiente(dto, idUsuario, condiciones)** completo. `CrearReservaDto` comprueba formato ISO; la comparación de fechas está en el servicio y rechaza `inicio > fin`. Se registran las diez dependencias reales con `Test.createTestingModule()`. Los repositorios, las transacciones y los servicios colaboradores se simulan; el método bajo prueba y su control de fechas son reales. Los casos aceptados deben llegar a guardar una reserva y marcar las fechas como reservadas. El rango invertido debe producir el mensaje específico de fechas y no guardar ni consultar disponibilidad.

El reloj de CP-02 se fija en **13/11/2026, 12:00 de Argentina** (`15:00Z`) y se restaura después de cada caso. Así, diciembre de 2026 no se vuelve pasado en futuras ejecuciones. Se provee un presupuesto vigente en ARS y un precio auxiliar de 100: total 600 para el 10 al 15 inclusivos y total 100 para el mismo día. Estos son datos auxiliares necesarios para la firma real, no nuevas entradas ni resultados del PDF. En PU-06 el presupuesto no llega a evaluarse. No se reemplaza el método bajo prueba ni se inicia el ciclo de vida de la aplicación.

La ruta real que termina llamando a ese método es **POST /pagos/checkout**, mediante `PagosService.crearCheckout`, después de validar el presupuesto. **POST /pagos/presupuesto** cotiza previamente y también controla fechas. No existe un POST /reservas para crear una reserva en esta versión. Esta suite aísla el servicio de reservas; no prueba toda esa cadena HTTP ni la firma de presupuestos.

**CP-03:** se usa el `RegisterDto` real, incluido su campo heredado `contrasenia`, con la misma `ValidationPipe`. `email` tiene `@IsEmail()`, `@IsNotEmpty()` y `@MaxLength(150)`. Se exige el error específico de email y se comprueba que todos los errores correspondan a ese campo. Corresponde a la validación de entrada de **POST /auth/register**. No prueba unicidad de email, envío de verificación ni persistencia de usuarios.

**CP-04:** se ejecuta **DisponibilidadService.verificarDisponibilidad(42, inicio, fin)** real. Se simula únicamente `IFechaRepository.buscarPorRango` sobre un calendario completo de diciembre: una fila por día, con los días **10 al 15 inclusive** ocupados por la misma reserva y el resto libre. El mock solo selecciona filas del rango, como el `BETWEEN` de `FechaRepository`; no calcula la respuesta esperada ni decide si hay superposición. El servicio real exige todas las filas y verifica `disponible` y `reserva`. También se verifica que haya consultado los argumentos exactos una sola vez. Es un método interno, sin endpoint propio. No se prueba SQL, aislamiento de transacciones ni concurrencia.

## Inconsistencias y límites del informe

1. **PU-07:** el PDF dice **Aceptado** para entrada y salida el 10/12/2026, pero CP-02 exige que la salida sea posterior y una duración de al menos un día. La suite conserva literalmente **Aceptado**. El backend también lo acepta: usa `inicio > fin` y cuenta los extremos con `diferencia + 1`. Un resultado aprobado de PU-07 confirma esa fila del PDF, pero no confirma la regla estricta `salida > entrada` / al menos una noche. Si se decide aplicar esa regla estricta, hay que corregir el informe y el backend; no se cambió silenciosamente el esperado del test.
2. **Nomenclatura CP-04:** su título repite «Validación de correo electrónico», pero su descripción, precondición y PU-13 a PU-16 tratan la superposición de reservas. Se mantiene **CP-04** y se usa el nombre descriptivo «Superposición de reservas» en el archivo y en `describe`.
3. **Límite 15/16:** la reserva existente incluye el **15/12**; la propiedad vuelve a estar disponible el **16/12**. PU-15 empieza el 16 y se acepta; PU-16 empieza el 15 y se rechaza. No se interpreta la salida como un extremo exclusivo ni se sustituyen estos casos por los de mensajes anteriores de ChatGPT.

## Resultado comprobado

La ejecución final registrada aprobó **4 suites y 16 tests**, con **0 fallos y 0 omitidos**, en **9.617 segundos**. La comprobación de TypeScript también terminó sin errores. Ver `RESULTADO.md` y `resultado-pu-01-16.json` en la raíz de la entrega para el registro, versiones y alcance de las verificaciones. Esto informa la ejecución de estas 16 pruebas, no la aprobación de todas las pruebas del repositorio ni de una integración con PostgreSQL o Mercado Pago.

Si se usa el parche alternativo, aplicarlo sobre la revisión indicada con `git apply cambios-pu-01-16.patch`, sin copiar antes los mismos archivos. El ZIP contiene los archivos listos para copiar; el parche es otra forma de incorporar los mismos cambios.
