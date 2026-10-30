const router = require('express').Router();
const { requireAuth, requireRole } = require('../middlewares/auth');
const ctrl = require('../controllers/relances.controller');

router.get('/', requireAuth, requireRole('manager', 'admin'), ctrl.liste);

module.exports = router;