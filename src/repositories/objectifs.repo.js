const { query } = require('../config/db');
const { CONTACTS_SQL } = require('../utils/resultats');

exports.lire = async (userId, periode) => {
  const { rows } = await query(
    'SELECT type, valeur_cible AS cible FROM objectif WHERE user_id = $1 AND periode = $2',
    [userId, periode]
  );
  return rows;
};

// Une seule instruction : tout est enregistré, ou rien
exports.enregistrer = (userIds, periode, fixePar, types, valeurs) =>
  query(
    `INSERT INTO objectif (type, valeur_cible, periode, user_id, fixe_par)
     SELECT t.kind, t.valeur, $2::text, u.id, $3::int
     FROM unnest($1::int[]) AS u(id)
     CROSS JOIN unnest($4::text[], $5::int[]) AS t(kind, valeur)
     ON CONFLICT (user_id, type, periode)
     DO UPDATE SET valeur_cible = EXCLUDED.valeur_cible, fixe_par = EXCLUDED.fixe_par`,
    [userIds, periode, fixePar, types, valeurs]
  );

exports.progression = async (entrepriseId, userIds, unite, periode) => {
  const { rows } = await query(
    `SELECT o.user_id AS "userId", u.nom, o.type, o.valeur_cible AS cible,
            CASE o.type WHEN 'appels' THEN c.appels
                        WHEN 'contacts' THEN c.contacts
                        WHEN 'rdv' THEN c.rdv
                        WHEN 'propositions' THEN c.propositions
                        WHEN 'ventes' THEN c.ventes END AS realise
     FROM objectif o
     JOIN users u ON u.id = o.user_id
     JOIN LATERAL (
       SELECT COUNT(*)::int AS appels,
              COUNT(*) FILTER (WHERE resultat IN ${CONTACTS_SQL})::int AS contacts,
              COUNT(*) FILTER (WHERE resultat = 'rdv obtenu')::int AS rdv,
              COUNT(*) FILTER (WHERE resultat = 'devis demande')::int AS propositions,
              COUNT(*) FILTER (WHERE resultat = 'vente')::int AS ventes
       FROM appel
       WHERE user_id = o.user_id AND date_heure >= date_trunc($3::text, now())
     ) c ON TRUE
     WHERE u.entreprise_id = $1 AND o.user_id = ANY($2)
       AND o.periode = $4 AND o.valeur_cible > 0
     ORDER BY u.nom, o.type`,
    [entrepriseId, userIds, unite, periode]
  );
  return rows;
};