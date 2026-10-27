import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PAGOS_REPOSITORY } from '../repository/pagos.repository.interface';
import {
  PASARELA_PAGOS,
  PagoExterno,
  IPasarelaPagos,
} from '../repository/pasarela-pagos.interface';
import { ReservasService } from '../../reservas/service/reservas.service';
import { Pago } from '../entity/pago.entity';
import {
  Reserva,
  EstadoPagoReserva,
} from '../../reservas/entity/reserva.entity';
import { Usuario } from '../../usuarios/entity/usuario.entity';
import { PresupuestosService } from './presupuestos.service';

describe('PagosService', () => {
  const usuario = Object.assign(new Usuario(), { id: 7 });
  let service: PagosService;
  let pago: Pago;
  let payment: PagoExterno;
  const repo = {
    crear: jest.fn<(datos: Partial<Pago>) => Pago>(),
    buscarPorReferencia: jest.fn<() => Promise<Pago | null>>(),
    guardar: jest.fn<(pago: Pago) => Promise<Pago>>(),
  };
  const reservas = {
    crearPendiente: jest.fn<ReservasService['crearPendiente']>(),
    buscarPorId: jest.fn<() => Promise<Reserva>>(),
    confirmarPago: jest.fn<() => Promise<void>>(),
    rechazarPago: jest.fn<() => Promise<void>>(),
  };
  const pasarela = {
    validarConfiguracionCheckout: jest.fn(),
    crearCheckout: jest.fn<IPasarelaPagos['crearCheckout']>(),
    consultarPago: jest.fn<() => Promise<PagoExterno>>(),
    validarWebhook: jest.fn(),
  };
  const validarPresupuesto = jest.fn<PresupuestosService['validar']>();

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
    repo.crear.mockImplementation((datos) => Object.assign(new Pago(), datos));
    reservas.buscarPorId.mockResolvedValue(reserva);
    pasarela.consultarPago.mockImplementation(async () => payment);
    const module = await Test.createTestingModule({
      providers: [
        PagosService,
        {
          provide: PresupuestosService,
          useValue: { validar: validarPresupuesto },
        },
        { provide: PAGOS_REPOSITORY, useValue: repo },
        { provide: ReservasService, useValue: reservas },
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: PASARELA_PAGOS, useValue: pasarela },
      ],
    }).compile();
    service = module.get(PagosService);
  });

  it('crea el checkout por el importe convertido en ARS y conserva el presupuesto aceptado', async () => {
    const condiciones = {
      precio_unitario_origen: '100.00',
      moneda_origen: 'USD' as const,
      total_origen: '200.00',
      total_cobro: '300000.00',
      cotizacion_id: 8,
      emitida_en: new Date().toISOString(),
      vence_en: new Date(Date.now() + 900000).toISOString(),
    };
    validarPresupuesto.mockResolvedValue(condiciones);
    const reserva = Object.assign(new Reserva(), {
      id: 42,
      monto_pago: 300000,
      moneda_contratada: 'ARS',
      pago_vencimiento: new Date(condiciones.vence_en),
    });
    reservas.crearPendiente.mockResolvedValue(reserva);
    pasarela.crearCheckout.mockResolvedValue({
      id: 'preferencia',
      url: 'https://example.test/pagar',
    });
    const dto = {
      id_publicacion: 10,
      fecha_inicio: '2100-01-01',
      fecha_fin: '2100-01-02',
      presupuesto_token: 'firmado',
    };
    expect(await service.crearCheckout(dto, 7)).toMatchObject({
      reserva_id: 42,
      checkout_url: 'https://example.test/pagar',
    });
    expect(reservas.crearPendiente).toHaveBeenCalledWith(dto, 7, condiciones);
    expect(repo.crear).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 300000, currency: 'ARS' }),
    );
    expect(pasarela.crearCheckout).toHaveBeenCalledWith(
      reserva,
      'reserva:42',
      expect.any(String),
      'ARS',
    );
  });

  it('no crea una reserva ni una preferencia si el presupuesto no es válido', async () => {
    validarPresupuesto.mockRejectedValue(
      new BadRequestException('Presupuesto inválido'),
    );
    await expect(
      service.crearCheckout(
        {
          id_publicacion: 10,
          fecha_inicio: '2100-01-01',
          fecha_fin: '2100-01-02',
          presupuesto_token: 'alterado',
        },
        7,
      ),
    ).rejects.toThrow('Presupuesto inválido');
    expect(reservas.crearPendiente).not.toHaveBeenCalled();
    expect(pasarela.crearCheckout).not.toHaveBeenCalled();
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
