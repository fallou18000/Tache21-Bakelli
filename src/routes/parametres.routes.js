const router = require('express').Router();
const { requireAuth, requireRole } = require('../middlewares/auth');
const ctrl = require('../controllers/parametres.controller');

router.use(requireAuth, requireRole('manager', 'admin'));

router.get('/', ctrl.lire);
router.put('/', ctrl.modifier);

module.exports = router;