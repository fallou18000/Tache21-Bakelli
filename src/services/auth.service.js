const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const usersRepo = require('../repositories/users.repo');
const HttpError = require('../utils/HttpError');

exports.login = async (email, password, allowedRoles) => {
  const user = await usersRepo.findByEmail(email);
  const ok = user && (await bcrypt.compare(password, user.mot_de_passe));
  if (!ok) throw new HttpError(401, 'Identifiants invalides');

  // Contrôle du rôle seulement après le mot de passe correct
  if (!allowedRoles.includes(user.role))
    throw new HttpError(403, 'Accès refusé pour cette application');

  const token = jwt.sign(
    { sub: user.id, role: user.role, entrepriseId: user.entreprise_id },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    token,
    user: {
      id: user.id,
      nom: user.nom,
      email: user.email,
      role: user.role,
      entrepriseId: user.entreprise_id,
    },
  };
};

exports.me = async (authUser) => {
  const user = await usersRepo.findById(authUser.entrepriseId, authUser.id);
  if (!user) throw new HttpError(401, 'Utilisateur introuvable');
  return user;
};