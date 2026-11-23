const { PreparacionImagenesService } = require('../../dist/almacenamiento/service/preparacion-imagenes.service');
const { SharpImagenesAdapter } = require('../../dist/almacenamiento/proveedor/sharp-imagenes.adapter');

const preparacionImagenes = new PreparacionImagenesService(new SharpImagenesAdapter());

module.exports = { preparacionImagenes };
