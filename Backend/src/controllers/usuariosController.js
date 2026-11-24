const usuariosService = require('../services/usuariosService');

async function getAll(req, res) {
  try {
    const rows = await usuariosService.getAll();
    res.json(rows);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Error del servidor' });
  }
}

async function getTrash(_req, res) {
  try { res.json(await usuariosService.getAll({ papelera: true })); }
  catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al obtener la papelera' }); }
}

async function buscar(req, res) {
  try { res.json(await usuariosService.buscar(req.query.q)); }
  catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al buscar estudiantes' }); }
}

async function crear(req, res) {
  try {
    const result = await usuariosService.crear(req.body);
    res.status(201).json({ id: result.id, mensaje: 'Estudiante registrado' });
  } catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al registrar estudiante' }); }
}

async function actualizarEstudiante(req, res) {
  try {
    await usuariosService.actualizarEstudiante(req.params.id, req.body);
    res.json({ ok: true, mensaje: 'Estudiante actualizado' });
  } catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al actualizar estudiante' }); }
}

async function eliminarEstudiante(req, res) {
  try {
    await usuariosService.eliminarEstudiante(req.params.id);
    res.json({ ok: true, mensaje: 'Estudiante movido a la papelera; se eliminará automáticamente en 30 días' });
  } catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al eliminar estudiante' }); }
}

async function restaurarDePapelera(req, res) {
  try { await usuariosService.restaurarDePapelera(req.params.id); res.json({ ok: true, mensaje: 'Estudiante restaurado' }); }
  catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al restaurar estudiante' }); }
}

async function eliminarDefinitivamente(req, res) {
  try { await usuariosService.eliminarDefinitivamente(req.params.id); res.json({ ok: true, mensaje: 'Estudiante eliminado definitivamente' }); }
  catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al eliminar estudiante' }); }
}

async function vaciarPapelera(_req, res) {
  try { res.json({ ok: true, mensaje: 'Papelera vaciada', ...await usuariosService.vaciarPapelera() }); }
  catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al vaciar la papelera' }); }
}

async function actualizarHorasManuales(req, res) {
  try {
    const resultado = await usuariosService.actualizarHorasManuales(req.params.id, req.body.horas_manuales);
    res.json({ ok: true, ...resultado });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Error del servidor' });
  }
}

async function actualizarNumeroExpediente(req, res) {
  try {
    await usuariosService.actualizarNumeroExpediente(req.params.id, req.body.numero_expediente);
    res.json({ ok: true });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Error del servidor' });
  }
}

async function actualizarPlanEstudios(req,res) {
  try { await usuariosService.actualizarPlanEstudios(req.params.id,req.body); res.json({ok:true}); }
  catch(err) { res.status(err.status||500).json({error:err.message||'Error al actualizar el plan de estudios'}); }
}

module.exports = { getAll, getTrash, buscar, crear, actualizarEstudiante, eliminarEstudiante, restaurarDePapelera, eliminarDefinitivamente, vaciarPapelera, actualizarHorasManuales, actualizarNumeroExpediente, actualizarPlanEstudios };
