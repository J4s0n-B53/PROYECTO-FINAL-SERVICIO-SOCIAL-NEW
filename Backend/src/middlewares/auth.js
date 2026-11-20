const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { AUTH_COOKIE_NAME, getCookie } = require('../controllers/authController');

function authMiddleware(req, res, next) {
  const token = getCookie(req, AUTH_COOKIE_NAME);
  if (!token) return res.status(401).json({ error: 'SesiÃ³n requerida' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.rol !== 'admin') return res.status(403).json({ error: 'Solo el administrador general puede acceder' });
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'SesiÃ³n invÃ¡lida o expirada' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.rol !== 'admin') return res.status(403).json({ error: 'Acceso reservado al administrador general' });
  next();
}

module.exports = { authMiddleware, adminOnly };
