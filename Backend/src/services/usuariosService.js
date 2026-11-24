const pool = require('../database/connection');
const META_NO_AMBIENTAL_SIN_AMBIENTAL = 475;
let asegurarPapeleraPromise;

async function asegurarColumnaPapelera() {
  if (!asegurarPapeleraPromise) {
    asegurarPapeleraPromise = (async () => {
      const [[columna]] = await pool.query(`SELECT COUNT(*) AS cantidad FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='estudiantes' AND COLUMN_NAME='deleted_at'`);
      if (!Number(columna.cantidad)) await pool.query('ALTER TABLE estudiantes ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL');
    })().catch(err => { asegurarPapeleraPromise = null; throw err; });
  }
  return asegurarPapeleraPromise;
}

async function asegurarTablaHorasManuales(connection = pool) {
  await connection.query(`CREATE TABLE IF NOT EXISTS horas_manuales_acreditadas (
    id_hora_manual INT AUTO_INCREMENT PRIMARY KEY,
    id_estudiante INT NOT NULL,
    horas INT NOT NULL,
    descripcion VARCHAR(150) DEFAULT 'Acreditacion manual',
    fecha_acreditacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
}

const joinsHoras = `
  LEFT JOIN (
    SELECT i.id_estudiante,
      SUM(CASE WHEN o.es_ambiental=TRUE THEN 0 ELSE COALESCE(i.horas_acreditadas,o.horas_acreditar) END) AS horas_no_ambientales
    FROM inscripciones i JOIN ofertas o ON o.id_oferta=i.id_oferta
    WHERE i.estado='finalizado' GROUP BY i.id_estudiante
  ) h ON h.id_estudiante=e.id_estudiante
  LEFT JOIN (
    SELECT i.id_estudiante,SUM(COALESCE(i.horas_acreditadas,o.horas_acreditar)) AS horas_ambientales
    FROM inscripciones i JOIN ofertas o ON o.id_oferta=i.id_oferta
    WHERE i.estado='finalizado' AND o.es_ambiental=TRUE GROUP BY i.id_estudiante
  ) ha ON ha.id_estudiante=e.id_estudiante`;

const camposHoras = `LEAST(COALESCE(h.horas_no_ambientales,0)+COALESCE(e.horas_manuales,0),${META_NO_AMBIENTAL_SIN_AMBIENTAL})+COALESCE(ha.horas_ambientales,0) AS horas_acumuladas,
  COALESCE(ha.horas_ambientales,0) AS horas_ambientales, COALESCE(ha.horas_ambientales,0)>=25 AS ambiental_cumplido`;

async function getAll({ papelera = false } = {}) {
  await asegurarColumnaPapelera();
  const [rows] = await pool.query(`SELECT e.*, e.id_estudiante AS id_usuario, c.nombre_carrera,c.codigo_carrera,f.id_facultad,f.nombre_facultad,
    c.total_materias_plan AS materias_plan_catalogo,
    CASE WHEN ra.id_regla IS NOT NULL THEN ra.minimo_materias_porcentaje ELSE rg.minimo_materias_porcentaje END AS minimo_materias_porcentaje,
    CASE WHEN e.deleted_at IS NULL THEN NULL ELSE DATE_ADD(e.deleted_at, INTERVAL 30 DAY) END AS eliminar_en,
    ${camposHoras} FROM estudiantes e LEFT JOIN carreras c ON c.id_carrera=e.id_carrera
    LEFT JOIN facultades f ON f.id_facultad=c.id_facultad
    LEFT JOIN reglas_academicas ra ON ra.id_carrera=c.id_carrera
    LEFT JOIN reglas_academicas rg ON rg.id_carrera IS NULL
    ${joinsHoras} WHERE e.deleted_at IS ${papelera ? 'NOT ' : ''}NULL ORDER BY e.nombre_completo`);
  return rows;
}

async function buscar(query) {
  await asegurarColumnaPapelera();
  const termino = `%${String(query || '').trim()}%`;
  if (termino === '%%') throw { status: 400, message: 'Escribe un número de expediente para buscar' };
  const [rows] = await pool.query(`SELECT e.id_estudiante,e.id_estudiante AS id_usuario,e.nombre_completo,e.correo_institucional,e.numero_expediente,
      e.materias_aprobadas,e.total_materias_plan,e.id_carrera,c.nombre_carrera,f.id_facultad,f.nombre_facultad
    FROM estudiantes e LEFT JOIN carreras c ON c.id_carrera=e.id_carrera LEFT JOIN facultades f ON f.id_facultad=c.id_facultad
    WHERE e.deleted_at IS NULL AND e.numero_expediente LIKE ? LIMIT 20`, [termino]);
  return rows;
}

async function crear(data) {
  await asegurarColumnaPapelera();
  const nombre = String(data.nombre_completo || '').trim();
  const correo = String(data.correo_institucional || '').trim();
  const expediente = String(data.numero_expediente || '').trim();
  const materias = Number(data.materias_aprobadas || 0);
  const total = Number(data.total_materias_plan || 0);
  if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || !/^\d{1,20}$/.test(expediente) || !Number.isInteger(materias) || materias < 0 || !Number.isInteger(total) || total < 1 || materias > total || !data.id_carrera)
    throw { status: 400, message: 'Completa nombre, expediente, carrera y materias aprobadas/plan con valores válidos' };
  try {
    const [result] = await pool.query(`INSERT INTO estudiantes (nombre_completo,correo_institucional,numero_expediente,materias_aprobadas,total_materias_plan,id_carrera)
      VALUES (?,?,?,?,?,?)`, [nombre, correo, expediente, materias, total, data.id_carrera]);
    return { id: result.insertId };
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw { status: 409, message: 'El número de expediente ya está registrado' };
    throw err;
  }
}

async function actualizarEstudiante(studentId, data) {
  await asegurarColumnaPapelera();
  const id = Number(studentId);
  const nombre = String(data.nombre_completo || '').trim();
  const correo = String(data.correo_institucional || '').trim();
  const expediente = String(data.numero_expediente || '').trim();
  const carreraId = Number(data.id_carrera);
  const materias = Number(data.materias_aprobadas);
  const total = Number(data.total_materias_plan);
  if (!Number.isInteger(id) || id < 1 || !nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || !/^\d{1,20}$/.test(expediente) || !Number.isInteger(carreraId) || carreraId < 1 || !Number.isInteger(materias) || materias < 0 || !Number.isInteger(total) || total < 1 || materias > total)
    throw { status: 400, message: 'Completa todos los campos del estudiante con valores válidos' };
  try {
    const [result] = await pool.query(`UPDATE estudiantes
      SET nombre_completo=?, correo_institucional=?, numero_expediente=?, id_carrera=?, materias_aprobadas=?, total_materias_plan=?
      WHERE id_estudiante=?`, [nombre, correo, expediente, carreraId, materias, total, id]);
    if (!result.affectedRows) throw { status: 404, message: 'Estudiante no encontrado' };
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw { status: 409, message: 'El número de expediente ya está registrado' };
    throw err;
  }
}

async function eliminarEstudiante(studentId) {
  await asegurarColumnaPapelera();
  const id = Number(studentId);
  if (!Number.isInteger(id) || id < 1) throw { status: 400, message: 'Identificador de estudiante inválido' };
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[student]] = await conn.query('SELECT id_estudiante FROM estudiantes WHERE id_estudiante=? AND deleted_at IS NULL FOR UPDATE', [id]);
    if (!student) throw { status: 404, message: 'Estudiante no encontrado' };
    await conn.query('UPDATE estudiantes SET deleted_at=CURRENT_TIMESTAMP WHERE id_estudiante=?', [id]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function restaurarDePapelera(id) {
  await asegurarColumnaPapelera();
  const [result] = await pool.query('UPDATE estudiantes SET deleted_at=NULL WHERE id_estudiante=? AND deleted_at IS NOT NULL', [id]);
  if (!result.affectedRows) throw { status: 404, message: 'Estudiante no encontrado en la papelera' };
}

async function eliminarDefinitivamente(id) {
  await asegurarColumnaPapelera();
  const [[student]] = await pool.query('SELECT id_estudiante FROM estudiantes WHERE id_estudiante=? AND deleted_at IS NOT NULL', [id]);
  if (!student) throw { status: 404, message: 'Estudiante no encontrado en la papelera' };
  const [[uso]] = await pool.query('SELECT COUNT(*) AS inscripciones FROM inscripciones WHERE id_estudiante=?', [id]);
  if (Number(uso.inscripciones)) throw { status: 409, message: 'No se puede eliminar definitivamente: el estudiante tiene inscripciones asociadas' };
  await pool.query('DELETE FROM estudiantes WHERE id_estudiante=? AND deleted_at IS NOT NULL', [id]);
}

async function vaciarPapelera() {
  await asegurarColumnaPapelera();
  const [[bloqueo]] = await pool.query(`SELECT COUNT(*) AS cantidad FROM estudiantes e WHERE e.deleted_at IS NOT NULL
    AND EXISTS (SELECT 1 FROM inscripciones i WHERE i.id_estudiante=e.id_estudiante)`);
  if (Number(bloqueo.cantidad)) throw { status: 409, message: 'La papelera contiene estudiantes con inscripciones; no se eliminó ninguno' };
  const [result] = await pool.query('DELETE FROM estudiantes WHERE deleted_at IS NOT NULL');
  return { eliminados: result.affectedRows };
}

async function purgarVencidos() {
  await asegurarColumnaPapelera();
  const [result] = await pool.query(`DELETE FROM estudiantes WHERE deleted_at IS NOT NULL
    AND deleted_at <= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 DAY)
    AND NOT EXISTS (SELECT 1 FROM inscripciones WHERE inscripciones.id_estudiante=estudiantes.id_estudiante)`);
  return result.affectedRows;
}

async function actualizarHorasManuales(studentId, horasManuales) {
  const horas = Number(horasManuales);
  if (!Number.isInteger(horas) || horas <= 0 || horas > 500) throw { status: 400, message: 'Ingresa horas manuales válidas entre 1 y 500' };
  await asegurarTablaHorasManuales();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[s]] = await conn.query(`SELECT e.id_estudiante,e.horas_manuales,COALESCE(h.horas,0) AS horas_no_ambientales
      FROM estudiantes e LEFT JOIN (SELECT id_estudiante,SUM(CASE WHEN o.es_ambiental=0 THEN COALESCE(i.horas_acreditadas,o.horas_acreditar) ELSE 0 END) horas
        FROM inscripciones i JOIN ofertas o ON o.id_oferta=i.id_oferta WHERE i.estado='finalizado' GROUP BY id_estudiante) h ON h.id_estudiante=e.id_estudiante
      WHERE e.id_estudiante=? FOR UPDATE`, [studentId]);
    if (!s) throw { status: 404, message: 'Estudiante no encontrado' };
    const allowed = Math.max(META_NO_AMBIENTAL_SIN_AMBIENTAL - Number(s.horas_no_ambientales || 0) - Number(s.horas_manuales || 0), 0);
    const credited = Math.min(horas, allowed);
    if (!credited) throw { status: 409, message: 'No quedan horas sociales disponibles para acreditar' };
    await conn.query('INSERT INTO horas_manuales_acreditadas (id_estudiante,horas,descripcion) VALUES (?,?,?)', [studentId,credited,'Acreditación manual']);
    await conn.query('UPDATE estudiantes SET horas_manuales=horas_manuales+?,fecha_horas_manuales=CURRENT_TIMESTAMP WHERE id_estudiante=?', [credited,studentId]);
    await conn.commit();
    return { horas_solicitadas: horas, horas_acreditadas: credited, ajustado: credited < horas };
  } catch (err) { await conn.rollback(); throw err; } finally { conn.release(); }
}

async function actualizarNumeroExpediente(studentId, numeroExpediente) {
  const numero = String(numeroExpediente ?? '').trim();
  if (!/^\d{1,20}$/.test(numero)) throw { status: 400, message: 'El número de expediente debe contener solo dígitos (máximo 20)' };
  try {
    const [result] = await pool.query('UPDATE estudiantes SET numero_expediente=? WHERE id_estudiante=?', [numero,studentId]);
    if (!result.affectedRows) throw { status: 404, message: 'Estudiante no encontrado' };
  } catch (err) { if (err.code === 'ER_DUP_ENTRY') throw { status: 409, message: 'Ese número de expediente ya está asignado' }; throw err; }
}

async function actualizarPlanEstudios(studentId, data) {
  const aprobadas=Number(data.materias_aprobadas), total=Number(data.total_materias_plan);
  if(!Number.isInteger(aprobadas)||!Number.isInteger(total)||aprobadas<0||total<1||aprobadas>total)
    throw {status:400,message:'Materias aprobadas y total del plan deben ser enteros válidos'};
  const [result]=await pool.query('UPDATE estudiantes SET materias_aprobadas=?,total_materias_plan=? WHERE id_estudiante=?',[aprobadas,total,studentId]);
  if(!result.affectedRows)throw {status:404,message:'Estudiante no encontrado'};
}

module.exports = { getAll, buscar, crear, actualizarEstudiante, eliminarEstudiante, restaurarDePapelera, eliminarDefinitivamente, vaciarPapelera, purgarVencidos, actualizarHorasManuales, actualizarNumeroExpediente, actualizarPlanEstudios, asegurarTablaHorasManuales };
