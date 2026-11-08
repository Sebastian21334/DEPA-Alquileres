const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/app/shared/utils/home-card-image.ts'), 'utf8');
const context = { exports: {}, URL, encodeURIComponent };
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText, context);
const { homeCardImage } = context.exports;
const photo = 'https://seminario1integrador.blob.core.windows.net/imagenes/publicaciones/1050-foto.jpg';

test('las vistas sin optimización conservan la foto completa', () => {
  const image = homeCardImage(photo, false);
  assert.equal(image.src, photo);
  assert.equal(image.srcset, null);
});

test('las tarjetas del inicio ofrecen tres resoluciones y conservan el origen completo', () => {
  const image = homeCardImage(photo, true);
  const fallback = new URL(image.src, 'https://depa-alquileres.vercel.app');
  assert.equal(fallback.pathname, '/_vercel/image');
  assert.equal(fallback.searchParams.get('url'), photo);
  assert.equal(fallback.searchParams.get('w'), '640');
  const candidates = image.srcset.split(', ').map((candidate) => {
    const [url, descriptor] = candidate.split(' ');
    const request = new URL(url, fallback.origin);
    assert.equal(request.searchParams.get('url'), photo);
    assert.equal(descriptor, `${request.searchParams.get('w')}w`);
    return Number(request.searchParams.get('w'));
  });
  assert.deepEqual(candidates, [320, 640, 1024]);
});

test('también optimiza las imágenes existentes del catálogo de prueba', () => {
  const url = photo.replace('imagenes/', 'rnf8-20261102-cd588e/');
  assert.ok(homeCardImage(url, true).srcset);
});

test('no envía fotos privadas, enlaces firmados ni otros servidores al optimizador', () => {
  for (const url of [
    '/images/hero-mydepa.png', '/images/Logo.png', 'data:image/png;base64,AA==',
    photo.replace('seminario1integrador.', 'otro.'),
    photo.replace('.net/', '.net.ejemplo.com/'),
    photo.replace('https:', 'http:'),
    photo.replace('/imagenes/publicaciones/', '/verificaciones/usuarios/'),
    `${photo}?sv=token-privado`, `${photo}#fragmento`,
    photo.replace('https://', 'https://usuario:clave@'),
    photo.replace('.net/', '.net:8443/'),
  ]) {
    const image = homeCardImage(url, true);
    assert.equal(image.src, url);
    assert.equal(image.srcset, null);
  }
});

test('los tamaños, calidad y orígenes generados coinciden con ambas configuraciones de Vercel', () => {
  const configs = ['../../vercel.json', '../vercel.json'].map((file) =>
    JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8')).images,
  );
  assert.deepEqual(configs[0], configs[1]);
  for (const original of [photo, photo.replace('imagenes/', 'rnf8-20261102-cd588e/')]) {
    for (const candidate of homeCardImage(original, true).srcset.split(', ')) {
      const request = new URL(candidate.split(' ')[0], 'https://depa-alquileres.vercel.app');
      const origin = new URL(request.searchParams.get('url'));
      const config = configs[0];
      assert.ok(config.sizes.includes(Number(request.searchParams.get('w'))));
      assert.ok(config.qualities.includes(Number(request.searchParams.get('q'))));
      assert.ok(config.remotePatterns.some((pattern) =>
        origin.protocol === `${pattern.protocol}:` &&
        new RegExp(pattern.hostname).test(origin.hostname) &&
        new RegExp(pattern.pathname).test(origin.pathname) &&
        origin.search === pattern.search,
      ));
    }
  }
  assert.deepEqual(configs[0].localPatterns, []);
  assert.deepEqual(configs[0].formats, ['image/webp']);
});
