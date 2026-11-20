const router = require('express').Router();
const inscripcionesController = require('../controllers/inscripcionesController');
const { authMiddleware, adminOnly } = require('../middlewares/auth');

// GET /api/inscripciones
router.get('/', authMiddleware, adminOnly, inscripcionesController.getAll);

// POST /api/inscripciones
router.post('/', authMiddleware, adminOnly, inscripcionesController.inscribir);

// PATCH /api/inscripciones/:id/estado
router.patch('/:id/estado',authMiddleware, adminOnly, inscripcionesController.cambiarEstado);

// PATCH /api/inscripciones/:id/horas
router.patch('/:id/horas', authMiddleware, adminOnly, inscripcionesController.acreditarHoras);

// DELETE /api/inscripciones/:id
router.delete('/:id', authMiddleware, adminOnly, inscripcionesController.eliminar);

module.exports = router;
