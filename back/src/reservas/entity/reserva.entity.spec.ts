import {
  EstadoLiquidacionReserva,
  EstadoPagoReserva,
  Reserva,
} from './reserva.entity';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import { Usuario } from '../../usuarios/entity/usuario.entity';

const confirmada = () => {
  const reserva = Object.assign(new Reserva(), {
    estado_pago: EstadoPagoReserva.PENDIENTE,
    cancelada: false,
    finalizada: false,
    intentos_codigo: 0,
    usuario: Object.assign(new Usuario(), { id: 3 }),
    publicacion: Object.assign(new Publicacion(), {
      anunciante: Object.assign(new Anunciante(), { idUsuario: 7 }),
    }),
  });
  reserva.confirmarPago(new Date('2100-01-01'), 'ABCD2345');
  return reserva;
};

describe('Reserva', () => {
  it('reconoce a sus participantes sin que el servicio recorra las relaciones', () => {
    const reserva = confirmada();
    expect(reserva.esDelInquilino(3)).toBe(true);
    expect(reserva.esDelAnunciante(7)).toBe(true);
    expect(reserva.participa(99)).toBe(false);
  });

  it('al confirmar el pago emite el código y retiene la liquidación', () => {
    const reserva = confirmada();
    expect(reserva.estaConfirmada()).toBe(true);
    expect(reserva.codigo_alojamiento).toBe('ABCD2345');
    expect(reserva.pago_vencimiento).toBeNull();
    expect(reserva.estado_liquidacion).toBe(EstadoLiquidacionReserva.RETENIDO);
  });

  it('valida el código del anunciante y libera el pago al propietario', () => {
    const reserva = confirmada();
    expect(reserva.registrarIntentoCodigo(' abcd2345 ')).toBe(true);
    expect(reserva.codigoValidado()).toBe(true);
    expect(reserva.estado_liquidacion).toBe(
      EstadoLiquidacionReserva.PENDIENTE_PAGO_PROPIETARIO,
    );
  });

  it('pasa a revisión al agotar los intentos de código', () => {
    const reserva = confirmada();
    for (let i = 1; i < Reserva.MAX_INTENTOS_CODIGO; i++) {
      expect(reserva.registrarIntentoCodigo('ZZZZZZZZ')).toBe(false);
      expect(reserva.liquidacionEnRevision()).toBe(false);
    }
    expect(reserva.registrarIntentoCodigo('ZZZZZZZZ')).toBe(false);
    expect(reserva.codigoBloqueado()).toBe(true);
    expect(reserva.intentosCodigoRestantes()).toBe(0);
    expect(reserva.liquidacionEnRevision()).toBe(true);
  });

  it('devolver el dinero al inquilino resuelve la liquidación y cancela la reserva', () => {
    const reserva = confirmada();
    reserva.resolverLiquidacion(
      EstadoLiquidacionReserva.DEVUELTO_INQUILINO,
      ' TRX-1 ',
    );
    expect(reserva.liquidacionResuelta()).toBe(true);
    expect(reserva.estado_pago).toBe(EstadoPagoReserva.REEMBOLSADO);
    expect(reserva.cancelada).toBe(true);
    expect(reserva.referencia_liquidacion).toBe('TRX-1');
    expect(reserva.fecha_resolucion_liquidacion).toBeInstanceOf(Date);
  });

  it('un pago reembolsado sin confirmar deja la liquidación devuelta al inquilino', () => {
    const reserva = Object.assign(new Reserva(), {
      estado_pago: EstadoPagoReserva.PENDIENTE,
      pago_vencimiento: new Date(),
    });
    reserva.cerrarSinPago(EstadoPagoReserva.REEMBOLSADO);
    expect(reserva.cancelada).toBe(true);
    expect(reserva.pago_vencimiento).toBeNull();
    expect(reserva.estado_liquidacion).toBe(
      EstadoLiquidacionReserva.DEVUELTO_INQUILINO,
    );
  });
});
