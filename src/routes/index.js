const router = require('express').Router();
const { requireAuth, requireRole } = require('../middlewares/auth');

router.use('/auth', require('./auth.routes'));

// Route de test réservée aux managers et admins
router.get('/team/test', requireAuth, requireRole('manager', 'admin'),
  (req, res) => res.json({ ok: true }));

module.exports = router;