const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const root = path.join(__dirname, '..');
const npmCli = process.env.npm_execpath;
if (!npmCli || !fs.existsSync(npmCli)) {
  console.error('Iniciar desde la raiz del proyecto con npm start o npm run dev.');
  process.exit(1);
}
for (const folder of ['back', 'front']) {
  if (!fs.existsSync(path.join(root, folder, 'node_modules'))) {
    console.error(`Faltan las dependencias de ${folder}. Ejecutar: npm --prefix ${folder} ci`);
    process.exit(1);
  }
}

const children = [];
let stopping = false;

function terminate(child) {
  if (child.exitCode !== null || child.signalCode !== null || !child.pid) return Promise.resolve();
  if (process.platform === 'win32') {
    return new Promise((resolve) => {
      // Solo se termina el arbol de un proceso creado por este lanzador.
      const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
        stdio: 'ignore', windowsHide: true,
      });
      killer.once('error', () => { child.kill(); resolve(); });
      killer.once('exit', resolve);
    });
  }
  try { process.kill(-child.pid, 'SIGTERM'); } catch { /* Ya termino. */ }
  return Promise.resolve();
}

async function stop(code) {
  if (stopping) return;
  stopping = true;
  console.log('\nCerrando frontend y backend...');
  await Promise.all(children.map(terminate));
  process.exit(code);
}

process.on('SIGINT', () => { void stop(0); });
process.on('SIGTERM', () => { void stop(0); });

for (const [folder, script] of [['back', 'start:dev'], ['front', 'start']]) {
  if (stopping) break;
  console.log(`Iniciando ${folder}...`);
  const child = spawn(process.execPath, [npmCli, '--prefix', path.join(root, folder), 'run', script], {
    cwd: path.join(root, folder), stdio: 'inherit', windowsHide: true,
    detached: process.platform !== 'win32',
  });
  children.push(child);
  child.once('error', (error) => {
    console.error(`No se pudo iniciar ${folder}: ${error.message}`);
    void stop(1);
  });
  child.once('exit', (code, signal) => {
    if (stopping) return;
    console.log(`${folder} termino${signal ? ` (${signal})` : ` con codigo ${code}`}.`);
    void stop(code === 0 ? 0 : 1);
  });
}
