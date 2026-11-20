function reglaError(status, message) {
  throw { status, message };
}

function assertPorcentajeMaterias(aprobadas, total, porcentaje) {
  if (!Number(total)) reglaError(409, 'El expediente no tiene configurado el total de materias del plan de estudio');
  if ((Number(aprobadas) / Number(total)) * 100 < Number(porcentaje))
    reglaError(403, `Se requiere aprobar al menos el ${Number(porcentaje)}% de materias para esta carrera`);
}

function assertCupo(actual, maximo) {
  if (Number(actual) >= Number(maximo)) reglaError(409, 'La oferta alcanzó su cupo máximo');
}

function assertNoDuplicada(duplicada) {
  if (duplicada) reglaError(409, 'El estudiante ya está inscrito en esta oferta');
}

function assertSinOtraActiva(activa) {
  if (activa) reglaError(409, 'El estudiante ya tiene otra inscripción activa');
}

module.exports = { assertPorcentajeMaterias, assertCupo, assertNoDuplicada, assertSinOtraActiva };
