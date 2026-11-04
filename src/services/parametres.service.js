const repo = require('../repositories/parametres.repo');
const HttpError = require('../utils/HttpError');

const DEVISES = ['XOF', 'EUR', 'USD'];

exports.lire = async (user) => {
  const p = await repo.lire(user.entrepriseId);
  if (!p) throw new HttpError(404, 'Entreprise introuvable');
  return p;
};

exports.modifier = async (user, body = {}) => {
  const { nom, devise, exclusionContactsPrives } = body;

  const n = typeof nom === 'string' ? nom.trim() : '';
  if (n.length < 2 || n.length > 150)
    throw new HttpError(400, 'Le nom doit contenir entre 2 et 150 caractères');
  if (!DEVISES.includes(devise))
    throw new HttpError(400, 'Devise invalide');
  if (typeof exclusionContactsPrives !== 'boolean')
    throw new HttpError(400, 'Valeur invalide pour l’exclusion des contacts privés');

  const p = await repo.modifier(user.entrepriseId, n, devise, exclusionContactsPrives);
  if (!p) throw new HttpError(404, 'Entreprise introuvable');
  return p;
};