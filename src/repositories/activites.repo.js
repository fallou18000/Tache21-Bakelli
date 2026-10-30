const { query } = require('../config/db');

exports.liste = async (entrepriseId, userIds, type, limit, offset) => {
  const { rows } = await query(
    `SELECT a.id,
            a.date_heure AS "dateHeure",
            a.sens, a.duree, a.resultat, a.note,
            COALESCE(p.nom, a.numero) AS contact,
            p.societe AS entreprise,
            json_build_object('id', u.id, 'nom', u.nom) AS commercial
     FROM appel a
     JOIN users u ON u.id = a.user_id
     LEFT JOIN prospect p ON p.id = a.prospect_id
     WHERE u.entreprise_id = $1
       AND a.user_id = ANY($2)
       AND ($3::text IS NULL OR a.sens = $3)
     ORDER BY a.date_heure DESC
     LIMIT $4 OFFSET $5`,
    [entrepriseId, userIds, type, limit, offset]
  );
  return rows;
};