const pool = require('../database/connection');
const MAX_HORAS_OFERTA = 500;
const HORAS_AMBIENTALES = 25;

function toBoolean(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function validarOferta({ titulo, descripcion, ubicacion, fecha_inicio, fecha_fin, hora_inicio, hora_fin, horas_acreditar, cupo_maximo }) {
  if (!titulo || !descripcion || !ubicacion || !fecha_inicio || !fecha_fin || !hora_inicio || !hora_fin)
    throw { status: 400, message: 'Completa título, descripción, ubicación, fechas y horas' };
  const horas = Number(horas_acreditar);
  const cupo = Number(cupo_maximo);
  if (!Number.isInteger(horas) || horas < 1 || horas > MAX_HORAS_OFERTA)
    throw { status: 400, message: `Las horas a acreditar deben estar entre 1 y ${MAX_HORAS_OFERTA}` };
  if (!Number.isInteger(cupo) || cupo < 1)
    throw { status: 400, message: 'El cupo máximo debe ser mayor a 0' };
  if (fecha_inicio > fecha_fin)
    throw { status: 400, message: 'La fecha de finalización no puede ser anterior a la fecha de inicio' };
  if (fecha_inicio === fecha_fin && hora_inicio > hora_fin)
    throw { status: 400, message: 'La hora de finalización no puede ser anterior a la hora de inicio' };
}

async function getAll({ papelera = false } = {}) {
  const [rows] = await pool.query(`
    SELECT o.*, c.nombre_carrera, u.nombre_completo AS admin_nombre,
           CASE WHEN o.deleted_at IS NULL THEN NULL ELSE DATE_ADD(o.deleted_at, INTERVAL 30 DAY) END AS eliminar_en
    FROM ofertas o
    LEFT JOIN carreras c ON o.id_carrera = c.id_carrera
    LEFT JOIN usuarios u ON o.id_admin_creador = u.id_usuario
    WHERE ${papelera ? 'o.deleted_at IS NOT NULL' : 'o.deleted_at IS NULL'}
    ORDER BY o.created_at DESC
  `);
  return rows;
}

async function getById(id) {
  const [rows] = await pool.query(
    `SELECT o.*, c.nombre_carrera FROM ofertas o
     LEFT JOIN carreras c ON o.id_carrera = c.id_carrera
     WHERE o.id_oferta = ? AND o.deleted_at IS NULL`,
    [id]
  );
  if (!rows.length) throw { status: 404, message: 'Oferta no encontrada' };
  return rows[0];
}

async function create(data, adminId) {
  const ambiental = toBoolean(data.es_ambiental);
  const horas = ambiental ? HORAS_AMBIENTALES : data.horas_acreditar;
  validarOferta({ ...data, horas_acreditar: horas });
  const [result] = await pool.query(
    `INSERT INTO ofertas
      (titulo, descripcion, institucion_receptora, modalidad, ubicacion, horario,
       fecha_inicio, fecha_fin, hora_inicio, hora_fin, horas_acreditar,
       es_ambiental, imagen_url, cupo_maximo, id_carrera, id_admin_creador, activo)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ?, TRUE)`,
    [data.titulo, data.descripcion, data.institucion_receptora || null, data.modalidad || null,
      data.ubicacion, data.horario || null, data.fecha_inicio, data.fecha_fin, data.hora_inicio,
      data.hora_fin, horas, ambiental, data.imagen_url || null, data.cupo_maximo,
      data.id_carrera || null, adminId]
  );
  return { id: result.insertId };
}

async function update(id, data) {
  const ambiental = toBoolean(data.es_ambiental);
  const horas = ambiental ? HORAS_AMBIENTALES : data.horas_acreditar;
  validarOferta({ ...data, horas_acreditar: horas });
  const [result] = await pool.query(
    `UPDATE ofertas SET
       titulo=?, descripcion=?, institucion_receptora=?, modalidad=?, ubicacion=?, horario=?,
       fecha_inicio=?, fecha_fin=?, hora_inicio=?, hora_fin=?, horas_acreditar=?, es_ambiental=?,
       imagen_url=?, cupo_maximo=?, id_carrera=?
     WHERE id_oferta=? AND deleted_at IS NULL`,
    [data.titulo, data.descripcion, data.institucion_receptora || null, data.modalidad || null,
      data.ubicacion, data.horario || null, data.fecha_inicio, data.fecha_fin, data.hora_inicio,
      data.hora_fin, horas, ambiental, data.imagen_url || null, data.cupo_maximo,
      data.id_carrera || null, id]
  );
  if (!result.affectedRows) throw { status: 404, message: 'Oferta no encontrada' };
}

async function toggle(id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[oferta]] = await conn.query('SELECT id_oferta, activo FROM ofertas WHERE id_oferta=? AND deleted_at IS NULL FOR UPDATE', [id]);
    if (!oferta) throw { status: 404, message: 'Oferta no encontrada' };
    if (Boolean(oferta.activo)) {
      const [[avance]] = await conn.query(`SELECT
          SUM(estado <> 'rechazado') AS estudiantes_inscritos,
          SUM(horas_acreditadas IS NOT NULL AND horas_acreditadas > 0) AS horas_acreditadas
        FROM inscripciones WHERE id_oferta=?`, [id]);
      if (Number(avance.estudiantes_inscritos || 0) < 1)
        throw { status: 409, message: 'No se puede finalizar una oferta sin estudiantes inscritos' };
      if (Number(avance.horas_acreditadas || 0) < 1)
        throw { status: 409, message: 'No se puede finalizar: primero acredita horas a los estudiantes inscritos' };
    }
    await conn.query('UPDATE ofertas SET activo = NOT activo WHERE id_oferta=?', [id]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally { conn.release(); }
}

async function enviarAPapelera(id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[oferta]] = await conn.query('SELECT id_oferta FROM ofertas WHERE id_oferta=? AND deleted_at IS NULL FOR UPDATE', [id]);
    if (!oferta) throw { status: 404, message: 'Oferta no encontrada' };
    const [[uso]] = await conn.query(`SELECT
        COALESCE(SUM(estado IN ('aceptado', 'finalizado')),0) AS estudiantes_aceptados,
        COALESCE(SUM(horas_acreditadas IS NOT NULL),0) AS horas_asignadas
      FROM inscripciones WHERE id_oferta=?`, [id]);
    if (Number(uso.estudiantes_aceptados) > 0 || Number(uso.horas_asignadas) > 0)
      throw { status: 409, message: 'No se puede eliminar: la oferta tiene estudiantes aceptados o horas acreditadas' };
    await conn.query(`DELETE FROM inscripciones
      WHERE id_oferta=? AND estado NOT IN ('aceptado', 'finalizado') AND horas_acreditadas IS NULL`, [id]);
    await conn.query('UPDATE ofertas SET deleted_at=CURRENT_TIMESTAMP WHERE id_oferta=? AND deleted_at IS NULL', [id]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally { conn.release(); }
}

async function restaurarDePapelera(id) {
  const [result] = await pool.query('UPDATE ofertas SET deleted_at=NULL WHERE id_oferta=? AND deleted_at IS NOT NULL', [id]);
  if (!result.affectedRows) throw { status: 404, message: 'Oferta no encontrada en la papelera' };
}

async function eliminarDefinitivamente(id) {
  const [[oferta]] = await pool.query('SELECT id_oferta FROM ofertas WHERE id_oferta=? AND deleted_at IS NOT NULL', [id]);
  if (!oferta) throw { status: 404, message: 'Oferta no encontrada en la papelera' };
  const [[uso]] = await pool.query('SELECT COUNT(*) AS inscripciones FROM inscripciones WHERE id_oferta=?', [id]);
  if (Number(uso.inscripciones) > 0)
    throw { status: 409, message: 'No se puede eliminar definitivamente: la oferta tiene inscripciones asociadas' };
  await pool.query('DELETE FROM ofertas WHERE id_oferta=? AND deleted_at IS NOT NULL', [id]);
}

async function vaciarPapelera() {
  const [[bloqueo]] = await pool.query(`SELECT COUNT(*) AS cantidad FROM ofertas o
    WHERE o.deleted_at IS NOT NULL
      AND EXISTS (SELECT 1 FROM inscripciones i WHERE i.id_oferta=o.id_oferta)`);
  if (Number(bloqueo.cantidad) > 0)
    throw { status: 409, message: 'La papelera contiene ofertas con inscripciones asociadas; no se eliminó ninguna' };
  const [result] = await pool.query('DELETE FROM ofertas WHERE deleted_at IS NOT NULL');
  return { eliminadas: result.affectedRows };
}

async function purgarVencidas() {
  const [result] = await pool.query(`DELETE FROM ofertas
    WHERE deleted_at IS NOT NULL
      AND deleted_at <= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 DAY)
      AND NOT EXISTS (SELECT 1 FROM inscripciones WHERE inscripciones.id_oferta=ofertas.id_oferta)`);
  return result.affectedRows;
}

module.exports = { getAll, getById, create, update, toggle, enviarAPapelera, restaurarDePapelera, eliminarDefinitivamente, vaciarPapelera, purgarVencidas };
