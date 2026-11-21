#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.resolve(__dirname, '..');
const fuente = path.join(raiz, 'contratos', 'publicacion.json');
const destinos = [
  path.join(raiz, 'back', 'src', 'publicaciones', 'dto', 'publicacion-limites.generated.ts'),
  path.join(raiz, 'front', 'src', 'app', 'shared', 'forms', 'publicacion-limites.generated.ts'),
];

function leerLimites() {
  const limites = JSON.parse(fs.readFileSync(fuente, 'utf8'));
  const numeroPositivo = (campo) => {
    const valor = limites[campo];
    if (typeof valor !== 'number' || !Number.isFinite(valor) || valor <= 0) {
      throw new Error(`contratos/publicacion.json: "${campo}" debe ser un número positivo.`);
    }
    return valor;
  };

  const precioMaximo = numeroPositivo('precioMaximo');
  const superficieMaxima = numeroPositivo('superficieMaxima');
  const ambientesMaximos = numeroPositivo('ambientesMaximos');
  if (!Number.isInteger(ambientesMaximos)) {
    throw new Error('contratos/publicacion.json: "ambientesMaximos" debe ser un entero.');
  }

  return { precioMaximo, superficieMaxima, ambientesMaximos };
}

function generarContenido({ precioMaximo, superficieMaxima, ambientesMaximos }) {
  return `// Archivo generado por scripts/generar-contratos-publicacion.cjs.
// Fuente: contratos/publicacion.json. No editar a mano.
export const PUBLICACION_LIMITES = {
  precioMaximo: ${precioMaximo},
  superficieMaxima: ${superficieMaxima},
  ambientesMaximos: ${ambientesMaximos},
} as const;
`;
}

function main() {
  const contenido = generarContenido(leerLimites());
  const verificar = process.argv.includes('--check');

  if (verificar) {
    const desactualizados = destinos.filter((destino) => {
      if (!fs.existsSync(destino)) return true;
      return fs.readFileSync(destino, 'utf8') !== contenido;
    });
    if (desactualizados.length) {
      console.error('Los contratos generados están desactualizados:');
      for (const destino of desactualizados) console.error(`- ${path.relative(raiz, destino)}`);
      console.error('Ejecutá `npm run contratos:generar` desde la raíz.');
      process.exitCode = 1;
      return;
    }
    console.log('Contratos de publicación actualizados.');
    return;
  }

  for (const destino of destinos) {
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, contenido, 'utf8');
    console.log(`Generado: ${path.relative(raiz, destino)}`);
  }
}

main();
