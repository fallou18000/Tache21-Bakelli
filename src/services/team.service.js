const usersRepo = require('../repositories/users.repo');

exports.teamIds = async (user) => {
  if (user.role === 'commercial') return [user.id];
  if (user.role === 'admin') return usersRepo.findTeamIds(user.entrepriseId);
  return usersRepo.findTeamIds(user.entrepriseId, user.id);
};