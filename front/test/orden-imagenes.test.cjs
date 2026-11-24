const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { of, Subject } = require('rxjs');

function signal(value) {
  const leer = () => value;
  leer.set = nuevo => { value = nuevo; };
  leer.update = cambiar => { value = cambiar(value); };
  return leer;
}

function escenario() {
  const peticiones = [];
  const subidas = [];
  const fotos = [1, 2, 3, 4].map(id => ({ id, orden: id - 1, url: `${id}.jpg` }));
  const formulario = { form: { disabled: false }, cargarCatalogos: () => of([]), cargar() {} };
  const dependencias = {
    ActivatedRoute: { snapshot: { paramMap: new Map([['id', '7']]) } },
    PublicacionFormulario: formulario,
    AuthService: { currentUser: () => ({ sub: 7 }) },
    ListingService: { getById: () => of({ anunciante: { idUsuario: 7 }, imagenes: fotos }) },
    AvailabilityService: { getForAdministration: () => of([]) },
    GestionPublicacionesService: {
      ordenarImagenes(id, ids) {
        assert.equal(id, 7);
        const respuesta = new Subject();
        peticiones.push({ ids: [...ids], respuesta });
        return respuesta;
      },
      subirImagen(id, archivo) {
        assert.equal(id, 7);
        subidas.push(archivo.name);
        return of({ id: 100 + subidas.length, orden: 3 + subidas.length, url: `${archivo.name}.jpg` });
      },
    },
  };
  const cache = new Map();
  function cargar(archivo) {
    if (cache.has(archivo)) return cache.get(archivo);
    const codigo = ts.transpileModule(fs.readFileSync(archivo, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true },
    }).outputText;
    const contexto = { exports: {}, require(modulo) {
      if (modulo === '@angular/core') return { Component: () => clase => clase, signal, inject: token => dependencias[token] ?? {} };
      if (modulo === 'rxjs') return require('rxjs');
      if (modulo.endsWith('/orden-imagenes') || modulo.endsWith('/imagenes-publicacion')) return cargar(path.resolve(path.dirname(archivo), `${modulo}.ts`));
      return new Proxy({}, { get: (_, nombre) => nombre });
    } };
    vm.runInNewContext(codigo, contexto, { filename: archivo });
    cache.set(archivo, contexto.exports);
    return contexto.exports;
  }
  const { PublicationFormComponent } = cargar(path.join(__dirname, '../src/app/features/publication-form/publication-form.component.ts'));
  const componente = new PublicationFormComponent();
  function confirmar(index) {
    const peticion = peticiones[index];
    peticion.respuesta.next(peticion.ids.map((id, orden) => ({ ...fotos.find(foto => foto.id === id), orden })));
    peticion.respuesta.complete();
  }
  return { componente, peticiones, subidas, confirmar, ids: () => Array.from(componente.images(), foto => foto.id) };
}

test('al editar se respeta el tope de 15 fotos y se avisa qué archivos quedaron afuera', () => {
  const { componente, subidas, ids } = escenario();
  const foto = (name, type = 'image/jpeg', size = 1024) => ({ name, type, size });
  // La publicación ya tiene 4 fotos: de 12 válidas entran 11, y el PDF y la foto de 11 MB se descartan.
  const validas = Array.from({ length: 12 }, (_, i) => foto(`f${i}`));
  componente.uploadImages([foto('constancia', 'application/pdf'), foto('pesada', 'image/png', 11 * 1024 * 1024), ...validas]);
  assert.deepEqual(subidas, validas.slice(0, 11).map(f => f.name));
  assert.equal(ids().length, 15);
  assert.equal(componente.imageError(), '2 archivo(s) descartado(s): solo imágenes JPG, PNG, WEBP o HEIC de hasta 10 MB. Máximo 15 imágenes por publicación.');
  assert.equal(componente.imagesBusy(), false);
  // Con la galería completa no se sube nada más.
  componente.uploadImages([foto('extra')]);
  assert.equal(subidas.length, 11);
  assert.equal(componente.imageError(), 'Máximo 15 imágenes por publicación.');
});

test('el movimiento es inmediato aunque el servidor todavía no respondió', () => {
  const { componente, peticiones, confirmar, ids } = escenario();
  componente.reorderImages({ desde: 0, hasta: 3 });
  assert.deepEqual(ids(), [2, 3, 4, 1]);
  assert.equal(componente.imageOrderSaving(), true);
  assert.equal(componente.imagesBusy(), false);
  assert.equal(peticiones.length, 1);
  confirmar(0);
  assert.deepEqual(ids(), [2, 3, 4, 1]);
  assert.equal(componente.imageOrderSaving(), false);
});

test('los movimientos rápidos se agrupan y nunca hay dos guardados simultáneos', () => {
  const { componente, peticiones, confirmar, ids } = escenario();
  componente.reorderImages({ desde: 0, hasta: 3 });
  componente.reorderImages({ desde: 0, hasta: 2 });
  componente.reorderImages({ desde: 3, hasta: 0 });
  assert.deepEqual(ids(), [1, 3, 4, 2]);
  assert.equal(peticiones.length, 1);
  confirmar(0);
  assert.equal(peticiones.length, 2);
  assert.deepEqual(peticiones[1].ids, [1, 3, 4, 2]);
  assert.deepEqual(ids(), [1, 3, 4, 2]);
  confirmar(1);
  assert.equal(componente.imageOrderSaving(), false);
});

test('un fallo restaura el último orden confirmado y permite reintentar', () => {
  const { componente, peticiones, confirmar, ids } = escenario();
  componente.reorderImages({ desde: 0, hasta: 3 });
  componente.reorderImages({ desde: 0, hasta: 2 });
  confirmar(0);
  peticiones[1].respuesta.error(new Error('Sin conexión'));
  assert.deepEqual(ids(), [2, 3, 4, 1]);
  assert.equal(componente.imageOrderSaving(), false);
  assert.match(componente.imageError(), /Restauramos el último orden confirmado/);
  componente.reorderImages({ desde: 3, hasta: 0 });
  confirmar(2);
  assert.deepEqual(ids(), [1, 2, 3, 4]);
  assert.equal(componente.imageError(), '');
});

test('un primer fallo revierte todos los movimientos pendientes', () => {
  const { componente, peticiones, ids } = escenario();
  componente.reorderImages({ desde: 0, hasta: 3 });
  componente.reorderImages({ desde: 0, hasta: 2 });
  peticiones[0].respuesta.error(new Error('Sin conexión'));
  assert.deepEqual(ids(), [1, 2, 3, 4]);
  assert.equal(peticiones.length, 1);
  assert.equal(componente.imageOrderSaving(), false);
});

test('los índices inválidos y las operaciones bloqueadas no escriben ni alteran el orden', () => {
  const { componente, peticiones, ids } = escenario();
  for (const cambio of [{ desde: -1, hasta: 2 }, { desde: 0, hasta: 9 }, { desde: 1, hasta: 1 }]) componente.reorderImages(cambio);
  componente.form.disabled = true;
  componente.reorderImages({ desde: 0, hasta: 2 });
  componente.form.disabled = false;
  componente.imagesBusy.set(true);
  componente.reorderImages({ desde: 0, hasta: 2 });
  assert.deepEqual(ids(), [1, 2, 3, 4]);
  assert.equal(peticiones.length, 0);
});

function galeria(reducirMovimiento = false, ordenable = true, deshabilitada = false) {
  let renderizar;
  const animaciones = [];
  const movimientos = [];
  const espacios = [0, 110, 220, 330].map(left => ({ left, right: left + 100, top: 0, bottom: 100 }));
  const tarjetas = espacios.map((rect, index) => ({ nativeElement: {
    getBoundingClientRect: () => rect,
    ownerDocument: { defaultView: { matchMedia: () => ({ matches: reducirMovimiento }) } },
    animate(cuadros, opciones) {
      animaciones.push({ index, cuadros, opciones });
      return { finished: Promise.resolve(), cancel() {} };
    },
  } }));
  const codigo = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/app/shared/components/galeria-imagenes/galeria-imagenes.component.ts'), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true },
  }).outputText;
  const input = value => signal(value);
  input.required = () => signal([]);
  const contexto = { exports: {}, require(modulo) {
    if (modulo === '@angular/core') return {
      Component: () => clase => clase, signal, input, output: () => ({ emit: cambio => movimientos.push(cambio) }),
      viewChildren: nombre => () => nombre === 'tarjetaFoto' ? tarjetas : espacios.map(rect => ({ nativeElement: { getBoundingClientRect: () => rect } })),
      afterRenderEffect: callback => { renderizar = callback; }, inject: () => ({ onDestroy() {} }),
    };
    if (modulo.endsWith('/orden-imagenes')) return { moverImagen(lista, desde, hasta) {
      const copia = [...lista];
      copia.splice(hasta, 0, copia.splice(desde, 1)[0]);
      return copia;
    } };
    throw new Error(modulo);
  } };
  vm.runInNewContext(codigo, contexto);
  const componente = new contexto.exports.GaleriaImagenesComponent();
  componente.ordenable.set(ordenable);
  componente.disabled.set(deshabilitada);
  componente.fotos.set([1, 2, 3, 4].map(id => ({ url: `${id}.jpg` })));
  renderizar();
  componente.iniciar({ preventDefault() {} }, 0);
  renderizar();
  componente.permitir({ clientX: 250, clientY: 50, preventDefault() {} }, 2);
  renderizar();
  return { animaciones, componente, movimientos };
}

test('al arrastrar se desplazan juntas la foto elegida y las dos fotos intermedias', () => {
  const { animaciones } = galeria();
  assert.deepEqual(Array.from(animaciones, animacion => animacion.index), [0, 1, 2]);
  assert.deepEqual(Array.from(animaciones, animacion => animacion.cuadros[1].transform), ['translate(220px, 0px)', 'translate(-110px, 0px)', 'translate(-110px, 0px)']);
  for (const animacion of animaciones) {
    assert.equal(animacion.opciones.duration, 240);
    assert.equal(animacion.opciones.fill, 'both');
  }
});

test('movimiento reducido conserva la vista previa del orden sin transición', () => {
  const { animaciones } = galeria(true);
  assert.equal(animaciones.length, 3);
  for (const animacion of animaciones) assert.equal(animacion.opciones.duration, 0);
});

test('la galería de adjuntos conserva nombres y no permite arrastrar ni reordenar', () => {
  const { componente, animaciones, movimientos } = galeria(false, false);
  let bloqueado = false;
  componente.iniciar({ preventDefault() { bloqueado = true; } }, 0);
  componente.mover(0, 2);
  assert.equal(bloqueado, true);
  assert.equal(componente.arrastrada(), null);
  assert.equal(componente.destino(), null);
  assert.equal(animaciones.length, 0);
  assert.equal(movimientos.length, 0);
  assert.equal(componente.textoAlternativo({ url: 'foto.jpg', nombre: 'Comprobante.jpg' }, 0), 'Comprobante.jpg');
  assert.equal(componente.textoAlternativo({ url: 'foto.jpg' }, 1), 'imagen 2');
});

test('las publicaciones mantienen portada, controles de orden y el bloqueo al deshabilitar', () => {
  const { componente, movimientos } = galeria();
  assert.equal(componente.textoAlternativo({ url: 'foto.jpg', nombre: 'Comprobante.jpg' }, 0), 'Foto 1, portada');
  componente.mover(0, 2);
  assert.equal(movimientos.length, 1);
  assert.equal(movimientos[0].desde, 0);
  assert.equal(movimientos[0].hasta, 2);
  const bloqueada = galeria(false, true, true);
  bloqueada.componente.mover(0, 2);
  assert.equal(bloqueada.movimientos.length, 0);
  assert.equal(bloqueada.animaciones.length, 0);
});
