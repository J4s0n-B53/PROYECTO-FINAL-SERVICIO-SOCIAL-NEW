const inscripcionesService = require('../services/inscripcionesService');

async function getAll(_req, res) {
  try { res.json(await inscripcionesService.getAll()); }
  catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al obtener inscripciones' }); }
}

async function inscribir(req, res) {
  const { id_oferta, id_estudiante } = req.body;
  if (!id_oferta || !id_estudiante) return res.status(400).json({ error: 'Selecciona un estudiante y una oferta' });
  try {
    await inscripcionesService.inscribir(id_estudiante, id_oferta, req.user.id);
    res.status(201).json({ mensaje: 'Inscripción registrada' });
  } catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al registrar la inscripción' }); }
}

async function cambiarEstado(req, res) {
  try { await inscripcionesService.cambiarEstado(req.params.id, req.body.estado); res.json({ mensaje: 'Estado actualizado' }); }
  catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al actualizar el estado' }); }
}

async function acreditarHoras(req, res) {
  try { await inscripcionesService.acreditarHoras(req.params.id, req.body.horas_acreditadas); res.json({ mensaje: 'Horas acreditadas' }); }
  catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al acreditar horas' }); }
}

async function eliminar(req, res) {
  try { await inscripcionesService.eliminar(req.params.id); res.json({ mensaje: 'Inscripción eliminada' }); }
  catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al eliminar la inscripción' }); }
}

module.exports = { getAll, inscribir, cambiarEstado, acreditarHoras, eliminar };
