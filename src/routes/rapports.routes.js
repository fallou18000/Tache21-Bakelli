const router = require('express').Router();
const { requireAuth, requireRole } = require('../middlewares/auth');
const ctrl = require('../controllers/rapports.controller');

router.use(requireAuth, requireRole('manager', 'admin'));

router.get('/', ctrl.rapport);
router.get('/export.csv', ctrl.exportCsv);

module.exports = router;