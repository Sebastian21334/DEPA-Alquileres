import http from 'k6/http';
import { check, sleep } from 'k6';

const config = JSON.parse(open('./local/config-rnf8.json'));
const escenario = __ENV.ESCENARIO || 'E1';
const fase = __ENV.FASE || 'medicion';
const duracion = __ENV.DURACION || '5m';
const variantes = config.escenarios[escenario];
if (!variantes || !['calentamiento', 'medicion'].includes(fase)) throw new Error('Escenario o fase invalida');
const thresholds = { http_req_failed: ['rate==0'], checks: ['rate==1'] };
if (fase === 'medicion') {
  thresholds.http_req_duration = ['max<=2000'];
  for (const v of variantes) {
    thresholds[`http_req_duration{variante:${v.nombre}}`] = ['max<=2000'];
    thresholds[`http_reqs{variante:${v.nombre}}`] = ['count>0'];
  }
}

export const options = {
  scenarios: { busquedas: { executor: 'constant-vus', vus: 10, duration: duracion, gracefulStop: '15s' } },
  thresholds, summaryTrendStats: ['avg', 'min', 'med', 'p(95)', 'max'],
  tags: { escenario, fase, tipo: __ENV.TIPO || 'oficial' },
};

export default function () {
  const v = variantes[(__ITER + __VU - 1) % variantes.length];
  const r = http.get(config.api + v.url, { timeout: '10s', redirects: 0,
    tags: { variante: v.nombre, name: `${escenario}/${v.nombre}` } });
  let body;
  try { body = r.json(); } catch { body = null; }
  check(r, {
    'HTTP 200': response => response.status === 200,
    'pagina y cantidad correctas': () => body && body.pagina === v.pagina && body.limite === 12 &&
      body.total === v.total && body.totalPaginas === Math.ceil(v.total / 12) &&
      Array.isArray(body.datos) && body.datos.length === v.ids.length,
    'resultados y orden correctos': () => body && Array.isArray(body.datos) &&
      JSON.stringify(body.datos.map(p => p.id)) === JSON.stringify(v.ids),
    'publicaciones visibles con imagenes': () => body && Array.isArray(body.datos) &&
      body.datos.every(p => p.activa && Array.isArray(p.imagenes) && p.imagenes.length > 0),
  }, { variante: v.nombre });
  sleep(1);
}

export function handleSummary(data) {
  const duration = data.metrics.http_req_duration?.values || {};
  const failed = data.metrics.http_req_failed?.values || {};
  const validations = data.metrics.checks?.values || {};
  const passed = Object.values(data.metrics).every(m => !m.thresholds || Object.values(m.thresholds).every(t => t.ok));
  const resumen = { escenario, fase, tipo: __ENV.TIPO || 'oficial', api: config.api,
    repeticion: Number(__ENV.REPETICION || 1), publicaciones: config.publicaciones_visibles,
    usuarios: 10, duracion, solicitudes: data.metrics.http_reqs?.values.count || 0,
    promedio_ms: duration.avg ?? null, p95_ms: duration['p(95)'] ?? null, maximo_ms: duration.max ?? null,
    errores_http: failed.passes || 0, validaciones_fallidas: validations.fails || 0,
    aprobado: passed, k6: data };
  return {
    stdout: `\n${escenario} / ${fase}: ${passed ? 'APROBADO' : 'NO APROBADO'}\n` +
      `Solicitudes: ${resumen.solicitudes}; maximo: ${resumen.maximo_ms} ms; errores: ${resumen.errores_http}; validaciones fallidas: ${resumen.validaciones_fallidas}\n`,
    [__ENV.RESUMEN || './resumen-rnf8.json']: JSON.stringify(resumen, null, 2),
  };
}
