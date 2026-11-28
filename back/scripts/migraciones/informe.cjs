const { ORDEN } = require('./orden.cjs');

/** Arma el informe legible de una comparación entre la base y las migraciones. */
function informe(base, esperado, resultado) {
  const lineas = [`Base: ${base}`, `Elementos esperados: ${esperado.esquema.size} (${ORDEN.length} migraciones)`];
  if (!resultado.errores.length) lineas.push('Estructura completa: no falta ninguna migración.');
  else {
    lineas.push(`Faltan cambios de ${resultado.pendientes.length} migración(es):`);
    for (const migracion of resultado.pendientes) {
      lineas.push(`  ${migracion}`);
      for (const error of resultado.errores.filter((item) => item.migracion === migracion))
        lineas.push(`    - ${error.descripcion}: ${error.motivo}`);
    }
  }
  if (resultado.advertencias.length) {
    lineas.push(`Advertencias (${resultado.advertencias.length}), no requieren migraciones:`);
    for (const advertencia of resultado.advertencias) lineas.push(`  - ${advertencia.descripcion}: ${advertencia.motivo}`);
  }
  if (esperado.soloDatos.length)
    lineas.push(`Solo cambian datos y no se pueden comprobar por la estructura: ${esperado.soloDatos.join(', ')}.`);
  return lineas.join('\n');
}

module.exports = { informe };
