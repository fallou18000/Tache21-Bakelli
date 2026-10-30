const repo = require('../repositories/activites.repo');
const teamService = require('./team.service');
const HttpError = require('../utils/HttpError');

const TYPES = ['entrant', 'sortant', 'manque'];

exports.liste = async (user, { type, limit, offset }) => {
  if (type && !TYPES.includes(type))
    throw new HttpError(400, 'Type d\'appel invalide');

  const l = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
  const o = Math.max(parseInt(offset) || 0, 0);

  const ids = await teamService.teamIds(user);
  return repo.liste(user.entrepriseId, ids, type || null, l, o);
};