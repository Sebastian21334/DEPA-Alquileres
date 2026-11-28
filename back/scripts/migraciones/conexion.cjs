const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
const dotenv = require('dotenv');

const ARCHIVO_ENV = path.join(__dirname, '..', '..', '.env');

/**
 * Cliente para la base de `back/.env`, sin tomar variables de otra terminal.
 * En conexiones remotas exige un certificado TLS válido.
 */
function crearCliente() {
  const { DATABASE_URL } = dotenv.parse(fs.readFileSync(ARCHIVO_ENV));
  if (!DATABASE_URL) throw new Error('Falta DATABASE_URL en back/.env');
  const url = new URL(DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (!local) {
    // pg interpreta estos parámetros por encima de ssl: no permitir que desactiven la validación.
    for (const parametro of ['sslmode', 'ssl', 'sslnegotiation', 'uselibpqcompat']) url.searchParams.delete(parametro);
  }
  return new Client({
    connectionString: url.toString(),
    connectionTimeoutMillis: 10000,
    ...(local ? {} : { ssl: { rejectUnauthorized: true } }),
  });
}

/**
 * Mensaje de error sin la cadena de conexión ni datos de configuración: los errores
 * del servidor (con `severity`) muestran su texto; los de red, solo su código.
 */
const mensajeDeError = (error) => {
  if (error?.severity) return `${error.code ?? ''} ${error.message}`.trim();
  return error?.code ?? error?.message ?? String(error);
};

module.exports = { crearCliente, mensajeDeError };
