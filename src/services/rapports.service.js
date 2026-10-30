const repo = require('../repositories/rapports.repo');
const teamService = require('./team.service');
const HttpError = require('../utils/HttpError');
const { CLES, bornes } = require('../utils/periodes');
const { toCsv } = require('../utils/csv');

const pct = (a, b, decimales = 0) => (b ? +((a / b) * 100).toFixed(decimales) : 0);

async function calculer(user, { periode = 'mois', commercialId, campagne }) {
  if (!CLES.includes(periode)) throw new HttpError(400, 'Période invalide');

  let ids = await teamService.teamIds(user);
  if (commercialId !== undefined && commercialId !== '') {
    const id = Number(commercialId);
    if (!ids.includes(id)) throw new HttpError(404, 'Commercial introuvable');
    ids = [id];
  }

  const camp = typeof campagne === 'string' && campagne ? campagne : null;
  const b = bornes(periode);

  const [lignes, appelsPrec] = await Promise.all([
    repo.parCommercial(user.entrepriseId, ids, b.debut, b.fin, camp),
    repo.appelsPeriode(user.entrepriseId, ids, b.debutPrec, b.finPrec, camp),
  ]);

  const somme = (champ) => lignes.reduce((s, l) => s + l[champ], 0);
  const appels = somme('appels');
  const contacts = somme('contacts');
  const rdv = somme('rdv');

  return {
    periode: { cle: periode, debut: b.debut, fin: b.fin },
    kpi: {
      appels,
      variationAppels: appelsPrec ? +(((appels - appelsPrec) / appelsPrec) * 100).toFixed(1) : null,
      contacts,
      tauxJoignabilite: pct(contacts, appels, 1),
      rdv,
      tauxRdv: pct(rdv, contacts, 1),
      ventes: somme('ventes'),
      valeurVentes: somme('valeurEstimee'),
    },
    commerciaux: lignes.map((l) => ({
      id: l.id, nom: l.nom, appels: l.appels, dureeTotaleSec: l.dureeTotaleSec,
      joignabilite: pct(l.contacts, l.appels),
      rdv: l.rdv, ventes: l.ventes, valeurEstimee: l.valeurEstimee,
    })),
  };
}

exports.rapport = async (user, params) => ({
  ...(await calculer(user, params)),
  campagnes: await repo.campagnes(user.entrepriseId),
});

exports.exportCsv = async (user, params) => {
  const r = await calculer(user, params);
  const entetes = ['Commercial', 'Appels', 'Durée totale (min)', 'Joignabilité (%)',
                   'RDV', 'Ventes', 'Valeur estimée (FCFA)'];
  const lignes = r.commerciaux.map((c) => [
    c.nom, c.appels, Math.round(c.dureeTotaleSec / 60), c.joignabilite,
    c.rdv, c.ventes, c.valeurEstimee,
  ]);
  return toCsv([entetes, ...lignes]);
};