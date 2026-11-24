require('reflect-metadata');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');
const { Reserva } = require('../dist/reservas/entity/reserva.entity');
const { ReservaRepository } = require('../dist/reservas/repository/reserva.repository');
const { ReservasService } = require('../dist/reservas/service/reservas.service');

test('PostgreSQL: un inquilino reserva y cancela el mismo día hasta tres veces; la cuarta se rechaza', async (t) => {
  const base = await crearPostgresPruebas();
  t.after(() => base.cerrar());
  const { db, source } = base;
  await db.exec(`
    INSERT INTO rol (id_rol,nombre) VALUES (1,'Inquilino'),(2,'Anunciante');
    INSERT INTO usuario (id_usuario,nombre,apellido,email,telefono,contrasenia,email_verificado,id_rol)
      VALUES (1,'Inquilino','Uno','uno@example.invalid','123','hash',true,1),
             (2,'Dueño','Prueba','dueno@example.invalid','123','hash',true,2),
             (3,'Inquilino','Dos','dos@example.invalid','123','hash',true,1);
    INSERT INTO anunciante (id_usuario,numero_contacto,verificado) VALUES (2,'123',true);
    INSERT INTO publicacion (id_publicacion,titulo,descripcion,fecha_publicacion,precio,direccion,cantidad_ambientes,superficie,id_anunciante)
      VALUES (10,'Casa','Prueba',CURRENT_DATE,100,'Calle 1',1,30,2), (11,'Otra casa','Prueba',CURRENT_DATE,100,'Calle 2',1,30,2);
  `);
  // La regla solo usa el repositorio; el resto de las dependencias no participa.
  const servicio = new ReservasService({}, new ReservaRepository(source.getRepository(Reserva)));
  const cancelada = (id, inicio, fin, { usuario = 1, publicacion = 10, pagada = true, por = 'INQUILINO' } = {}) => db.query(
    `INSERT INTO reserva (id_reserva,id_usuario,id_publicacion,estado_pago,monto_pago,fecha_inicio,fecha_fin,fecha_pago,cancelada,cancelada_por)
     VALUES ($1,$2,$3,$4,100,$5,$6,$7,true,$8)`,
    [id, usuario, publicacion, pagada ? 'APROBADO' : 'CANCELADO', inicio, fin, pagada ? new Date() : null, por]);
  const validar = (inicio, fin, usuario = 1, publicacion = 10) => servicio.validarLimiteCancelaciones(publicacion, usuario, inicio, fin);
  const rechazo = (dia) => ({ status: 409, message: `Ya reservaste y cancelaste el ${dia} tres veces en esta publicación. Elegí otras fechas.` });

  // Dos reservas pagadas y canceladas: la tercera todavía se permite.
  await cancelada(1, '2030-03-10', '2030-03-12');
  await cancelada(2, '2030-03-10', '2030-03-12');
  await validar('2030-03-10', '2030-03-12');
  // Las que no se pagaron, o que canceló el anunciante o Administración, no cuentan.
  await cancelada(3, '2030-03-10', '2030-03-12', { pagada: false });
  await cancelada(4, '2030-03-10', '2030-03-12', { por: 'ANUNCIANTE' });
  await cancelada(5, '2030-03-10', '2030-03-12', { por: 'ADMINISTRADOR' });
  await validar('2030-03-10', '2030-03-12');

  // La tercera cancelación completa el ciclo: el 11 y el 12 ya no se pueden reservar, aunque se toque un solo día.
  await cancelada(6, '2030-03-11', '2030-03-15');
  await assert.rejects(validar('2030-03-08', '2030-03-11'), rechazo('11/03/2030'));
  await assert.rejects(validar('2030-03-12', '2030-03-20'), rechazo('12/03/2030'));
  // Se cuenta por día: el 10 suma dos veces y del 13 en adelante una sola.
  await validar('2030-03-01', '2030-03-10');
  await validar('2030-03-13', '2030-03-20');
  // Otro inquilino, o el mismo en otra publicación, reservan normalmente.
  await validar('2030-03-10', '2030-03-12', 3);
  await validar('2030-03-10', '2030-03-12', 1, 11);
});
