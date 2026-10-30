const repo = require('../repositories/prospects.repo');
const teamService = require('./team.service');

exports.list = async (user) => {
  const ids = await teamService.teamIds(user);
  return repo.list(user.entrepriseId, ids);
};