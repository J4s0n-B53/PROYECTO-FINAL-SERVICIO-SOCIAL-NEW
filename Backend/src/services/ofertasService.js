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

async function getAll() {
  const [rows] = await pool.query(`
    SELECT o.*, c.nombre_carrera, u.nombre_completo AS admin_nombre
    FROM ofertas o
    LEFT JOIN carreras c ON o.id_carrera = c.id_carrera
    LEFT JOIN usuarios u ON o.id_admin_creador = u.id_usuario
    ORDER BY o.created_at DESC
  `);
  return rows;
}

async function getById(id) {
  const [rows] = await pool.query(
    `SELECT o.*, c.nombre_carrera FROM ofertas o
     LEFT JOIN carreras c ON o.id_carrera = c.id_carrera
     WHERE o.id_oferta = ?`,
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
     WHERE id_oferta=?`,
    [data.titulo, data.descripcion, data.institucion_receptora || null, data.modalidad || null,
      data.ubicacion, data.horario || null, data.fecha_inicio, data.fecha_fin, data.hora_inicio,
      data.hora_fin, horas, ambiental, data.imagen_url || null, data.cupo_maximo,
      data.id_carrera || null, id]
  );
  if (!result.affectedRows) throw { status: 404, message: 'Oferta no encontrada' };
}

async function toggle(id) {
  const [result] = await pool.query('UPDATE ofertas SET activo = NOT activo WHERE id_oferta = ?', [id]);
  if (!result.affectedRows) throw { status: 404, message: 'Oferta no encontrada' };
}

module.exports = { getAll, getById, create, update, toggle };
