const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const pool = require('../db');
const { requireAuth } = require('./middleware');

// Maximum 10 tentatives de connexion par 15 minutes
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email et mot de passe requis' });

    const { rows } = await pool.query(
      `SELECT u.id, u.nom, u.email, u.mot_de_passe, u.entreprise_id, r.nom AS role
       FROM users u
       JOIN role r ON r.id = u.role_id
       WHERE u.email = $1`,
      [email.toLowerCase().trim()]
    );

    const user = rows[0];
    const ok = user && await bcrypt.compare(password, user.mot_de_passe);
    if (!ok) return res.status(401).json({ error: 'Identifiants invalides' });
    if (!['manager', 'admin'].includes(user.role))
  return res.status(403).json({ error: 'Accès refusé' });

    const token = jwt.sign(
      { sub: user.id, role: user.role, entrepriseId: user.entreprise_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600_000,
    });

    res.json({
      token,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        entrepriseId: user.entreprise_id,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.nom, u.email, u.entreprise_id, r.nom AS role
       FROM users u
       JOIN role r ON r.id = u.role_id
       WHERE u.id = $1 AND u.entreprise_id = $2`,
      [req.user.id, req.user.entrepriseId]
    );
    if (!rows[0]) return res.status(401).json({ error: 'Utilisateur introuvable' });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/test', (req, res) => {
    res.json({
        message: 'La route auth fonctionne !'
    });
});

module.exports = router;