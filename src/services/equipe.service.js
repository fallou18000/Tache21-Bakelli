const repo = require('../repositories/equipe.repo');
const teamService = require('./team.service');
const HttpError = require('../utils/HttpError');
const objectifsService = require('./objectifs.service'); 

const pct = (a, b) => (b ? Math.min(100, Math.round((a / b) * 100)) : 0);

exports.liste = async (user) => {
  const ids = await teamService.teamIds(user);
  const [commerciaux, progression] = await Promise.all([
    repo.listeCommerciaux(user.entrepriseId, ids),
    objectifsService.calculer(user.entrepriseId, ids, 'semaine'),
  ]);
  const parUser = new Map(progression.map((p) => [p.userId, p.global]));
  return commerciaux.map((c) => ({ ...c, objectif: parUser.get(c.id) ?? null }));
};

exports.liste = async (user) => {
  const ids = await teamService.teamIds(user);
  const [commerciaux, objectifs] = await Promise.all([
    repo.listeCommerciaux(user.entrepriseId, ids),
    repo.objectifs(ids),
  ]);
  const parUser = new Map(objectifs.map((o) => [o.user_id, o.pourcentage]));
  return commerciaux.map((c) => ({ ...c, objectif: parUser.get(c.id) ?? null }));
};

exports.audit = async (user, id) => {
  const ids = await teamService.teamIds(user);
  if (!ids.includes(id)) throw new HttpError(404, 'Commercial introuvable');

  const [profil, c, evolution, risques, objectifs] = await Promise.all([
    repo.profil(user.entrepriseId, id),
    repo.chiffres(id),
    repo.evolution(id),
    repo.prospectsARisque(user.entrepriseId, id),
    repo.objectifs([id]),
  ]);
  if (!profil) throw new HttpError(404, 'Commercial introuvable');

  return {
    profil,
    objectif: objectifs[0]?.pourcentage ?? null,
    activite: { appels: c.appels, contacts: c.contacts, tempsTotalSec: c.tempsTotalSec },
    resultats: { rdv: c.rdv, propositions: c.propositions, ventes: c.ventes },
    conversion: {
      appelContact: pct(c.contacts, c.appels),
      contactRdv: pct(c.rdv, c.contacts),
      rdvProposition: pct(c.propositions, c.rdv),
      propositionVente: pct(c.ventes, c.propositions),
    },
    evolution,
    prospectsARisque: risques,
  };
};