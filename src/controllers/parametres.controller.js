const service = require('../services/parametres.service');

exports.lire = async (req, res) => {
  res.json(await service.lire(req.user));
};

exports.modifier = async (req, res) => {
  res.json(await service.modifier(req.user, req.body));
};