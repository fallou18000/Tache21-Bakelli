const statsRepo = require('../repositories/stats.repo');
const teamService = require('./team.service');
const objectifsService = require('./objectifs.service');
const HttpError = require('../utils/HttpError');
const { bornes } = require('../utils/periodes');

const PERIODES = ['semaine', 'mois', 'trimestre'];

// Les objectifs n'existent qu'en "semaine" et "mois" : un trimestre vaut 3 mois
const OBJECTIF = {
  semaine:   { base: 'semaine', facteur: 1 },
  mois:      { base: 'mois',    facteur: 1 },
  trimestre: { base: 'mois',    facteur: 3 },
};

const somme = (lignes, champ) => lignes.reduce((s, l) => s + l[champ], 0);
const pct = (a, b, decimales = 0) => (b ? +((a / b) * 100).toFixed(decimales) : 0);

exports.dashboard = async (user, { periode = 'semaine' } = {}) => {
  if (!PERIODES.includes(periode)) throw new HttpError(400, 'Période invalide');

  const ids = await teamService.teamIds(user);
  const e = user.entrepriseId;
  const b = bornes(periode);
  const o = OBJECTIF[periode];

  const [lignes, lignesPrec, cibleVentes, alertes, progression] = await Promise.all([
    statsRepo.parCommercial(e, ids, b.debut, b.fin),
    statsRepo.parCommercial(e, ids, b.debutPrec, b.finPrec),
    statsRepo.quotaVentes(ids, o.base),
    statsRepo.alertesProspects(e, ids),
    // Pourcentage par commercial : seulement pour une semaine ou un mois
    ['semaine', 'mois'].includes(periode)
      ? objectifsService.calculer(e, ids, periode)
      : Promise.resolve([]),
  ]);

  const appels = somme(lignes, 'appels');
  const contacts = somme(lignes, 'contacts');
  const rdv = somme(lignes, 'rdv');
  const ventes = somme(lignes, 'ventes');
  const appelsPrec = somme(lignesPrec, 'appels');

  // Commercial qui appelle beaucoup (au moins la moyenne) mais convertit moins que l'équipe
  const tauxEquipe = appels ? rdv / appels : 0;
  const moyenneAppels = lignes.length ? appels / lignes.length : 0;
  const pire = lignes
    .filter((l) => l.appels > 0 && l.appels >= moyenneAppels && l.rdv / l.appels < tauxEquipe)
    .sort((x, y) => x.rdv / x.appels - y.rdv / y.appels)[0];

  const objectifs = new Map(progression.map((p) => [p.userId, p.global]));

  return {
    periode: { cle: periode, debut: b.debut, fin: b.fin },
    kpi: {
      appels,
      variationAppels: appelsPrec ? +(((appels - appelsPrec) / appelsPrec) * 100).toFixed(1) : null,
      contacts,
      tauxJoignabilite: pct(contacts, appels),
      interesses: somme(lignes, 'interesses'),
      rdv,
      tauxRdv: pct(rdv, contacts),
      propositions: somme(lignes, 'propositions'),
      ventes,
      quotaVentes: cibleVentes ? pct(ventes, cibleVentes * o.facteur) : null,
      tauxConversion: pct(ventes, appels, 1),
    },
    insights: {
      prospectsSansRelance: alertes.sansRelance,
      propositionsEnAttente: alertes.propositionsEnAttente,
      performance: pire
        ? { id: pire.id, nom: pire.nom, appels: pire.appels,
            tauxRdv: pct(pire.rdv, pire.appels, 1), tauxRdvEquipe: pct(rdv, appels, 1) }
        : null,
    },
    commerciaux: lignes.map((l) => ({
      id: l.id, nom: l.nom, poste: l.poste,
      appels: l.appels, contacts: l.contacts, rdv: l.rdv,
      propositions: l.propositions, ventes: l.ventes,
      objectif: objectifs.get(l.id) ?? null,
    })),
  };
};