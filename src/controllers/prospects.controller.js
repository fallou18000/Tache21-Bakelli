const service = require('../services/prospects.service');

exports.list = async (req, res) => {
  res.json(await service.list(req.user));
};