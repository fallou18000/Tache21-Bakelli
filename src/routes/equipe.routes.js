const router = require('express').Router();
const { requireAuth, requireRole } = require('../middlewares/auth');
const ctrl = require('../controllers/equipe.controller');

router.use(requireAuth, requireRole('manager', 'admin'));

router.get('/', ctrl.liste);
router.get('/:id', ctrl.audit);

module.exports = router;