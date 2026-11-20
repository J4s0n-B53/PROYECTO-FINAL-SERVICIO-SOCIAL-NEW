const pool = require('../database/connection');

async function getAll() {
  const [rows] = await pool.query(
    `SELECT c.*, f.nombre_facultad
     FROM carreras c
     LEFT JOIN facultades f ON c.id_facultad = f.id_facultad
     ORDER BY f.nombre_facultad IS NULL, f.nombre_facultad, c.nombre_carrera`
  );
  return rows;
}

module.exports = { getAll };
