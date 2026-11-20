const ofertasService = require('../services/ofertasService');
const fs = require('node:fs');
const path = require('node:path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '../../uploads/ofertas');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, done) => done(null, uploadDir),
    filename: (_req, file, done) => done(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, done) => file.mimetype.startsWith('image/') ? done(null, true) : done(new Error('Solo se permiten archivos de imagen')),
}).single('imagen');

async function getAll(req, res) {
  try { res.json(await ofertasService.getAll({ papelera: req.query.papelera === 'true' })); }
  catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al obtener ofertas' }); }
}

async function getTrash(_req, res) {
  try { res.json(await ofertasService.getAll({ papelera: true })); }
  catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al obtener la papelera' }); }
}

async function getById(req, res) {
  try { res.json(await ofertasService.getById(req.params.id)); }
  catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error del servidor' }); }
}

async function create(req, res) {
  try {
    const result = await ofertasService.create(req.body, req.user.id);
    res.status(201).json({ id: result.id, mensaje: 'Oferta creada' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Error al crear oferta' });
  }
}

async function update(req, res) {
  try {
    await ofertasService.update(req.params.id, req.body);
    res.json({ mensaje: 'Oferta actualizada' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Error al actualizar oferta' });
  }
}

async function toggle(req, res) {
  try {
    await ofertasService.toggle(req.params.id);
    res.json({ mensaje: 'Estado actualizado' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Error al actualizar el estado' });
  }
}

async function enviarAPapelera(req, res) {
  try {
    await ofertasService.enviarAPapelera(req.params.id);
    res.json({ mensaje: 'Oferta movida a la papelera; se eliminará automáticamente en 30 días' });
  } catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al mover la oferta a la papelera' }); }
}

async function restaurarDePapelera(req, res) {
  try { await ofertasService.restaurarDePapelera(req.params.id); res.json({ mensaje: 'Oferta restaurada' }); }
  catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al restaurar la oferta' }); }
}

async function eliminarDefinitivamente(req, res) {
  try { await ofertasService.eliminarDefinitivamente(req.params.id); res.json({ mensaje: 'Oferta eliminada definitivamente' }); }
  catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al eliminar la oferta' }); }
}

async function vaciarPapelera(_req, res) {
  try { res.json({ mensaje:'Papelera vaciada', ...await ofertasService.vaciarPapelera() }); }
  catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al vaciar la papelera' }); }
}

function uploadImagen(req, res) {
  upload(req, res, err => {
    if (err) {
      const status = err.code === 'LIMIT_FILE_SIZE' ? 400 : 500;
      const error = err.code === 'LIMIT_FILE_SIZE' ? 'La imagen no puede superar 5 MB' : err.message || 'Error al subir imagen';
      return res.status(status).json({ error });
    }
    if (!req.file) return res.status(400).json({ error: 'Selecciona una imagen' });
    res.status(201).json({ imagen_url: `/uploads/ofertas/${req.file.filename}` });
  });
}

module.exports = { getAll, getTrash, getById, create, update, toggle, enviarAPapelera, restaurarDePapelera, eliminarDefinitivamente, vaciarPapelera, uploadImagen };
