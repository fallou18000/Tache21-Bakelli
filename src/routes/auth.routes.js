const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middlewares/auth');
const ctrl = require('../controllers/auth.controller');

// Maximum 10 tentatives de connexion par 15 minutes
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post('/login', loginLimiter, ctrl.loginWeb);        // manager, admin
router.post('/login/mobile', loginLimiter, ctrl.loginMobile); // commercial
router.get('/me', requireAuth, ctrl.me);
router.post('/logout', ctrl.logout);

module.exports = router;