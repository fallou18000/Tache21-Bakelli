const authService = require('../services/auth.service');
const env = require('../config/env');
const HttpError = require('../utils/HttpError');

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.IS_PROD,
  maxAge: 3600_000,
};

// Fabrique un contrôleur de login pour une liste de rôles autorisés
const loginFor = (allowedRoles) => async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new HttpError(400, 'Email et mot de passe requis');

  const { token, user } = await authService.login(email, password, allowedRoles);

  res.cookie('token', token, cookieOptions);
  res.json({ token, user });
};

exports.loginWeb = loginFor(['manager', 'admin']);
exports.loginMobile = loginFor(['commercial']);

exports.me = async (req, res) => {
  res.json(await authService.me(req.user));
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
};