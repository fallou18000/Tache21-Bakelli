const { query } = require('../config/db');

const RETARD = `r.date_prevue < date_trunc('day', now())`;
const AUJOURDHUI = `r.date_prevue >= date_trunc('day', now())
                    AND r.date_prevue < date_trunc('day', now()) + interval '1 day'`;
const AVENIR = `r.date_prevue >= date_trunc('day', now()) + interval '1 day'`;
const FILTRES = { retard: RETARD, aujourdhui: AUJOURDHUI, avenir: AVENIR };

const BASE = `FROM relance r
  JOIN prospect p ON p.id = r.prospect_id
  JOIN users u ON u.id = p.commercial_id
  WHERE p.entreprise_id = $1 AND p.commercial_id = ANY($2) AND r.fait = FALSE`;

exports.compteurs = async (entrepriseId, userIds) => {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS toutes,
            COUNT(*) FILTER (WHERE ${RETARD})::int AS retard,
            COUNT(*) FILTER (WHERE ${AUJOURDHUI})::int AS aujourdhui,
            COUNT(*) FILTER (WHERE ${AVENIR})::int AS avenir
     ${BASE}`,
    [entrepriseId, userIds]
  );
  return rows[0];
};

exports.liste = async (entrepriseId, userIds, filtre) => {
  const condition = filtre ? `AND ${FILTRES[filtre]}` : '';
  const { rows } = await query(
    `SELECT r.id, r.type, r.note, COALESCE(r.note, r.type) AS libelle,
            r.date_prevue AS "datePrevue",
            (${RETARD}) AS "enRetard",
            p.id AS "prospectId", p.nom AS prospect, p.societe AS entreprise,
            json_build_object('id', u.id, 'nom', u.nom) AS commercial
     ${BASE} ${condition}
     ORDER BY r.date_prevue`,
    [entrepriseId, userIds]
  );
  return rows;
};