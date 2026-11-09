const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const assert = require('node:assert/strict');

const SRC = path.join(__dirname, '..', 'src');

function archivos(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = path.join(dir, entrada.name);
    return entrada.isDirectory() ? archivos(ruta) : [ruta];
  });
}

function leer(relativa) {
  return fs.readFileSync(path.join(SRC, relativa), 'utf8');
}

function violaciones(dirs, patron) {
  return dirs.flatMap((dir) =>
    archivos(path.join(SRC, dir))
      .filter((archivo) => archivo.endsWith('.ts'))
      .filter((archivo) => patron.test(fs.readFileSync(archivo, 'utf8')))
      .map((archivo) => path.relative(SRC, archivo)),
  );
}

test('los services de los dominios refactorizados no importan TypeORM', () => {
  assert.deepEqual(
    violaciones(
      [
        'reservas/service',
        'pagos/service',
        'reembolsos/service',
        'reclamos/service',
        'disputas/service',
        'bloqueo-anunciante/service',
      ],
      /from ['"](?:typeorm|@nestjs\/typeorm)['"]/,
    ),
    [],
  );
});

test('los controllers no acceden a repositorios ni a TypeORM', () => {
  assert.deepEqual(
    violaciones(
      [
        'reservas/controller',
        'pagos/controller',
        'reembolsos/controller',
        'reclamos/controller',
        'disputas/controller',
        'bloqueo-anunciante/controller',
      ],
      /InjectRepository|DataSource|EntityManager|Repository</,
    ),
    [],
  );
});

test('las entidades de reservas, pagos y reembolsos son anémicas', () => {
  for (const archivo of [
    'reservas/entity/reserva.entity.ts',
    'pagos/entity/pago.entity.ts',
    'reembolsos/entity/reembolso.entity.ts',
  ]) {
    const contenido = leer(archivo);
    assert.doesNotMatch(
      contenido,
      /^  (?!static\s)[a-zA-Z_]\w*\(/m,
      `${archivo} declara métodos de negocio`,
    );
    assert.doesNotMatch(contenido, /toJSON\s*\(/, `${archivo} declara toJSON`);
  }
});

test('los repositorios nuevos no consultan entidades de otro dominio', () => {
  const casos = [
    ['reembolsos/repository', /from ['"]\.\.\/\.\.\/pagos\//],
    ['reclamos/repository', /from ['"]\.\.\/\.\.\/reservas\//],
    ['disputas/repository', /from ['"]\.\.\/\.\.\/(?:reservas|pagos)\//],
  ];
  for (const [dir, patron] of casos) {
    assert.deepEqual(violaciones([dir], patron), []);
  }
});

test('el módulo core de pagos no importa módulos de dominio', () => {
  const contenido = leer('pagos/pagos.module.ts');
  assert.doesNotMatch(
    contenido,
    /ReservasModule|ReembolsosModule|DisputasModule|ReclamosModule/,
  );
});
