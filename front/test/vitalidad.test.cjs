const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { of, throwError, Observable, firstValueFrom } = require('rxjs');
const carpeta = path.join(__dirname, '../src/app/features/solicitud-anunciante/captura-identidad');
function cargar(archivo, entorno = {}) {
  const contexto = { exports: {}, Error, Date, Map, Math, Number, ...entorno };
  const codigo = ts.transpileModule(fs.readFileSync(path.join(carpeta, archivo), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true },
  }).outputText;
  vm.runInNewContext(codigo, contexto);
  return contexto.exports;
}
const util = cargar('vitalidad.ts');

function cara(yaw = 0, roll = 0) {
  const puntos = Array.from({ length: 468 }, () => ({ x: .5, y: .5 }));
  puntos[1] = { x: .5 + yaw * .4, y: .5 };
  puntos[234] = { x: .3, y: .5 }; puntos[454] = { x: .7, y: .5 };
  puntos[10] = { x: .5, y: .2 }; puntos[152] = { x: .5, y: .82 };
  puntos[33] = { x: .38, y: .4 }; puntos[263] = { x: .62, y: .4 + Math.tan(roll) * .24 };
  return puntos;
}
function resultado(yaw = 0, roll = 0, boca = 0) {
  return { faceLandmarks: [cara(yaw, roll)], faceBlendshapes: [{ categories: [{ categoryName: 'jawOpen', score: boca }] }] };
}

function conBoca(puntos, apertura, aspecto) {
  const copia = puntos.map(p => ({ ...p }));
  copia[61] = { x: .44, y: .62 }; copia[291] = { x: .56, y: .62 };
  copia[13] = { x: .5, y: .62 - apertura * .12 * aspecto / 2 };
  copia[14] = { x: .5, y: .62 + apertura * .12 * aspecto / 2 };
  return copia;
}

test('la apertura de labios se mide igual en cámara vertical, cuadrada y horizontal', () => {
  for (const aspecto of [.5625, 1, 16 / 9]) {
    const medida = util.medirAperturaBoca(conBoca(cara(), .24, aspecto), aspecto);
    assert.ok(Math.abs(medida - .24) < 1e-9);
  }
  assert.equal(util.medirAperturaBoca([], 16 / 9), null);
  assert.equal(util.medirAperturaBoca(cara(), 16 / 9), null);
});

test('la boca geométricamente abierta funciona con puntaje bajo y una postura natural', () => {
  const neutral = { yaw: 0, roll: 0 };
  assert.equal(util.detectarGesto('OPEN_MOUTH', { yaw: .09, roll: .15 }, neutral, .1, .24, .02), true);
  assert.equal(util.detectarGesto('OPEN_MOUTH', neutral, neutral, .9, .04, .02), false);
  assert.equal(util.detectarGesto('OPEN_MOUTH', neutral, neutral, .9, .17, .14), false);
  assert.equal(util.detectarGesto('OPEN_MOUTH', { yaw: .2, roll: 0 }, neutral, .9, .24, .02), false);
  assert.equal(util.bocaEnReposo(.04, .02, .6), true);
  assert.equal(util.bocaEnReposo(.24, .02, .1), false);
});

test('el encuadre detecta caras ausentes, múltiples, lejanas, cortadas y fuera del centro', () => {
  assert.equal(util.evaluarEncuadre([cara()]), null);
  assert.match(util.evaluarEncuadre([]), /No vemos tu cara/);
  assert.match(util.evaluarEncuadre([cara(), cara()]), /más de una/);
  const lejana = cara(); lejana[234].x = .46; lejana[454].x = .54;
  assert.match(util.evaluarEncuadre([lejana]), /Acerc/);
  const cortada = cara(); cortada[10].y = 0;
  assert.match(util.evaluarEncuadre([cortada]), /Alej/);
  const fuera = cara().map(p => ({ x: p.x + .2, y: p.y }));
  assert.match(util.evaluarEncuadre([fuera]), /centro/);
  const invalida = cara(); invalida[1].x = NaN;
  assert.match(util.evaluarEncuadre([invalida]), /No vemos bien/);
});

test('los gestos distinguen dirección, inclinación y boca sin aceptar la cabeza girada', () => {
  const n = { yaw: 0, roll: 0 };
  assert.equal(util.detectarGesto('TURN_LEFT', { yaw: .09, roll: 0 }, n, 0), true);
  assert.equal(util.detectarGesto('TURN_LEFT', { yaw: -.09, roll: 0 }, n, 0), false);
  assert.equal(util.detectarGesto('TURN_RIGHT', { yaw: -.09, roll: 0 }, n, 0), true);
  assert.equal(util.detectarGesto('TILT_HEAD', { yaw: 0, roll: -.2 }, n, 0), true);
  assert.equal(util.detectarGesto('OPEN_MOUTH', n, n, .6), true);
  assert.equal(util.detectarGesto('OPEN_MOUTH', { yaw: .2, roll: 0 }, n, .6), false);
  assert.equal(util.detectarGesto('OPEN_MOUTH', n, null, .6), false);
});

test('el avance depende del tiempo sostenido y se reinicia al perder la cara o pausar la pestaña', () => {
  for (const intervalo of [40, 100, 200, 500]) {
    const p = new util.PosicionEstable();
    for (let t = 0; t < 900; t += intervalo) assert.ok(p.progreso(true, t, 900) < 100);
    assert.equal(p.progreso(true, 1000, 900), 100);
    assert.equal(p.progreso(false, 1100, 900), 0);
    assert.equal(p.progreso(true, 1200, 900), 0);
    assert.equal(p.progreso(true, 5000, 900), 0);
  }
});

function escenario(service = { validarVitalidad: () => of({ valid: true, verificationToken: 'servidor' }) }) {
  const reloj = { ahora: 0 };
  const signal = (inicial) => {
    let valor = inicial;
    const getter = () => valor;
    getter.set = v => { valor = v; }; getter.update = fn => { valor = fn(valor); };
    return getter;
  };
  class EventEmitter { eventos = []; emit(v) { this.eventos.push(v); } }
  const angular = { Component: () => c => c, ViewChild: () => () => {}, Output: () => () => {},
    EventEmitter, signal, computed: fn => fn, inject: () => service };
  const modelos = { intentos: [], cerrados: 0 };
  const modelosApi = { FilesetResolver: { forVisionTasks: async () => ({}) }, FaceLandmarker: {
    createFromOptions: async (_, opciones) => {
      modelos.intentos.push(opciones.baseOptions.delegate);
      if (opciones.baseOptions.delegate === 'GPU') throw new Error('GPU no disponible');
      return { close: () => modelos.cerrados++ };
    },
  } };
  const navegador = { mediaDevices: {} };
  const mod = cargar('captura-identidad.component.ts', {
    require: id => id === '@angular/core' ? angular : id === './vitalidad' ? util :
      id === '@mediapipe/tasks-vision' ? modelosApi : id === 'rxjs' ? { firstValueFrom } :
      id === '@angular/core/rxjs-interop' ? { takeUntilDestroyed: () => fuente => fuente } : { VerificacionFacialService: class {} },
    performance: { now: () => reloj.ahora },
    window: { setTimeout: fn => { fn(); return 0; }, clearInterval: () => {} },
    document: { body: { style: { overflow: '' } } },
    navigator: navegador,
    cancelAnimationFrame: () => {}, URL: { revokeObjectURL: () => {} },
  });
  const c = new mod.CapturaIdentidadComponent();
  c.dialogRef = { nativeElement: { close() {} } };
  c.videoRef = { nativeElement: { srcObject: null } };
  c.captureFrame = async nombre => ({ name: nombre });
  c.instrucciones.set([{ type: 'TURN_LEFT', label: 'Izquierda' }, { type: 'OPEN_MOUTH', label: 'Boca' }]);
  c.frente = {}; c.dorso = {}; c.neutralPhoto = {};
  const tick = async (t, r) => {
    reloj.ahora = t; c.ultimaDeteccion = r; c.ultimaDeteccionEn = t;
    await c.processLiveness(r);
  };
  return { c, tick, reloj, modelos, navegador };
}

test('no calibra ni captura ante dos caras, y una postura estable habilita los gestos', async () => {
  const { c, tick } = escenario(); c.fase.set('calibrating');
  await tick(0, { faceLandmarks: [cara(), cara()], faceBlendshapes: resultado().faceBlendshapes });
  assert.equal(c.fase(), 'calibrating'); assert.match(c.feedback(), /más de una/);
  for (let t = 100; t <= 1100; t += 100) await tick(t, resultado());
  assert.equal(c.fase(), 'actions'); assert.ok(c.neutralPhoto);
});

test('un giro contrario no avanza; el giro sostenido captura y exige volver al centro', async () => {
  const { c, tick } = escenario(); c.fase.set('actions'); c.neutralPose = { yaw: 0, roll: 0 };
  await tick(0, resultado(-.1)); assert.match(c.feedback(), /otro lado/); assert.equal(c.actionPhotos.length, 0);
  for (let t = 100; t <= 800; t += 100) await tick(t, resultado(.1));
  assert.equal(c.actionPhotos.length, 1); assert.equal(c.actionPhotos[0].length, 2);
  assert.equal(c.fase(), 'recentering'); assert.equal(c.indiceInstruccion(), 0);
  for (let t = 900; t <= 1500; t += 100) await tick(t, resultado());
  assert.equal(c.fase(), 'actions'); assert.equal(c.indiceInstruccion(), 1);
});

test('captura la boca abierta por labios sin depender de jawOpen y vuelve a centrar al cerrarla', async () => {
  const { c, tick } = escenario();
  c.fase.set('actions'); c.neutralPose = { yaw: 0, roll: 0 }; c.aperturaNeutral = .02;
  c.indiceInstruccion.set(1); c.cameraAspectRatio.set(16 / 9);
  const abierta = resultado(.09, .15, .1);
  abierta.faceLandmarks = [conBoca(cara(.09, .15), .24, 16 / 9)];
  for (let t = 0; t <= 700; t += 100) await tick(t, abierta);
  assert.equal(c.actionPhotos.length, 1);
  assert.equal(c.fase(), 'centering');
  const cerrada = resultado(0, 0, .6);
  cerrada.faceLandmarks = [conBoca(cara(), .04, 16 / 9)];
  await tick(800, cerrada);
  assert.equal(c.estadoEnVivo(), 'detected');
});

test('el resultado válido espera confirmación del servidor y no envía documentos automáticamente', async () => {
  const { c, reloj } = escenario(); c.neutralPose = { yaw: 0, roll: 0 };
  c.ultimaDeteccion = resultado(); c.ultimaDeteccionEn = reloj.ahora;
  await c.finalizeLiveness();
  assert.equal(c.fase(), 'complete'); assert.equal(c.estadoEnVivo(), 'confirmed');
  assert.equal(c.pruebaVidaCompletada.eventos.length, 0);
  c.enviarCapturas(); assert.equal(c.pruebaVidaCompletada.eventos[0].verificationToken, 'servidor');
});

test('una respuesta inválida o un rechazo del servidor nunca muestran prueba válida y conservan el DNI', async () => {
  for (const respuesta of [() => of({ valid: false }), () => throwError(() => new Error('Gesto no válido'))]) {
    const { c } = escenario({ validarVitalidad: respuesta }); c.neutralPose = { yaw: 0, roll: 0 };
    c.ultimaDeteccion = resultado(); c.ultimaDeteccionEn = 0;
    await c.finalizeLiveness();
    assert.equal(c.fase(), 'error'); assert.ok(c.frente); assert.ok(c.dorso);
    assert.equal(c.pruebaVidaCompletada.eventos.length, 0);
  }
});

test('si la persona se mueve antes de la foto final, pide centrar de nuevo y no consulta al servidor', async () => {
  const { c } = escenario({ validarVitalidad: () => { assert.fail('No debe validar'); } });
  c.neutralPose = { yaw: 0, roll: 0 }; c.ultimaDeteccion = resultado(.2); c.ultimaDeteccionEn = 0;
  await c.finalizeLiveness(); assert.equal(c.fase(), 'centering');
});

test('usa CPU cuando falla GPU y libera el modelo al cerrar', async () => {
  const { c, modelos } = escenario();
  await c.initializeFaceLandmarker(); assert.deepEqual(modelos.intentos, ['GPU', 'CPU']);
  c.ngOnDestroy(); assert.equal(modelos.cerrados, 1);
});

test('cerrar mientras se obtiene permiso no deja la cámara encendida al resolver', async () => {
  const { c, navegador } = escenario(); let completar; let detenidas = 0;
  navegador.mediaDevices.getUserMedia = () => new Promise(resolve => { completar = resolve; });
  const pendiente = c.startCamera('user'); c.ngOnDestroy();
  completar({ getTracks: () => [{ stop: () => detenidas++ }] });
  await pendiente; assert.equal(detenidas, 1); assert.equal(c.cameraReady(), false);
});

test('cerrar mientras valida ignora respuestas tardías y nunca emite documentación', async () => {
  let completar;
  const { c } = escenario({ validarVitalidad: () => new Observable(sub => {
    completar = () => { sub.next({ valid: true, verificationToken: 'tardio' }); sub.complete(); };
  }) });
  c.neutralPose = { yaw: 0, roll: 0 }; c.ultimaDeteccion = resultado(); c.ultimaDeteccionEn = 0;
  const pendiente = c.finalizeLiveness();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(c.fase(), 'validating'); c.ngOnDestroy(); completar(); await pendiente;
  assert.equal(c.pruebaVidaCompletada.eventos.length, 0);
  assert.notEqual(c.fase(), 'complete');
});
