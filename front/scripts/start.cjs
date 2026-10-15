// Reduce la memoria usada al iniciar Angular junto con el backend.
process.env.NG_BUILD_MAX_WORKERS ??= '2';
process.env.NG_BUILD_PARALLEL_TS ??= '0';

const argumentos = process.argv.slice(2);
const cli = require.resolve('@angular/cli/bin/ng.js');
process.argv = [process.execPath, cli, 'serve', ...argumentos];
require(cli);
