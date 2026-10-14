import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PAGOS_REPOSITORY } from '../repository/pagos.repository.interface';
import {
  PASARELA_PAGOS,
  PagoExterno,
} from '../repository/pasarela-pagos.interface';
import { ReservasService } from '../../reservas/service/reservas.service';
import { Pago } from '../entity/pago.entity';
import {
  Reserva,
  EstadoPagoReserva,
} from '../../reservas/entity/reserva.entity';
import { Usuario } from '../../usuarios/entity/usuario.entity';

describe('PagosService', () => {
  const usuario = Object.assign(new Usuario(), { id: 7 });
  let service: PagosService;
  let pago: Pago;
  let payment: PagoExterno;
  const repo = {
    buscarPorReferencia: jest.fn<() => Promise<Pago | null>>(),
    guardar: jest.fn<(pago: Pago) => Promise<Pago>>(),
  };
  const reservas = {
    buscarPorId: jest.fn<() => Promise<Reserva>>(),
    confirmarPago: jest.fn<() => Promise<void>>(),
    rechazarPago: jest.fn<() => Promise<void>>(),
  };
  const pasarela = {
    consultarPago: jest.fn<() => Promise<PagoExterno>>(),
    validarWebhook: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const reserva = Object.assign(new Reserva(), {
      id: 42,
      usuario,
      estado_pago: EstadoPagoReserva.APROBADO,
    });
    pago = Object.assign(new Pago(), {
      reserva,
      amount: 1000,
      currency: 'ARS',
    });
    payment = {
      id: 123,
      external_reference: 'reserva:42',
      transaction_amount: 1000,
      currency_id: 'ARS',
      status: 'approved',
    };
    repo.buscarPorReferencia.mockResolvedValue(pago);
    repo.guardar.mockImplementation(async (p) => p);
    reservas.buscarPorId.mockResolvedValue(reserva);
    pasarela.consultarPago.mockImplementation(async () => payment);
    const module = await Test.createTestingModule({
      providers: [
        PagosService,
        { provide: PAGOS_REPOSITORY, useValue: repo },
        { provide: ReservasService, useValue: reservas },
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: PASARELA_PAGOS, useValue: pasarela },
      ],
    }).compile();
    service = module.get(PagosService);
  });

  it('consulta el proveedor antes de aprobar una reserva al volver del checkout', async () => {
    await expect(service.reconciliarPago('123', 7)).resolves.toMatchObject({
      reserva_id: 42,
      estado_pago: EstadoPagoReserva.APROBADO,
    });
    expect(pasarela.consultarPago).toHaveBeenCalledWith('123');
    expect(reservas.confirmarPago).toHaveBeenCalledWith(42, expect.any(Date));
  });

  it.each([
    { transaction_amount: 999 },
    { transaction_amount: Number.NaN },
    { currency_id: 'USD' },
  ])('rechaza datos económicos incompatibles: %j', async (cambios) => {
    Object.assign(payment, cambios);
    await expect(service.reconciliarPago('123', 7)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repo.guardar).not.toHaveBeenCalled();
    expect(reservas.confirmarPago).not.toHaveBeenCalled();
  });

  it('impide que el anfitrión reconcilie el pago del inquilino', async () => {
    await expect(service.reconciliarPago('123', 99)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(repo.guardar).not.toHaveBeenCalled();
  });

  it('valida la firma antes de consultar y aplicar un webhook', async () => {
    pasarela.validarWebhook.mockImplementation(() => {
      throw new Error('Firma inválida');
    });
    await expect(
      service.procesarWebhook({ body: { type: 'payment' }, dataId: '123' }),
    ).rejects.toThrow('Firma inválida');
    expect(pasarela.consultarPago).not.toHaveBeenCalled();
  });

  it('omite eventos que no son pagos', async () => {
    await expect(
      service.procesarWebhook({ body: { type: 'merchant_order' } }),
    ).resolves.toEqual({ received: true });
    expect(pasarela.consultarPago).not.toHaveBeenCalled();
  });
});
