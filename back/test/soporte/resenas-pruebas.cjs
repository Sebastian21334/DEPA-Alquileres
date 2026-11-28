require('reflect-metadata');
const { AnunciantesService } = require('../../dist/anunciantes/service/anunciantes.service');
const { ResenasService } = require('../../dist/resenas/service/resenas.service');
const { ResenasAdministracionService } = require('../../dist/resenas/service/resenas-administracion.service');
const { ResenasResumenService } = require('../../dist/resenas/service/resenas-resumen.service');

function autor(id = 3) {
  return {
    id,
    nombre: 'Ana',
    apellido: 'Paz',
    foto_url: null,
    email: 'privado@example.invalid',
    telefono: '1140000000',
  };
}

function resenaMock(overrides = {}) {
  return {
    id: 10,
    puntaje: 5,
    comentario: 'Muy buena estadía',
    fecha: new Date('2026-11-20T12:00:00.000Z'),
    actualizada_en: null,
    visible: true,
    motivo_moderacion: null,
    fecha_moderacion: null,
    denunciada: false,
    motivo_denuncia: null,
    fecha_denuncia: null,
    autor: autor(),
    imagenes: [],
    publicacion: { id: 5, titulo: 'Depto demo' },
    anunciante: null,
    moderador: null,
    denunciante: null,
    ...overrides,
  };
}

function publicacionMock(overrides = {}) {
  return {
    id: 5,
    titulo: 'Depto demo',
    eliminada: false,
    activa: true,
    modalidad: { permite_reservas_por_fecha: true, nombre: 'Temporal' },
    anunciante: { idUsuario: 2 },
    ...overrides,
  };
}

function resumenMock(cantidad = 1, promedio = 5) {
  return {
    cantidad,
    promedio,
    distribucion: [
      { puntaje: 5, cantidad },
      { puntaje: 4, cantidad: 0 },
      { puntaje: 3, cantidad: 0 },
      { puntaje: 2, cantidad: 0 },
      { puntaje: 1, cantidad: 0 },
    ],
  };
}

function paginaMock(datos = [resenaMock()], pagina = 1, limite = 6, total = datos.length) {
  return {
    datos,
    pagina,
    limite,
    total,
    totalPaginas: Math.max(1, Math.ceil(total / limite)),
  };
}

function repositorioMock(overrides = {}) {
  const estado = {
    crearPublicacion: null,
    crearAnunciante: null,
    guardar: null,
    actualizar: null,
    eliminar: false,
    denuncia: null,
    moderacion: null,
    resolucionDenuncia: null,
    listarAdministracion: null,
  };
  const repo = {
    conTransaccion: async (operacion) => operacion(repo, undefined),
    buscarParaModerar: (id) => repo.buscarPorId(id),
    crearParaPublicacion: (datos) => {
      estado.crearPublicacion = datos;
      return { ...datos, id: 99, autor: autor(datos.idUsuario), publicacion: { id: datos.idPublicacion } };
    },
    crearParaAnunciante: (datos) => {
      estado.crearAnunciante = datos;
      return { ...datos, id: 99, autor: autor(datos.idUsuario), anunciante: { idUsuario: datos.idAnunciante } };
    },
    guardar: async (resena) => {
      estado.guardar = resena;
      return { ...resena, id: resena.id ?? 99 };
    },
    buscarPorId: async () => resenaMock(),
    buscarParaImagenes: async () => ({ id: 10, visible: true, autor: { id: 3 } }),
    buscarPorObjetivoYAutor: async () => null,
    buscarPaginaPorObjetivo: async () => paginaMock(),
    contarVisiblesPorPuntaje: async () => [{ puntaje: 5, cantidad: 1 }],
    bloquearResumen: async () => {},
    actualizar: async (resena, cambios) => {
      estado.actualizar = cambios;
      return Object.assign({}, resena, cambios);
    },
    eliminar: async () => {
      estado.eliminar = true;
    },
    listarAdministracion: async (...args) => {
      estado.listarAdministracion = args;
      return paginaMock();
    },
    registrarDenuncia: async (...args) => {
      estado.denuncia = args;
    },
    registrarModeracion: async (...args) => {
      estado.moderacion = args;
    },
    registrarResolucionDenuncia: async (...args) => {
      estado.resolucionDenuncia = args;
    },
    ...overrides,
  };
  return { repo, estado };
}

function servicioMock(overrides = {}) {
  const { repo, estado } = repositorioMock(overrides.repo);
  const publicaciones = {
    buscarPublicaPorId: async () => publicacionMock(),
    admiteReservaPorFecha: () => true,
    actualizarResumenResenas: async (id, cantidad, promedio) => {
      estado.resumenPublicacion = [id, cantidad, promedio];
    },
    ...(overrides.publicaciones ?? {}),
  };
  const anunciantes = {
    buscarPorId: async () => ({
      idUsuario: 2,
      verificado: true,
      cantidad_resenas: 0,
      promedio_resenas: null,
      usuario: { nombre: 'Carlos', apellido: 'Dominguez', activa: true, bloqueado: false },
    }),
    // La regla real: una cuenta bloqueada o dada de baja no expone su perfil.
    cuentaHabilitada: AnunciantesService.prototype.cuentaHabilitada,
    datosContacto: () => ({ nombre: 'Carlos Dominguez' }),
    actualizarResumenResenas: async (id, cantidad, promedio) => {
      estado.resumenAnunciante = [id, cantidad, promedio];
    },
    ...(overrides.anunciantes ?? {}),
  };
  const reservas = {
    existeEstadiaFinalizadaEnPublicacion: async () => true,
    existeEstadiaFinalizadaConAnunciante: async () => true,
    ...(overrides.reservas ?? {}),
  };
  const imagenes = {
    eliminarArchivos: async (imagenes) => {
      estado.ordenLlamadas = [...(estado.ordenLlamadas ?? []), 'archivos'];
      estado.archivosEliminados = imagenes;
    },
    ...(overrides.imagenes ?? {}),
  };
  const mail = {
    enviarResenaOcultada: async (...args) => {
      estado.correos = [...(estado.correos ?? []), args];
    },
    ...(overrides.mail ?? {}),
  };
  const resumen = new ResenasResumenService(repo, publicaciones, anunciantes);
  const servicio = new ResenasService(repo, publicaciones, anunciantes, reservas, imagenes, resumen);
  const admin = new ResenasAdministracionService(repo, resumen, mail);
  return { servicio, admin, repo, publicaciones, anunciantes, reservas, imagenes, resumen, mail, estado };
}

function imagenServicioMock(overrides = {}) {
  const llamadas = { orden: [] };
  const { repo: resenasRepo } = repositorioMock(overrides.acceso);
  const imagenesRepo = {
    crear: (idResena, url, orden) => ({ id: 1, url, orden, resena: { id: idResena } }),
    guardar: async (imagen) => imagen,
    buscarPorId: async () => ({ id: 2, url: 'https://storage.test/img.jpg', resena: { id: 10 } }),
    contarPorResena: async () => 0,
    buscarUltimoOrden: async () => -1,
    eliminar: async () => {
      llamadas.orden.push('fila');
    },
    ...(overrides.imagenesRepo ?? {}),
  };
  const almacenamiento = {
    subir: async () => 'https://storage.test/resena.jpg',
    eliminarImagenPropia: async () => {
      llamadas.orden.push('storage');
    },
    ...(overrides.almacenamiento ?? {}),
  };
  const preparacion = {
    preparar: async () => Buffer.from('jpeg'),
    ...(overrides.preparacion ?? {}),
  };
  const { ResenasImagenesService } = require('../../dist/resenas/service/resenas-imagenes.service');
  const servicio = new ResenasImagenesService(resenasRepo, imagenesRepo, almacenamiento, preparacion);
  return { servicio, resenasRepo, imagenesRepo, almacenamiento, preparacion, llamadas };
}

module.exports = {
  autor,
  resenaMock,
  publicacionMock,
  resumenMock,
  paginaMock,
  repositorioMock,
  servicioMock,
  imagenServicioMock,
};
