// Uso: node back/scripts/habilitar-liquidacion-demo.cjs ID [--aplicar]
// Solo para una reserva de demostración ya pagada y con ingreso validado.
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

async function main() {
  const id = Number(process.argv[2]);
  const aplicar = process.argv[3] === '--aplicar';
  if (!Number.isSafeInteger(id) || id <= 0 || process.argv.length > 4 || (process.argv[3] && !aplicar))
    throw new Error('Uso: node back/scripts/habilitar-liquidacion-demo.cjs ID [--aplicar]');
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL en back/.env');
  const db = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
  try {
    await db.connect();
    await db.query('BEGIN');
    const { rows } = await db.query(`
      SELECT r.id_reserva, r.id_usuario, r.id_publicacion, p.id_anunciante,
             r.estado_pago, r.cancelada, r.finalizada, r.codigo_validado_en,
             r.fecha_inicio::text, r.fecha_fin::text, l.estado AS estado_liquidacion,
             ((now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date - 5)::text AS nuevo_fin,
             (((now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date - 5)
               - (r.fecha_fin - r.fecha_inicio))::text AS nuevo_inicio
      FROM reserva r JOIN publicacion p ON p.id_publicacion = r.id_publicacion
      LEFT JOIN liquidacion l ON l.id_reserva = r.id_reserva
      WHERE r.id_reserva = $1 FOR UPDATE OF r`, [id]);
    const r = rows[0];
    if (!r || Number(r.id_usuario) !== 57 || Number(r.id_anunciante) !== 53)
      throw new Error('La reserva no existe o no corresponde a Sebastián González como inquilino y Sebastián Roberto González como anunciante.');
    if (r.estado_pago !== 'APROBADO' || r.cancelada || !r.codigo_validado_en || !r.fecha_inicio || !r.fecha_fin || r.fecha_inicio > r.fecha_fin)
      throw new Error('La reserva debe tener pago aprobado, fechas válidas e ingreso validado y no estar cancelada.');
    if (!['PENDIENTE_PAGO_PROPIETARIO', 'DEVUELTO_PARCIAL_INQUILINO'].includes(r.estado_liquidacion))
      throw new Error(`La liquidación no está pendiente de pago: ${r.estado_liquidacion}`);
    const solapadas = await db.query(`SELECT id_reserva FROM reserva
      WHERE id_publicacion = $1 AND id_reserva <> $2 AND cancelada = false
        AND fecha_inicio <= $4::date AND fecha_fin >= $3::date LIMIT 1`,
      [r.id_publicacion, id, r.nuevo_inicio, r.nuevo_fin]);
    if (solapadas.rowCount) throw new Error('Las fechas históricas se superponen con otra reserva; no se modificó nada.');
    console.log('Reserva:', r.id_reserva, '| Publicación:', r.id_publicacion);
    console.log('Fechas originales:', r.fecha_inicio, 'al', r.fecha_fin);
    console.log('Fechas simuladas:', r.nuevo_inicio, 'al', r.nuevo_fin);
    console.log('Pago:', r.estado_pago, '| Liquidación:', r.estado_liquidacion);
    if (aplicar) {
      await db.query('UPDATE reserva SET fecha_inicio = $1::date, fecha_fin = $2::date WHERE id_reserva = $3', [r.nuevo_inicio, r.nuevo_fin, id]);
      await db.query('COMMIT');
      console.log('Fechas modificadas para la demostración. El proceso normal finalizará la estadía.');
    } else {
      await db.query('ROLLBACK');
      console.log('Vista previa: no se modificó ningún dato. Agregá --aplicar para confirmar.');
    }
  } catch (error) {
    await db.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await db.end().catch(() => {});
  }
}
main().catch(error => { console.error('No se modificó la reserva:', error.code || error.message); process.exitCode = 1; });
