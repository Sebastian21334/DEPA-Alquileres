// Uso: node back/scripts/preparar-ingreso-demo.cjs 131 [--aplicar]
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

async function main() {
  const id = Number(process.argv[2]);
  const aplicar = process.argv[3] === '--aplicar';
  if (id !== 131 || process.argv.length > 4 || (process.argv[3] && !aplicar))
    throw new Error('Uso: node back/scripts/preparar-ingreso-demo.cjs 131 [--aplicar]');
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL en back/.env');
  const db = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
  try {
    await db.connect();
    await db.query('BEGIN');
    const { rows } = await db.query(`
      SELECT r.id_reserva, r.id_usuario, r.id_publicacion, p.id_anunciante,
             r.estado_pago, r.cancelada, r.finalizada, r.codigo_validado_en,
             r.fecha_inicio::text, r.fecha_fin::text, l.estado AS estado_liquidacion,
             (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date::text AS nuevo_inicio,
             ((now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date +
               (r.fecha_fin - r.fecha_inicio))::text AS nuevo_fin
      FROM reserva r JOIN publicacion p ON p.id_publicacion = r.id_publicacion
      LEFT JOIN liquidacion l ON l.id_reserva = r.id_reserva
      WHERE r.id_reserva = $1 FOR UPDATE OF r`, [id]);
    const r = rows[0];
    if (!r || Number(r.id_usuario) !== 57 || Number(r.id_anunciante) !== 53 || Number(r.id_publicacion) !== 31)
      throw new Error('La reserva no corresponde a los participantes y publicación esperados.');
    if (r.estado_pago !== 'APROBADO' || r.cancelada || r.finalizada || r.codigo_validado_en ||
        !r.fecha_inicio || !r.fecha_fin || r.fecha_inicio > r.fecha_fin || r.estado_liquidacion !== 'RETENIDO')
      throw new Error('La reserva debe estar pagada, vigente, sin ingreso validado y con liquidación retenida.');
    const conflicto = await db.query(`SELECT id_reserva FROM reserva
      WHERE id_publicacion = $1 AND id_reserva <> $2 AND cancelada = false
        AND fecha_inicio <= $4::date AND fecha_fin >= $3::date LIMIT 1`,
      [r.id_publicacion, id, r.nuevo_inicio, r.nuevo_fin]);
    if (conflicto.rowCount) throw new Error('Las fechas se superponen con otra reserva; no se modificó nada.');
    console.log('Reserva:', r.id_reserva, '| Publicación:', r.id_publicacion);
    console.log('Fechas originales:', r.fecha_inicio, 'al', r.fecha_fin);
    console.log('Fechas de demostración:', r.nuevo_inicio, 'al', r.nuevo_fin);
    if (aplicar) {
      await db.query('UPDATE reserva SET fecha_inicio = $1::date, fecha_fin = $2::date WHERE id_reserva = $3', [r.nuevo_inicio, r.nuevo_fin, id]);
      await db.query('COMMIT');
      console.log('Fechas actualizadas. Ya podés intentar validar el ingreso desde la cuenta del anunciante.');
    } else {
      await db.query('ROLLBACK');
      console.log('Vista previa: no se modificó nada. Agregá --aplicar para confirmar.');
    }
  } catch (error) {
    await db.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await db.end().catch(() => {});
  }
}
main().catch(error => { console.error('No se modificó la reserva:', error.code || error.message); process.exitCode = 1; });
