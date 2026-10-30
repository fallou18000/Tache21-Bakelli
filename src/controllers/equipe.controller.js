const service = require('../services/equipe.service');
const HttpError = require('../utils/HttpError');

exports.liste = async (req, res) => {
  res.json(await service.liste(req.user));
};

exports.audit = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new HttpError(400, 'Identifiant invalide');
  res.json(await service.audit(req.user, id));
};