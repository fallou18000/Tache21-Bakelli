const repo = require('../repositories/objectifs.repo');
const teamService = require('./team.service');
const HttpError = require('../utils/HttpError');

const TYPES = ['appels', 'contacts', 'rdv', 'propositions', 'ventes'];
const PERIODES = ['semaine', 'mois'];
const UNITE = { semaine: 'week', mois: 'month' };

const verifierPeriode = (p = 'semaine') => {
  if (!PERIODES.includes(p)) throw new HttpError(400, 'Période invalide');
  return p;
};

// Le client choisit les ids : on vérifie qu'ils font partie de MON équipe
const verifierMembres = async (user, userIds) => {
  const ids = await teamService.teamIds(user);
  if (!userIds.every((id) => ids.includes(id)))
    throw new HttpError(404, 'Commercial introuvable');
};

const pct = (realise, cible) => (cible ? Math.round((realise / cible) * 100) : 0);

exports.lire = async (user, userId, periode) => {
  periode = verifierPeriode(periode);
  if (!Number.isInteger(userId)) throw new HttpError(400, 'Identifiant invalide');
  await verifierMembres(user, [userId]);

  const valeurs = Object.fromEntries(TYPES.map((t) => [t, 0]));
  for (const l of await repo.lire(userId, periode)) valeurs[l.type] = l.cible;
  return { userId, periode, valeurs };
};

exports.enregistrer = async (user, { userIds, periode, valeurs }) => {
  periode = verifierPeriode(periode);

  if (!Array.isArray(userIds) || userIds.length === 0 || !userIds.every(Number.isInteger))
    throw new HttpError(400, 'Choisissez au moins un commercial');
  if (!valeurs || typeof valeurs !== 'object')
    throw new HttpError(400, 'Valeurs manquantes');
  for (const t of TYPES) {
    const v = valeurs[t];
    if (!Number.isInteger(v) || v < 0 || v > 100000)
      throw new HttpError(400, `Valeur invalide pour « ${t} »`);
  }

  const uniques = [...new Set(userIds)];
  await verifierMembres(user, uniques);
  await repo.enregistrer(uniques, periode, user.id, TYPES, TYPES.map((t) => valeurs[t]));
  return { ok: true, userIds: uniques, periode, valeurs };
};

// Réutilisée par le service Équipe
exports.calculer = async (entrepriseId, ids, periode = 'semaine') => {
  const lignes = await repo.progression(entrepriseId, ids, UNITE[periode], periode);
  const parUser = new Map();

  for (const l of lignes) {
    if (!parUser.has(l.userId))
      parUser.set(l.userId, { userId: l.userId, nom: l.nom, objectifs: [] });
    parUser.get(l.userId).objectifs.push({
      type: l.type, cible: l.cible, realise: l.realise, pourcentage: pct(l.realise, l.cible),
    });
  }

  // "global" : moyenne des pourcentages, chacun plafonné à 100
  return [...parUser.values()].map((u) => ({
    ...u,
    global: Math.round(
      u.objectifs.reduce((s, o) => s + Math.min(100, o.pourcentage), 0) / u.objectifs.length
    ),
  }));
};

exports.progression = async (user, periode) => {
  periode = verifierPeriode(periode);
  const ids = await teamService.teamIds(user);
  return exports.calculer(user.entrepriseId, ids, periode);
};