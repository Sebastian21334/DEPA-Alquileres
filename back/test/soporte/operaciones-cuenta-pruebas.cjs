const { OperacionesCuentaService } = require('../../dist/usuarios/service/operaciones-cuenta.service');
const { ReservasLecturaService } = require('../../dist/reservas/service/reservas-lectura.service');
const { ReservaRepository } = require('../../dist/reservas/repository/reserva.repository');
const { PagosService } = require('../../dist/pagos/service/pagos.service');
const { PagosRepository } = require('../../dist/pagos/repository/pagos.repository');
const { ReclamosLecturaService } = require('../../dist/reclamos/service/reclamos-lectura.service');
const { ReclamosRepository } = require('../../dist/reclamos/repository/reclamos.repository');
const { ReembolsosLecturaService } = require('../../dist/reembolsos/service/reembolsos-lectura.service');
const { ReembolsosRepository } = require('../../dist/reembolsos/repository/reembolsos.repository');

// Estos repositorios ejecutan las consultas con el manager de la transacción.
function operacionesCuentaDePrueba() {
  return new OperacionesCuentaService(
    new ReservasLecturaService(new ReservaRepository()),
    new PagosService(new PagosRepository()),
    new ReclamosLecturaService(new ReclamosRepository()),
    new ReembolsosLecturaService(new ReembolsosRepository()),
  );
}

module.exports = { operacionesCuentaDePrueba };
