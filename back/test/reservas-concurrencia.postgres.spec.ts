import { jest } from '@jest/globals';
import type { IMailService } from '../src/mail/mail.interface';
import { ConfigService } from '@nestjs/config';
import { ReprogramacionReserva } from '../src/reservas/entity/reprogramacion-reserva.entity';
import { Pago } from '../src/pagos/entity/pago.entity';
import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as esperar } from 'node:timers/promises';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Fecha } from '../src/disponibilidad/entity/fecha.entity';
import {
  Reserva,
  EstadoPagoReserva,
  EstadoLiquidacionReserva,
} from '../src/reservas/entity/reserva.entity';
import { Publicacion } from '../src/publicaciones/entity/publicacion.entity';
import { Usuario } from '../src/usuarios/entity/usuario.entity';
import { Anunciante } from '../src/anunciantes/entity/anunciante.entity';
import { Rol } from '../src/catalogos/entity/rol.entity';
import { Modalidad } from '../src/catalogos/entity/modalidad.entity';
import { TipoAnunciante } from '../src/catalogos/entity/tipo-anunciante.entity';
import { TipoMoneda } from '../src/catalogos/entity/tipo-moneda.entity';
import { TipoPropiedad } from '../src/catalogos/entity/tipo-propiedad.entity';
import { Provincia } from '../src/ubicacion/entity/provincia.entity';
import { Ciudad } from '../src/ubicacion/entity/ciudad.entity';
import { Imagen } from '../src/imagenes/entity/imagen.entity';
import { ReservasService } from '../src/reservas/service/reservas.service';
import { ReservaLiquidacionesService } from '../src/reservas/service/reserva-liquidaciones.service';
import { ReservaNotificacionesService } from '../src/reservas/service/reserva-notificaciones.service';
import { DisponibilidadService } from '../src/disponibilidad/service/disponibilidad.service';
import { UsuariosService } from '../src/usuarios/service/usuarios.service';
import { PublicacionesService } from '../src/publicaciones/service/publicaciones.service';
import { ReservaRepository } from '../src/reservas/repository/reserva.repository';
import { RESERVA_REPOSITORY } from '../src/reservas/repository/reserva.repository.interface';
import { FechaRepository } from '../src/disponibilidad/repository/fecha.repository';
import { FECHA_REPOSITORY } from '../src/disponibilidad/repository/fecha.repository.interface';
import { TransaccionCalendario } from '../src/disponibilidad/repository/transaccion-calendario';
import { TRANSACCION_CALENDARIO } from '../src/disponibilidad/repository/transaccion-calendario.interface';
import { MAIL_SERVICE } from '../src/mail/mail.interface';

// Nunca toma la conexión de la aplicación. Una URL inválida falla, no se omite.
const url = process.env.TEST_POSTGRES_URL;
if (url) {
  const destino = new URL(url);
  if (
    !['localhost', '127.0.0.1', '[::1]'].includes(destino.hostname) ||
    !/^\/calendario_test[a-z0-9_]*$/.test(destino.pathname)
  ) {
    throw new Error(
      'TEST_POSTGRES_URL debe apuntar a PostgreSQL local y una base calendario_test*',
    );
  }
}

(url ? describe : describe.skip)(
  'Concurrencia del calendario con PostgreSQL real',
  () => {
    const esquema = `calendario_${randomUUID().replaceAll('-', '')}`;
    let db: DataSource;
    let modulo: TestingModule;
    let reservas: ReservasService;
    let disponibilidad: DisponibilidadService;
    let liquidaciones: ReservaLiquidacionesService;
    let publicacion: Publicacion;
    let inquilinos: Usuario[];
    const enviarAviso = jest.fn<IMailService['enviarReprogramacionReserva']>();
    const correo = {
      enviarReservaConfirmada: async () => {},
      enviarNuevaReserva: async () => {},
      enviarReprogramacionReserva: enviarAviso,
    };
    const dia = (numero: number) =>
      `2100-01-${String(numero).padStart(2, '0')}`;
    const rango = (inicio: number, fin = inicio) => ({
      fecha_inicio: dia(inicio),
      fecha_fin: dia(fin),
    });

    beforeAll(async () => {
      db = await new DataSource({
        type: 'postgres',
        url,
        schema: esquema,
        synchronize: false,
        ssl: false,
        entities: [
          ReprogramacionReserva,
          Pago,
          Fecha,
          Reserva,
          Publicacion,
          Usuario,
          Anunciante,
          Rol,
          Modalidad,
          TipoAnunciante,
          TipoMoneda,
          TipoPropiedad,
          Provincia,
          Ciudad,
          Imagen,
        ],
        extra: { max: 10, application_name: esquema, statement_timeout: 10000 },
      }).initialize();
      await db.query(`CREATE SCHEMA "${esquema}"`);
      await db.synchronize();
      modulo = await Test.createTestingModule({
        providers: [
          {
            provide: ConfigService,
            useValue: new ConfigService({ MP_CURRENCY_ID: 'ARS' }),
          },
          ReservasService,
          DisponibilidadService,
          ReservaLiquidacionesService,
          {
            provide: TRANSACCION_CALENDARIO,
            useValue: new TransaccionCalendario(db),
          },
          {
            provide: FECHA_REPOSITORY,
            useValue: new FechaRepository(db.getRepository(Fecha)),
          },
          {
            provide: RESERVA_REPOSITORY,
            useValue: new ReservaRepository(db.getRepository(Reserva)),
          },
          {
            provide: UsuariosService,
            useValue: {
              buscarPorId: (id: number) =>
                db.getRepository(Usuario).findOneBy({ id }),
            },
          },
          {
            provide: PublicacionesService,
            useValue: {
              async buscarPorId(id: number) {
                const item = await db.getRepository(Publicacion).findOne({
                  where: { id },
                  relations: { anunciante: true, modalidad: true },
                });
                if (!item) throw new NotFoundException();
                return item;
              },
            },
          },
          ReservaNotificacionesService,
          { provide: MAIL_SERVICE, useValue: correo },
        ],
      }).compile();
      reservas = modulo.get(ReservasService);
      disponibilidad = modulo.get(DisponibilidadService);
      liquidaciones = modulo.get(ReservaLiquidacionesService);
    }, 30000);

    beforeEach(async () => {
      correo.enviarReservaConfirmada = async () => {};
      enviarAviso.mockReset().mockResolvedValue(undefined);
      await db.query(
        `DROP TRIGGER IF EXISTS fallo_calendario ON "${esquema}".fecha`,
      );
      await db.query(
        `DROP TRIGGER IF EXISTS fallo_aviso ON "${esquema}".reprogramacion_reserva`,
      );
      const tablas = db.entityMetadatas
        .map((m) => `"${esquema}"."${m.tableName}"`)
        .join(', ');
      await db.query(`TRUNCATE ${tablas} RESTART IDENTITY CASCADE`);
      const usuarios = await db.getRepository(Usuario).save(
        [0, 1, 2].map((i) => ({
          nombre: `Usuario ${i}`,
          apellido: 'Prueba',
          email: `usuario${i}@example.test`,
          telefono: '11111111',
          contrasenia: 'no-utilizada-en-pruebas',
        })),
      );
      inquilinos = usuarios.slice(1);
      const anunciante = await db.getRepository(Anunciante).save({
        idUsuario: usuarios[0].id,
        numero_contacto: '11111111',
      });
      const modalidad = await db.getRepository(Modalidad).save({
        nombre: 'Temporal',
        permite_reservas_por_fecha: true,
      });
      publicacion = await db.getRepository(Publicacion).save({
        titulo: 'Alojamiento de prueba',
        descripcion: 'Prueba aislada',
        activa: true,
        precio: 100,
        direccion: 'Calle de prueba',
        cantidad_ambientes: 1,
        superficie: 40,
        fecha_publicacion: new Date(),
        anunciante,
        modalidad,
      });
      await disponibilidad.crear({
        id_publicacion: publicacion.id,
        ...rango(1, 10),
      });
    });

    afterAll(async () => {
      await modulo?.close();
      if (db?.isInitialized) {
        try {
          await db.query(`DROP SCHEMA "${esquema}" CASCADE`);
        } finally {
          await db.destroy();
        }
      }
    });

    const crear = (inicio: number, fin = inicio, usuario = 0) =>
      reservas.crearPendiente(
        {
          id_publicacion: publicacion.id,
          ...rango(inicio, fin),
        },
        inquilinos[usuario].id,
      );
    const fechas = () =>
      db
        .getRepository(Fecha)
        .find({ relations: { reserva: true }, order: { fecha: 'ASC' } });

    // Retiene la publicación hasta ver ambas conexiones esperando un bloqueo real.
    // Evita que Promise.all por sí solo dé una falsa prueba de simultaneidad.
    async function competir<T>(
      primera: () => Promise<T>,
      segunda: () => Promise<T>,
    ) {
      const control = db.createQueryRunner();
      await control.connect();
      await control.startTransaction();
      let resultados: Promise<PromiseSettledResult<T>[]> | undefined;
      try {
        await control.manager
          .getRepository(Publicacion)
          .createQueryBuilder('p')
          .where('p.id = :id', { id: publicacion.id })
          .setLock('pessimistic_write')
          .getOne();
        resultados = Promise.allSettled([primera(), segunda()]);
        const limite = Date.now() + 5000;
        let esperando = 0;
        while (Date.now() < limite) {
          const [estado] = await db.query(
            `SELECT count(*)::int AS cantidad FROM pg_stat_activity
          WHERE application_name = $1 AND wait_event_type = 'Lock'`,
            [esquema],
          );
          esperando = estado.cantidad;
          if (esperando >= 2) break;
          await esperar(10);
        }
        expect(esperando).toBeGreaterThanOrEqual(2);
        await control.commitTransaction();
        return await resultados;
      } finally {
        if (control.isTransactionActive) await control.rollbackTransaction();
        await control.release();
        await resultados;
      }
    }

    function unaGanadora(resultados: PromiseSettledResult<Reserva>[]) {
      const exitosas = resultados.filter((r) => r.status === 'fulfilled');
      const fallidas = resultados.filter((r) => r.status === 'rejected');
      expect(exitosas).toHaveLength(1);
      expect(fallidas).toHaveLength(1);
      expect(fallidas[0].reason).toBeInstanceOf(ConflictException);
      return exitosas[0].value;
    }

    async function fallarEscrituraCalendario() {
      await db.query(`CREATE OR REPLACE FUNCTION "${esquema}".fallar_calendario()
      RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fallo calendario'; END $$`);
      await db.query(`CREATE TRIGGER fallo_calendario BEFORE UPDATE ON "${esquema}".fecha
      FOR EACH ROW EXECUTE FUNCTION "${esquema}".fallar_calendario()`);
    }

    it('una sola solicitud reserva el mismo día y la perdedora responde 409 sin dejar otra reserva', async () => {
      const ganadora = unaGanadora(
        await competir(
          () => crear(3),
          () => crear(3, 3, 1),
        ),
      );
      expect(await db.getRepository(Reserva).count()).toBe(1);
      expect((await fechas())[2]).toMatchObject({
        disponible: false,
        reserva: { id: ganadora.id },
      });
    });

    it('protege rangos parcialmente superpuestos y no ocupa días de la solicitud perdedora', async () => {
      const ganadora = unaGanadora(
        await competir(
          () => crear(2, 4),
          () => crear(4, 6, 1),
        ),
      );
      const ocupadas = (await fechas()).filter((f) => !f.disponible);
      expect(ocupadas).toHaveLength(3);
      expect(ocupadas.every((f) => f.reserva?.id === ganadora.id)).toBe(true);
      expect(await db.getRepository(Reserva).count()).toBe(1);
    });

    it('permite ambas reservas si los rangos no se superponen', async () => {
      const resultados = await competir(
        () => crear(1, 2),
        () => crear(5, 6, 1),
      );
      expect(resultados.every((r) => r.status === 'fulfilled')).toBe(true);
      expect(await db.getRepository(Reserva).count()).toBe(2);
      expect((await fechas()).filter((f) => !f.disponible)).toHaveLength(4);
    });

    it('revierte la reserva insertada si falla la escritura de sus fechas', async () => {
      await fallarEscrituraCalendario();
      await expect(crear(1, 2)).rejects.toThrow('fallo calendario');
      expect(await db.getRepository(Reserva).count()).toBe(0);
      expect((await fechas()).every((f) => f.disponible && !f.reserva)).toBe(
        true,
      );
    });

    it('una reprogramación y una creación simultáneas no pueden ocupar el mismo destino', async () => {
      const anterior = await crear(1, 2);
      await reservas.confirmarPago(anterior.id, new Date());
      const resultados = await competir(
        () =>
          reservas.actualizarFechas(anterior.id, rango(4, 5), inquilinos[0].id),
        () => crear(4, 5, 1),
      );
      const ganadora = unaGanadora(resultados);
      const calendario = await fechas();
      expect(
        calendario.slice(3, 5).every((f) => f.reserva?.id === ganadora.id),
      ).toBe(true);
      const reprogramada = resultados[0].status === 'fulfilled';
      expect(
        calendario
          .slice(0, 2)
          .every((f) =>
            reprogramada ? f.disponible : f.reserva?.id === anterior.id,
          ),
      ).toBe(true);
      expect(await db.getRepository(Reserva).count()).toBe(
        reprogramada ? 1 : 2,
      );
    });

    it('dos reprogramaciones simultáneas al mismo destino conservan el rango de la perdedora', async () => {
      const a = await crear(1, 2);
      const b = await crear(3, 4, 1);
      await reservas.confirmarPago(a.id, new Date());
      await reservas.confirmarPago(b.id, new Date());
      const ganadora = unaGanadora(
        await competir(
          () => reservas.actualizarFechas(a.id, rango(7, 8), inquilinos[0].id),
          () => reservas.actualizarFechas(b.id, rango(7, 8), inquilinos[1].id),
        ),
      );
      const calendario = await fechas();
      expect(
        calendario.slice(6, 8).every((f) => f.reserva?.id === ganadora.id),
      ).toBe(true);
      expect(calendario.filter((f) => !f.disponible)).toHaveLength(4);
      const perdedora = ganadora.id === a.id ? b : a;
      expect(
        calendario.filter((f) => f.reserva?.id === perdedora.id),
      ).toHaveLength(2);
    });

    it('reprograma un rango solapado con el propio sin perder días ni liberar otros', async () => {
      const reserva = await crear(1, 3);
      await reservas.confirmarPago(reserva.id, new Date());
      await reservas.actualizarFechas(
        reserva.id,
        rango(2, 4),
        inquilinos[0].id,
      );
      const calendario = await fechas();
      expect(calendario[0]).toMatchObject({ disponible: true, reserva: null });
      expect(
        calendario
          .slice(1, 4)
          .every((f) => f.reserva?.id === reserva.id && !f.disponible),
      ).toBe(true);
      expect(
        (await db.getRepository(Reserva).findOneByOrFail({ id: reserva.id }))
          .fecha_inicio,
      ).toBe(dia(2));
    });

    it('revierte cancelación y reprogramación si no se pueden actualizar las fechas', async () => {
      const reserva = await crear(1, 2);
      await fallarEscrituraCalendario();
      await expect(
        reservas.cancelar(reserva.id, inquilinos[0].id),
      ).rejects.toThrow('fallo calendario');
      expect(
        (await db.getRepository(Reserva).findOneByOrFail({ id: reserva.id }))
          .cancelada,
      ).toBe(false);
      await reservas.confirmarPago(reserva.id, new Date());
      await expect(
        reservas.actualizarFechas(reserva.id, rango(4, 5), inquilinos[0].id),
      ).rejects.toThrow('fallo calendario');
      expect(
        (await fechas()).slice(0, 2).every((f) => f.reserva?.id === reserva.id),
      ).toBe(true);
      expect(
        (await db.getRepository(Reserva).findOneByOrFail({ id: reserva.id }))
          .fecha_inicio,
      ).toBe(dia(1));
    });

    it('cancelar mientras se intenta reservar nunca deja una reserva activa sin sus fechas', async () => {
      const anterior = await crear(3);
      const resultados = await competir(
        () => reservas.cancelar(anterior.id, inquilinos[0].id),
        () => crear(3, 3, 1),
      );
      expect(resultados[0].status).toBe('fulfilled');
      if (resultados[1].status === 'rejected')
        expect(resultados[1].reason).toBeInstanceOf(ConflictException);
      const nuevas =
        resultados[1].status === 'fulfilled'
          ? resultados[1].value
          : await crear(3, 3, 1);
      // Reintentar una cancelación vieja no puede liberar la reserva nueva.
      await reservas.cancelar(anterior.id, inquilinos[0].id);
      expect((await fechas())[2]).toMatchObject({
        disponible: false,
        reserva: { id: nuevas.id },
      });
    });

    it('un pago simultáneo con el vencimiento no deja una reserva aprobada con fechas libres', async () => {
      const reserva = await crear(3);
      const resultados = await Promise.allSettled([
        reservas.confirmarPago(reserva.id, new Date()),
        reservas.rechazarPago(reserva.id, EstadoPagoReserva.CANCELADO),
      ]);
      expect(resultados[1].status).toBe('fulfilled');
      const actual = await db
        .getRepository(Reserva)
        .findOneByOrFail({ id: reserva.id });
      const fecha = (await fechas())[2];
      if (actual.estado_pago === EstadoPagoReserva.APROBADO) {
        expect(actual.cancelada).toBe(false);
        expect(fecha).toMatchObject({
          disponible: false,
          reserva: { id: actual.id },
        });
      } else {
        expect(actual.cancelada).toBe(true);
        expect(fecha).toMatchObject({ disponible: true, reserva: null });
      }
    });

    it('un reembolso y su liberación se revierten juntos ante un fallo', async () => {
      const reserva = await crear(2);
      await reservas.confirmarPago(reserva.id, new Date());
      await fallarEscrituraCalendario();
      await expect(
        liquidaciones.resolverLiquidacion(reserva.id, {
          estado: EstadoLiquidacionReserva.DEVUELTO_INQUILINO,
        }),
      ).rejects.toThrow('fallo calendario');
      expect(
        await db.getRepository(Reserva).findOneByOrFail({ id: reserva.id }),
      ).toMatchObject({
        cancelada: false,
        estado_pago: EstadoPagoReserva.APROBADO,
      });
      expect((await fechas())[1].reserva?.id).toBe(reserva.id);
    });

    it('la edición o eliminación del anunciante respeta una reserva concurrente', async () => {
      const idFecha = (await fechas())[2].id;
      const resultados = await competir(
        () => crear(3),
        async () => {
          await disponibilidad.actualizar(idFecha, { disponible: false });
          return null;
        },
      );
      expect(resultados[1].status).toBe('fulfilled');
      expect((await fechas())[2].disponible).toBe(false);
      if (resultados[0].status === 'fulfilled') {
        expect((await fechas())[2].reserva?.id).toBe(resultados[0].value?.id);
        await expect(disponibilidad.eliminar(idFecha)).rejects.toThrow(
          'asociado a una reserva',
        );
        await expect(
          disponibilidad.actualizar(idFecha, { disponible: true }),
        ).rejects.toThrow('asociado a una reserva');
      } else {
        expect(resultados[0].reason).toBeInstanceOf(ConflictException);
        expect(await db.getRepository(Reserva).count()).toBe(0);
      }
    });

    it('creaciones simultáneas del calendario no duplican días ni reabren días reservados', async () => {
      const reserva = await crear(3);
      const resultados = await competir(
        () =>
          disponibilidad.crear({
            id_publicacion: publicacion.id,
            ...rango(2, 12),
          }),
        () =>
          disponibilidad.crear({
            id_publicacion: publicacion.id,
            ...rango(3, 12),
          }),
      );
      expect(resultados.every((r) => r.status === 'fulfilled')).toBe(true);
      expect(await db.getRepository(Fecha).count()).toBe(12);
      expect((await fechas())[2]).toMatchObject({
        disponible: false,
        reserva: { id: reserva.id },
      });
      await expect(
        db.getRepository(Fecha).insert({ fecha: dia(3), publicacion }),
      ).rejects.toMatchObject({ driverError: { code: '23505' } });
    });

    it('rechaza rangos con un día ausente o bloqueado sin crear una reserva', async () => {
      await disponibilidad.eliminar((await fechas())[2].id);
      await expect(crear(2, 4)).rejects.toBeInstanceOf(ConflictException);
      await disponibilidad.actualizar((await fechas())[0].id, {
        disponible: false,
      });

      await expect(crear(1, 2)).rejects.toBeInstanceOf(ConflictException);
      expect(await db.getRepository(Reserva).count()).toBe(0);
    });

    it('la eliminación del anunciante compite con la reserva sin borrar un día ocupado', async () => {
      const id = (await fechas())[2].id;
      const resultados = await competir(
        () => crear(3),
        async () => {
          await disponibilidad.eliminar(id);
          return null;
        },
      );
      if (resultados[0].status === 'fulfilled') {
        expect(resultados[1].status).toBe('rejected');
        expect((await fechas())[2].reserva?.id).toBe(resultados[0].value?.id);
      } else {
        expect(resultados[0].reason).toBeInstanceOf(ConflictException);
        expect(resultados[1].status).toBe('fulfilled');
        expect(await db.getRepository(Reserva).count()).toBe(0);
      }
    });

    it('un correo demorado no restaura el período anterior después de reprogramar', async () => {
      const reserva = await crear(1, 2);
      await reservas.confirmarPago(reserva.id, new Date());
      await db
        .getRepository(Reserva)
        .update(reserva.id, { email_confirmacion_inquilino_enviado: false });
      const anterior = await new ReservaRepository(
        db.getRepository(Reserva),
      ).buscarPorId(reserva.id);
      let iniciar!: () => void;
      let completar!: () => void;
      const iniciado = new Promise<void>((resolve) => {
        iniciar = resolve;
      });
      const espera = new Promise<void>((resolve) => {
        completar = resolve;
      });
      correo.enviarReservaConfirmada = async () => {
        iniciar();
        await espera;
      };
      const envio = modulo
        .get(ReservaNotificacionesService)
        .enviarConfirmacion(anterior!);
      try {
        await iniciado;
        await reservas.actualizarFechas(
          reserva.id,
          rango(4, 5),
          inquilinos[0].id,
        );
      } finally {
        completar();
        await envio;
      }
      expect(
        await db.getRepository(Reserva).findOneByOrFail({ id: reserva.id }),
      ).toMatchObject({
        fecha_inicio: dia(4),
        fecha_fin: dia(5),
        email_confirmacion_inquilino_enviado: true,
      });
      expect(
        (await fechas()).slice(3, 5).every((f) => f.reserva?.id === reserva.id),
      ).toBe(true);
    });

    it('conserva los intentos incorrectos del código aunque la respuesta sea un error', async () => {
      const reserva = await crear(2);
      await reservas.confirmarPago(reserva.id, new Date());
      for (let intento = 1; intento <= 5; intento++) {
        await expect(
          liquidaciones.validarCodigoAlojamiento(
            reserva.id,
            '00000000',
            publicacion.anunciante.idUsuario,
          ),
        ).rejects.toThrow('Código incorrecto');
        expect(
          (await db.getRepository(Reserva).findOneByOrFail({ id: reserva.id }))
            .intentos_codigo,
        ).toBe(intento);
      }
      expect(
        (await db.getRepository(Reserva).findOneByOrFail({ id: reserva.id }))
          .estado_liquidacion,
      ).toBe(EstadoLiquidacionReserva.EN_REVISION);
    });

    it('conserva tarifa, moneda e importe pagados aunque el anunciante aumente el precio', async () => {
      const reserva = await crear(1, 2);
      await reservas.confirmarPago(reserva.id, new Date());
      const pago = await db.getRepository(Pago).save({
        reserva,
        external_reference: 'reserva:' + reserva.id,
        status: 'approved',
        amount: 200,
        currency: 'ARS',
        idempotency_key: randomUUID(),
      });
      await db
        .getRepository(Publicacion)
        .update(publicacion.id, { precio: 900 });
      const actual = await reservas.actualizarFechas(
        reserva.id,
        rango(4, 5),
        inquilinos[0].id,
      );
      expect(actual).toMatchObject({
        monto_pago: '200.00',
        importe_contratado: '200.00',
        precio_unitario_contratado: '100.00',
        moneda_contratada: 'ARS',
      });
      expect(
        await db.getRepository(Pago).findOneByOrFail({ id: pago.id }),
      ).toMatchObject({
        amount: '200.00',
        currency: 'ARS',
        status: 'approved',
      });
      expect(enviarAviso).toHaveBeenCalledWith(
        'usuario0@example.test',
        expect.objectContaining({
          inicioAnterior: dia(1),
          finAnterior: dia(2),
          inicioNuevo: dia(4),
          finNuevo: dia(5),
          monto: 200,
          moneda: 'ARS',
          cantidadDias: 2,
        }),
      );
      expect(actual.reprogramaciones).toHaveLength(1);
      expect(actual.reprogramaciones[0].notificada_en).not.toBeNull();
      const respuesta = JSON.parse(JSON.stringify(actual.reprogramaciones[0]));
      expect(respuesta).not.toHaveProperty('detalle');
      expect(respuesta).not.toHaveProperty('destinatario');
    });

    it.each([
      [4, 4],
      [4, 6],
    ])(
      'rechaza acortar o ampliar la estadía (%i a %i) sin tocar importes, calendario ni avisos',
      async (a, b) => {
        const reserva = await crear(1, 2);
        await reservas.confirmarPago(reserva.id, new Date());
        await expect(
          reservas.actualizarFechas(reserva.id, rango(a, b), inquilinos[0].id),
        ).rejects.toThrow('misma cantidad de días');
        expect(
          (await db.getRepository(Reserva).findOneByOrFail({ id: reserva.id }))
            .monto_pago,
        ).toBe('200.00');
        expect(
          (await fechas())
            .slice(0, 2)
            .every((f) => f.reserva?.id === reserva.id),
        ).toBe(true);
        expect(await db.getRepository(ReprogramacionReserva).count()).toBe(0);
        expect(enviarAviso).not.toHaveBeenCalled();
      },
    );

    it('conserva un aviso pendiente si falla el correo y permite reintentar sin repetir el cambio', async () => {
      const reserva = await crear(1, 2);
      await reservas.confirmarPago(reserva.id, new Date());
      enviarAviso.mockRejectedValueOnce(
        new Error('Correo temporalmente caído'),
      );
      const actual = await reservas.actualizarFechas(
        reserva.id,
        rango(4, 5),
        inquilinos[0].id,
      );
      const cambio = actual.reprogramaciones[0];
      expect(actual.fecha_inicio).toBe(dia(4));
      expect(cambio.notificada_en).toBeNull();
      await expect(
        reservas.reintentarAvisoReprogramacion(
          reserva.id,
          cambio.id,
          inquilinos[1].id,
        ),
      ).rejects.toThrow('No tenés permiso');
      expect(enviarAviso).toHaveBeenCalledTimes(1);
      const notificada = await reservas.reintentarAvisoReprogramacion(
        reserva.id,
        cambio.id,
        publicacion.anunciante.idUsuario,
      );
      expect(notificada.reprogramaciones[0].notificada_en).not.toBeNull();
      await reservas.actualizarFechas(
        reserva.id,
        rango(4, 5),
        inquilinos[0].id,
      );
      expect(await db.getRepository(ReprogramacionReserva).count()).toBe(1);
      expect(enviarAviso).toHaveBeenCalledTimes(2);
      expect(
        (await fechas()).slice(3, 5).every((f) => f.reserva?.id === reserva.id),
      ).toBe(true);
    });

    it('serializa dos reintentos de correo para no duplicar un aviso ya enviado', async () => {
      const reserva = await crear(1, 2);
      await reservas.confirmarPago(reserva.id, new Date());
      enviarAviso.mockRejectedValueOnce(new Error('Fallo inicial'));
      const actual = await reservas.actualizarFechas(
        reserva.id,
        rango(4, 5),
        inquilinos[0].id,
      );
      const idCambio = actual.reprogramaciones[0].id;
      let iniciar!: () => void, liberar!: () => void;
      const inicio = new Promise<void>((r) => {
        iniciar = r;
      });
      const espera = new Promise<void>((r) => {
        liberar = r;
      });
      enviarAviso.mockImplementationOnce(async () => {
        iniciar();
        await espera;
      });
      const primerAviso = reservas.reintentarAvisoReprogramacion(
        reserva.id,
        idCambio,
        inquilinos[0].id,
      );
      await inicio;
      const segundoAviso = reservas.reintentarAvisoReprogramacion(
        reserva.id,
        idCambio,
        inquilinos[0].id,
      );
      liberar();
      await Promise.all([primerAviso, segundoAviso]);
      expect(enviarAviso).toHaveBeenCalledTimes(2);
      expect(await db.getRepository(ReprogramacionReserva).count()).toBe(1);
    });

    it('no permite enviar el aviso de otra reserva aunque el usuario participe de ambas', async () => {
      const a = await crear(1);
      const b = await crear(3);
      await reservas.confirmarPago(a.id, new Date());
      await reservas.confirmarPago(b.id, new Date());
      const movida = await reservas.actualizarFechas(
        b.id,
        rango(7),
        inquilinos[0].id,
      );
      await expect(
        reservas.reintentarAvisoReprogramacion(
          a.id,
          movida.reprogramaciones[0].id,
          inquilinos[0].id,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(enviarAviso).toHaveBeenCalledTimes(1);
    });

    it('revierte fechas y reserva si no se puede guardar el historial del aviso', async () => {
      const reserva = await crear(1, 2);
      await reservas.confirmarPago(reserva.id, new Date());
      await db.query(
        `CREATE OR REPLACE FUNCTION "${esquema}".fallar_calendario() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fallo calendario'; END $$`,
      );
      await db.query(`CREATE TRIGGER fallo_aviso BEFORE INSERT ON "${esquema}".reprogramacion_reserva
        FOR EACH ROW EXECUTE FUNCTION "${esquema}".fallar_calendario()`);
      await expect(
        reservas.actualizarFechas(reserva.id, rango(4, 5), inquilinos[0].id),
      ).rejects.toThrow('fallo calendario');
      expect(
        (await db.getRepository(Reserva).findOneByOrFail({ id: reserva.id }))
          .fecha_inicio,
      ).toBe(dia(1));
      expect(
        (await fechas()).slice(0, 2).every((f) => f.reserva?.id === reserva.id),
      ).toBe(true);
      expect(await db.getRepository(ReprogramacionReserva).count()).toBe(0);
      expect(enviarAviso).not.toHaveBeenCalled();
    });

    it('recupera total y moneda de pagos anteriores sin inventar una tarifa histórica ni modificar importes', async () => {
      const reserva = await crear(1, 2);
      await reservas.confirmarPago(reserva.id, new Date());
      await db.getRepository(Pago).save({
        reserva,
        external_reference: 'reserva:' + reserva.id,
        status: 'approved',
        amount: 200,
        currency: 'ARS',
        idempotency_key: randomUUID(),
      });
      await db.getRepository(Reserva).update(reserva.id, {
        importe_contratado: null,
        moneda_contratada: null,
        precio_unitario_contratado: null,
      });
      await expect(
        reservas.actualizarFechas(reserva.id, rango(4, 5), inquilinos[0].id),
      ).rejects.toThrow('condiciones originales');
      const runner = db.createQueryRunner();
      await runner.connect();
      await runner.startTransaction();
      try {
        await runner.query(`SET LOCAL search_path TO "${esquema}"`);
        const sql = readFileSync(
          join(
            process.cwd(),
            'migrations/20261027-reprogramacion-reservas.sql',
          ),
          'utf8',
        );
        await runner.query(sql);
        await runner.query(sql);
        await runner.commitTransaction();
      } finally {
        if (runner.isTransactionActive) await runner.rollbackTransaction();
        await runner.release();
      }
      expect(
        await db.getRepository(Reserva).findOneByOrFail({ id: reserva.id }),
      ).toMatchObject({
        monto_pago: '200.00',
        importe_contratado: '200.00',
        moneda_contratada: 'ARS',
        precio_unitario_contratado: null,
      });
      await db.getRepository(Reserva).update(reserva.id, { monto_pago: 1000 });
      await expect(
        reservas.actualizarFechas(reserva.id, rango(4, 5), inquilinos[0].id),
      ).rejects.toThrow('no coincide con el contratado');
      expect(enviarAviso).not.toHaveBeenCalled();
    });

    it('la migración detecta duplicados sin borrar datos y puede repetirse', async () => {
      const runner = db.createQueryRunner();
      await runner.connect();
      const sql = readFileSync(
        join(process.cwd(), 'migrations/20261027-calendario-unico.sql'),
        'utf8',
      );
      try {
        await runner.startTransaction();
        await runner.query(`SET LOCAL search_path TO "${esquema}"`);
        await runner.query(sql);
        await runner.query(sql);
        await runner.commitTransaction();
        await runner.startTransaction();
        await runner.query(`SET LOCAL search_path TO "${esquema}"`);
        await runner.query(
          'ALTER TABLE fecha DROP CONSTRAINT "UQ_fecha_publicacion_dia"',
        );
        await runner.query(
          `INSERT INTO fecha (fecha, disponible, id_publicacion) VALUES ($1, true, $2)`,
          [dia(3), publicacion.id],
        );
        await expect(runner.query(sql)).rejects.toThrow('días duplicados');
        await runner.rollbackTransaction();
        expect(await db.getRepository(Fecha).count()).toBe(10);
      } finally {
        if (runner.isTransactionActive) await runner.rollbackTransaction();
        await runner.release();
      }
    });
  },
);
