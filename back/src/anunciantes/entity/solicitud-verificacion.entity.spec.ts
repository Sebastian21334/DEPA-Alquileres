import {
  EstadoVerificacion,
  SolicitudVerificacion,
} from './solicitud-verificacion.entity';

const documentos = { dniFrente: 'f', dniDorso: 'd', rostro: 'r' };

describe('SolicitudVerificacion', () => {
  it('queda pendiente de revisión al presentar la documentación completa', () => {
    const solicitud = Object.assign(new SolicitudVerificacion(), {
      estado: EstadoVerificacion.BORRADOR,
      numero_revision: 1,
    });
    solicitud.presentarDocumentos(documentos, false);
    expect(solicitud.tieneDocumentacionCompleta()).toBe(true);
    expect(solicitud.estaPendienteDeRevision()).toBe(true);
    expect(solicitud.numero_revision).toBe(1);
  });

  it('un reenvío después del rechazo abre una nueva revisión sin el motivo anterior', () => {
    const solicitud = Object.assign(new SolicitudVerificacion(), {
      estado: EstadoVerificacion.PENDIENTE,
      numero_revision: 1,
    });
    solicitud.rechazar('  Foto borrosa  ');
    expect(solicitud.estaRechazada()).toBe(true);
    expect(solicitud.motivo_rechazo).toBe('Foto borrosa');
    solicitud.presentarDocumentos(documentos, true);
    expect(solicitud.estado).toBe(EstadoVerificacion.REENVIADA);
    expect(solicitud.numero_revision).toBe(2);
    expect(solicitud.motivo_rechazo).toBeNull();
    solicitud.aprobar();
    expect(solicitud.estaAprobada()).toBe(true);
  });
});
