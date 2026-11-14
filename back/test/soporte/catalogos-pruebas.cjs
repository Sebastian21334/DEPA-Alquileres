require('reflect-metadata');
const { CatalogosService } = require('../../dist/catalogos/service/catalogos.service');
const { LiquidacionesService } = require('../../dist/liquidaciones/service/liquidaciones.service');
const { ReservasService } = require('../../dist/reservas/service/reservas.service');
const datos = require('../../src/catalogos/estados-iniciales.json');

function catalogosDePrueba(implementacion = {}) {
  const catalogos = new CatalogosService();
  catalogos.obtenerEstado = (codigoAmbito, codigo) => {
    const ambito = datos[codigoAmbito];
    const estado = ambito?.estados[codigo];
    if (!estado) throw new Error('Estado desconocido: ' + codigoAmbito + '/' + codigo);
    return { codigoAmbito, codigo, nombre: estado.nombre, ambito: { codigo: codigoAmbito, nombre: ambito.nombre } };
  };
  return Object.assign(catalogos, implementacion);
}

function reservasDePrueba() {
  const catalogos = catalogosDePrueba();
  return new ReservasService(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, new LiquidacionesService(undefined, catalogos), catalogos);
}

module.exports = { catalogosDePrueba, reservasDePrueba };
