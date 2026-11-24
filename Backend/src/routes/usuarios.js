const router = require('express').Router();
const usuariosController = require('../controllers/usuariosController');
const { authMiddleware, adminOnly } = require('../middlewares/auth');

// GET /api/usuarios  — solo admin
router.get('/', authMiddleware, adminOnly, usuariosController.getAll);
router.get('/trash', authMiddleware, adminOnly, usuariosController.getTrash);
router.delete('/trash', authMiddleware, adminOnly, usuariosController.vaciarPapelera);
router.delete('/trash/:id', authMiddleware, adminOnly, usuariosController.eliminarDefinitivamente);
router.patch('/trash/:id/restore', authMiddleware, adminOnly, usuariosController.restaurarDePapelera);
router.get('/buscar', authMiddleware, adminOnly, usuariosController.buscar);
router.post('/', authMiddleware, adminOnly, usuariosController.crear);
router.patch('/:id', authMiddleware, adminOnly, usuariosController.actualizarEstudiante);
router.delete('/:id', authMiddleware, adminOnly, usuariosController.eliminarEstudiante);

router.patch('/:id/horas-manuales', authMiddleware, adminOnly, usuariosController.actualizarHorasManuales);
router.patch('/:id/numero-expediente', authMiddleware, adminOnly, usuariosController.actualizarNumeroExpediente);
router.patch('/:id/plan-estudios', authMiddleware, adminOnly, usuariosController.actualizarPlanEstudios);

module.exports = router;
