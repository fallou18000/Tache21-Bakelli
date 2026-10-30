const { query } = require('../config/db');
const { CONTACTS_SQL } = require('../utils/resultats');

exports.parCommercial = async (entrepriseId, userIds, debut, fin, campagne) => {
  const { rows } = await query(
    `SELECT u.id, u.nom,
            COUNT(a.id)::int AS appels,
            COALESCE(SUM(a.duree), 0)::int AS "dureeTotaleSec",
            COUNT(a.id) FILTER (WHERE a.resultat IN ${CONTACTS_SQL})::int AS contacts,
            COUNT(a.id) FILTER (WHERE a.resultat = 'rdv obtenu')::int AS rdv,
            COUNT(a.id) FILTER (WHERE a.resultat = 'vente')::int AS ventes,
            COALESCE(SUM(a.montant) FILTER (WHERE a.resultat = 'vente'), 0)::int AS "valeurEstimee"
     FROM users u
     JOIN role r ON r.id = u.role_id AND r.nom = 'commercial'
     LEFT JOIN (
       SELECT ap.* FROM appel ap
       LEFT JOIN prospect p ON p.id = ap.prospect_id
       WHERE ap.date_heure >= $3 AND ap.date_heure < $4
         AND ($5::text IS NULL OR p.origine = $5)
     ) a ON a.user_id = u.id
     WHERE u.entreprise_id = $1 AND u.id = ANY($2)
     GROUP BY u.id, u.nom
     ORDER BY u.nom`,
    [entrepriseId, userIds, debut, fin, campagne]
  );
  return rows;
};

exports.appelsPeriode = async (entrepriseId, userIds, debut, fin, campagne) => {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS appels
     FROM appel a
     JOIN users u ON u.id = a.user_id
     LEFT JOIN prospect p ON p.id = a.prospect_id
     WHERE u.entreprise_id = $1 AND a.user_id = ANY($2)
       AND a.date_heure >= $3 AND a.date_heure < $4
       AND ($5::text IS NULL OR p.origine = $5)`,
    [entrepriseId, userIds, debut, fin, campagne]
  );
  return rows[0].appels;
};

exports.campagnes = async (entrepriseId) => {
  const { rows } = await query(
    `SELECT DISTINCT origine FROM prospect
     WHERE entreprise_id = $1 AND origine IS NOT NULL ORDER BY origine`,
    [entrepriseId]
  );
  return rows.map((r) => r.origine);
};