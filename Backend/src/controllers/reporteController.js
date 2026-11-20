const reporteService = require('../services/reporteService');

async function getReporte(req, res) {
  try { res.json(await reporteService.getReporte(req.params.id)); }
  catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al generar reporte' }); }
}

async function getReporteGlobal(req, res) {
  try { res.json(await reporteService.getReporteGlobal(req.params.estudianteId)); }
  catch (err) { res.status(err.status || 500).json({ error: err.message || 'Error al generar reporte global' }); }
}

module.exports = { getReporte, getReporteGlobal };
