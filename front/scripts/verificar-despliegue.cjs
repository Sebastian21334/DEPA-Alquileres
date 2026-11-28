const assert = require('node:assert/strict');
const { readFileSync, statSync } = require('node:fs');
const { dirname, resolve } = require('node:path');

for (const config of ['../../vercel.json', '../vercel.json']) {
  const archivo = resolve(__dirname, config);
  const { outputDirectory, rewrites } = JSON.parse(readFileSync(archivo, 'utf8'));
  const fallback = rewrites.find(({ source }) => source === '/(.*)');
  assert.ok(fallback, 'Falta la ruta de entrada a la SPA en ' + config);

  const salida = resolve(dirname(archivo), outputDirectory);
  const entrada = resolve(salida, '.' + fallback.destination);
  assert.ok(statSync(entrada).isFile(), 'La entrada configurada debe existir en la compilación');
  assert.match(readFileSync(entrada, 'utf8'), /<app-root\b/, 'La entrada debe iniciar Angular');
}
