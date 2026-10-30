const service = require('../services/rapports.service');

exports.rapport = async (req, res) => {
  res.json(await service.rapport(req.user, req.query));
};

exports.exportCsv = async (req, res) => {
  const csv = await service.exportCsv(req.user, req.query);
  res.set({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': 'attachment; filename="rapport-activite.csv"',
  });
  res.send(csv);
};