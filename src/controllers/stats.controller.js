const statsService = require('../services/stats.service');

exports.dashboard = async (req, res) => {
  res.json(await statsService.dashboard(req.user, req.query));
};