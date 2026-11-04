const router = require('express').Router();
const { requireAuth, requireRole } = require('../middlewares/auth');

router.use('/auth', require('./auth.routes'));
router.use('/stats', require('./stats.routes'));

// Route de test réservée aux managers et admins
router.get('/team/test', requireAuth, requireRole('manager', 'admin'),
  (req, res) => res.json({ ok: true }));

router.use('/prospects', require('./prospects.routes')); 

router.use('/equipe', require('./equipe.routes'));

router.use('/activites', require('./activites.routes'));

router.use('/relances', require('./relances.routes'));
router.use('/objectifs', require('./objectifs.routes'));
router.use('/rapports', require('./rapports.routes'));
router.use('/parametres', require('./parametres.routes'));

module.exports = router;