const { query } = require('../config/db');
const { CONTACTS_SQL, INTERESSES_SQL } = require('../utils/resultats');

// Une ligne par commercial visible, sur une période
exports.parCommercial = async (entrepriseId, userIds, debut, fin) => {
  const { rows } = await query(
    `SELECT u.id, u.nom, u.poste,
            COUNT(a.id)::int AS appels,
            COUNT(a.id) FILTER (WHERE a.resultat IN ${CONTACTS_SQL})::int AS contacts,
            COUNT(a.id) FILTER (WHERE a.resultat IN ${INTERESSES_SQL})::int AS interesses,
            COUNT(a.id) FILTER (WHERE a.resultat = 'rdv obtenu')::int AS rdv,
            COUNT(a.id) FILTER (WHERE a.resultat = 'devis demande')::int AS propositions,
            COUNT(a.id) FILTER (WHERE a.resultat = 'vente')::int AS ventes
     FROM users u
     JOIN role r ON r.id = u.role_id AND r.nom = 'commercial'
     LEFT JOIN appel a ON a.user_id = u.id
                      AND a.date_heure >= $3 AND a.date_heure < $4
     WHERE u.entreprise_id = $1 AND u.id = ANY($2)
     GROUP BY u.id, u.nom, u.poste
     ORDER BY u.id`,
    [entrepriseId, userIds, debut, fin]
  );
  return rows;
};

// Quota de ventes de l'équipe pour la période (somme des objectifs)
exports.quotaVentes = async (userIds, periode) => {
  const { rows } = await query(
    `SELECT COALESCE(SUM(valeur_cible), 0)::int AS cible
     FROM objectif
     WHERE user_id = ANY($1) AND type = 'ventes' AND periode = $2`,
    [userIds, periode]
  );
  return rows[0].cible;
};

// Alertes sur l'état actuel des prospects (indépendantes de la période)
exports.alertesProspects = async (entrepriseId, userIds) => {
  const { rows } = await query(
    `SELECT
       COUNT(*) FILTER (WHERE statut NOT IN ('perdu', 'vendu')
         AND ("derniereInteraction" IS NULL
              OR "derniereInteraction" < now() - interval '5 days'))::int AS "sansRelance",
       COUNT(*) FILTER (WHERE statut = 'proposition'
         AND ("derniereInteraction" IS NULL
              OR "derniereInteraction" < now() - interval '7 days'))::int AS "propositionsEnAttente"
     FROM v_prospects_liste
     WHERE entreprise_id = $1 AND commercial_id = ANY($2)`,
    [entrepriseId, userIds]
  );
  return rows[0];
};