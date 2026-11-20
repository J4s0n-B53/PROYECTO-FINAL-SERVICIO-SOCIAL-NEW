const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database/connection');
const { JWT_SECRET } = require('../config/env');

const INSTITUTIONAL_DOMAIN = '@usonsonate.edu.sv';

async function login(correo, password) {
  const correoNormalizado = correo.toLowerCase().trim();
  if (!correoNormalizado.endsWith(INSTITUTIONAL_DOMAIN))
    throw { status: 400, message: 'Solo se permiten correos institucionales @usonsonate.edu.sv' };

  const [[user]] = await pool.query(
    `SELECT id_usuario, nombre_completo, correo_institucional, password_hash, rol
     FROM usuarios WHERE correo_institucional = ?`,
    [correoNormalizado]
  );
  if (!user || user.rol !== 'admin') throw { status: 401, message: 'Credenciales incorrectas' };
  if (!await bcrypt.compare(password, user.password_hash))
    throw { status: 401, message: 'Credenciales incorrectas' };

  const token = jwt.sign(
    { id: user.id_usuario, rol: 'admin', nombre: user.nombre_completo },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
  return {
    token,
    usuario: {
      id: user.id_usuario,
      nombre: user.nombre_completo,
      correo: user.correo_institucional,
      rol: 'admin',
    },
  };
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

async function getAuthUserById(userId) {
  const [[user]] = await pool.query(
    `SELECT id_usuario, nombre_completo, correo_institucional, rol
     FROM usuarios WHERE id_usuario = ?`,
    [userId]
  );
  if (!user || user.rol !== 'admin') throw { status: 404, message: 'Usuario no encontrado' };
  return {
    id: user.id_usuario,
    nombre: user.nombre_completo,
    correo: user.correo_institucional,
    rol: 'admin',
  };
}

module.exports = { login, verifyToken, getAuthUserById };
