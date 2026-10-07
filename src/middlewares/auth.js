const jwt = require('jsonwebtoken');
const env = require('../config/env');

function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  const token = h?.startsWith('Bearer ') ? h.slice(7) : req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Non authentifié' });

  try {
    const p = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: p.sub, role: p.role, entrepriseId: p.entrepriseId };
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ error: 'Accès refusé' });

module.exports = { requireAuth, requireRole };