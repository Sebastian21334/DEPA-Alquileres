// Vista aislada del componente real. Sin cámara, sesión ni llamadas al servidor.
// Ejecutar: node test/preview-vitalidad.cjs. Abrir http://127.0.0.1:4317
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const esbuild = require('esbuild');
const root = path.join(__dirname, '..');

async function main() {
  const resultado = await esbuild.build({
    stdin: { contents: `
      import '@angular/compiler';
      import { Component, signal } from '@angular/core';
      import { bootstrapApplication } from '@angular/platform-browser';
      import { CapturaIdentidadComponent } from './src/app/features/solicitud-anunciante/captura-identidad/captura-identidad.component';
      import { VerificacionFacialService } from './src/app/shared/services/verificacion-facial.service';
      CapturaIdentidadComponent.prototype.ngAfterViewInit = function() {
        const c = this as any;
        c.dialogRef.nativeElement.showModal();
        c.paso.set('liveness'); c.fase.set('actions'); c.cameraReady.set(true);
        c.cameraAspectRatio.set(16 / 9);
        c.instrucciones.set([{ type: 'TURN_RIGHT', label: 'Girá la cabeza hacia la derecha' },
          { type: 'OPEN_MOUTH', label: 'Abrí la boca' }, { type: 'TURN_LEFT', label: 'Girá la cabeza hacia la izquierda' }]);
        c.indiceInstruccion.set(1); c.frentePreview.set(''); c.dorsoPreview.set('');
        c.estadoEnVivo.set('adjust'); c.feedback.set('Separá un poco más los labios, como al decir «A».');
        c.segundosRestantes.set(540);
        const estado = new URLSearchParams(location.search).get('estado');
        if (estado === 'dni') { c.paso.set('dni_frente'); c.fase.set('idle'); }
        if (estado === 'error') { c.fase.set('error'); c.cameraReady.set(false); c.error.set('No se pudo confirmar el movimiento. Reintentá mirando de frente.'); }
        if (estado === 'complete') { c.paso.set('complete'); c.fase.set('complete'); c.cameraReady.set(false); c.mensaje.set('El servidor confirmó tu prueba de vida.'); }
        setTimeout(() => {
          const canvas = c.overlayRef.nativeElement as HTMLCanvasElement;
          canvas.width = 640; canvas.height = 360;
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = '#e7eef2'; ctx.fillRect(0, 0, 640, 360);
          ctx.fillStyle = '#a3b5c2'; ctx.beginPath(); ctx.ellipse(320, 195, 70, 98, 0, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(320, 365, 145, 83, 0, 0, Math.PI * 2); ctx.fill();
          c.drawFaceGuide(ctx, false);
        });
      };
      @Component({ selector: 'app-preview', standalone: true, imports: [CapturaIdentidadComponent],
        template: '<main class="acct-page"><section class="acct-card"><h1>Vista de prueba · sin cámara</h1><p>Solo prueba visual del componente.</p><button class="acct-btn" (click)="abierto.set(true)">Abrir ventana</button>@if(abierto()){<app-captura-identidad (cerrar)="abierto.set(false)"/>}</section></main>' })
      class Preview { abierto = signal(true); }
      bootstrapApplication(Preview, { providers: [{ provide: VerificacionFacialService, useValue: {} }] });
    `, resolveDir: root, loader: 'ts' },
    bundle: true, write: false, format: 'esm', platform: 'browser', target: 'es2022',
    tsconfigRaw: { compilerOptions: { experimentalDecorators: true } },
    plugins: [{ name: 'plantillas-reales', setup(build) {
      build.onLoad({ filter: /captura-identidad\.component\.ts$/ }, ({ path: archivo }) => {
        const carpeta = path.dirname(archivo);
        const contenido = fs.readFileSync(archivo, 'utf8')
          .replace(/templateUrl:\s*'([^']+)'/, (_, nombre) => 'template: ' + JSON.stringify(fs.readFileSync(path.join(carpeta, nombre), 'utf8')))
          .replace(/styleUrl:\s*'([^']+)'/, (_, nombre) => 'styles: [' + JSON.stringify(fs.readFileSync(path.join(carpeta, nombre), 'utf8')) + ']');
        return { contents: contenido, loader: 'ts', resolveDir: carpeta };
      });
    } }],
  });
  const css = fs.readdirSync(path.join(root, 'dist/front/browser')).find(n => /^styles-.*\.css$/.test(n));
  const html = '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/styles.css"><title>Prueba visual de identidad</title></head><body><app-preview></app-preview><script type="module" src="/preview.js"></script></body></html>';
  const server = http.createServer((req, res) => {
    if (req.url === '/preview.js') { res.setHeader('Content-Type', 'application/javascript'); res.end(resultado.outputFiles[0].contents); }
    else if (req.url === '/styles.css') { res.setHeader('Content-Type', 'text/css'); res.end(fs.readFileSync(path.join(root, 'dist/front/browser', css))); }
    else if (req.url === '/fonts/figtree-variable.ttf') { res.setHeader('Content-Type', 'font/ttf'); res.end(fs.readFileSync(path.join(root, 'public/fonts/figtree-variable.ttf'))); }
    else { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(html); }
  });
  server.listen(4317, '127.0.0.1', () => console.log('Vista de prueba: http://127.0.0.1:4317 · Sin acceso a cámara ni API.'));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
