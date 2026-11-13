require('reflect-metadata');
const { CatalogosService } = require('../../dist/catalogos/service/catalogos.service');
const { LiquidacionesService } = require('../../dist/liquidaciones/service/liquidaciones.service');
const { ReservaDecisionService } = require('../../dist/reservas/service/reserva-decision.service');
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

function decisionDePrueba() {
  const catalogos = catalogosDePrueba();
  return new ReservaDecisionService(catalogos, new LiquidacionesService(undefined, catalogos));
}

module.exports = { catalogosDePrueba, decisionDePrueba };
