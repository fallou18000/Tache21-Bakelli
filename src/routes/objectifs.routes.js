const router = require('express').Router();
const { requireAuth, requireRole } = require('../middlewares/auth');
const ctrl = require('../controllers/objectifs.controller');

router.use(requireAuth, requireRole('manager', 'admin'));

router.get('/', ctrl.lire);
router.get('/progression', ctrl.progression);
router.put('/', ctrl.enregistrer);

module.exports = router;