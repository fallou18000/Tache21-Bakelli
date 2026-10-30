const service = require('../services/relances.service');

exports.liste = async (req, res) => {
  res.json(await service.liste(req.user, req.query));
};