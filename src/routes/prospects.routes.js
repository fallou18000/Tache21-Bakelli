const router = require('express').Router();
const { requireAuth } = require('../middlewares/auth');
const ctrl = require('../controllers/prospects.controller');

router.get('/', requireAuth, ctrl.list);

module.exports = router;