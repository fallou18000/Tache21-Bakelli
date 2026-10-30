const service = require('../services/objectifs.service');

exports.lire = async (req, res) => {
  res.json(await service.lire(req.user, Number(req.query.userId), req.query.periode));
};

exports.enregistrer = async (req, res) => {
  res.json(await service.enregistrer(req.user, req.body));
};

exports.progression = async (req, res) => {
  res.json(await service.progression(req.user, req.query.periode));
};