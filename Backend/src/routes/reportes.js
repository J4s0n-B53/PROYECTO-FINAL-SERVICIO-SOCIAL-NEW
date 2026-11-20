const router = require('express').Router();
const ctrl   = require('../controllers/reporteController');
const { authMiddleware, adminOnly } = require('../middlewares/auth');

router.get('/global/:estudianteId', authMiddleware, adminOnly, ctrl.getReporteGlobal);
router.get('/:id', authMiddleware, adminOnly, ctrl.getReporte);

module.exports = router;
