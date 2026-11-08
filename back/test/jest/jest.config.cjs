/**
 * Jest para los casos de prueba CP-06, CP-07 y CP-08.
 * Ejecutar desde back/:  npm run test:jest
 *
 * Nest 12 se publica como ESM. Jest lo carga con require(esm), que necesita
 * Node 24.9 o superior y la opción --experimental-vm-modules (ya incluida en
 * el script test:jest).
 */
const [mayor, menor] = process.versions.node.split('.').map(Number);
if (mayor < 24 || (mayor === 24 && menor < 9)) {
  throw new Error(
    `Estos tests necesitan Node 24.9 o superior (tenés ${process.versions.node}). ` +
      'Es la misma versión mayor que usa el deploy de Azure (node-version 24.x).',
  );
}

module.exports = {
  rootDir: '../..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/jest/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/test/jest/tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 30000,
};
