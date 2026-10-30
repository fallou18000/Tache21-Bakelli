const repo = require('../repositories/relances.repo');
const teamService = require('./team.service');
const HttpError = require('../utils/HttpError');

const FILTRES = ['retard', 'aujourdhui', 'avenir'];

exports.liste = async (user, { filtre }) => {
  if (filtre && !FILTRES.includes(filtre)) throw new HttpError(400, 'Filtre invalide');

  const ids = await teamService.teamIds(user);
  const [compteurs, items] = await Promise.all([
    repo.compteurs(user.entrepriseId, ids),
    repo.liste(user.entrepriseId, ids, filtre || null),
  ]);
  return { compteurs, items };
};