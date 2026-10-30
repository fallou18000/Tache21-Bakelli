const router = require('express').Router();
const { requireAuth, requireRole } = require('../middlewares/auth');
const ctrl = require('../controllers/stats.controller');

router.get('/dashboard', requireAuth, requireRole('manager', 'admin'), ctrl.dashboard);

module.exports = router;