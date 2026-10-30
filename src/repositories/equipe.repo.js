const { query } = require('../config/db');

const CONTACTS = `('A rappeler','interesse','tres interesse','rdv obtenu',
                   'pas interesse','vente','devis demande')`;

// Une ligne par commercial visible
exports.listeCommerciaux = async (entrepriseId, userIds) => {
  const { rows } = await query(
    `SELECT u.id, u.nom, u.poste,
            COUNT(a.id)::int AS appels,
            COUNT(a.id) FILTER (WHERE a.resultat = 'rdv obtenu')::int AS rdv,
            COUNT(a.id) FILTER (WHERE a.resultat = 'vente')::int AS ventes,
            COALESCE(SUM(a.duree), 0)::int AS "tempsTotalSec"
     FROM users u
     JOIN role r ON r.id = u.role_id AND r.nom = 'commercial'
     LEFT JOIN appel a ON a.user_id = u.id
     WHERE u.entreprise_id = $1 AND u.id = ANY($2)
     GROUP BY u.id, u.nom, u.poste
     ORDER BY u.nom`,
    [entrepriseId, userIds]
  );
  return rows;
};

// Progression moyenne des objectifs, sur la semaine en cours
exports.objectifs = async (userIds) => {
  const { rows } = await query(
    `SELECT o.user_id,
            ROUND(100 * AVG(LEAST(1.0,
              CASE o.type WHEN 'appels' THEN c.appels
                          WHEN 'rdv'    THEN c.rdv
                          WHEN 'ventes' THEN c.ventes END::numeric
              / NULLIF(o.valeur_cible, 0))))::int AS pourcentage
     FROM objectif o
     JOIN LATERAL (
       SELECT COUNT(*) AS appels,
              COUNT(*) FILTER (WHERE resultat = 'rdv obtenu') AS rdv,
              COUNT(*) FILTER (WHERE resultat = 'vente') AS ventes
       FROM appel
       WHERE user_id = o.user_id AND date_heure >= date_trunc('week', now())
     ) c ON TRUE
     WHERE o.user_id = ANY($1)
     GROUP BY o.user_id`,
    [userIds]
  );
  return rows;
};

exports.profil = async (entrepriseId, id) => {
  const { rows } = await query(
    `SELECT u.id, u.nom, u.poste, u.email, u.telephone,
            (SELECT MAX(date_heure) FROM appel WHERE user_id = u.id) AS "derniereActivite"
     FROM users u
     WHERE u.entreprise_id = $1 AND u.id = $2`,
    [entrepriseId, id]
  );
  return rows[0];
};

exports.chiffres = async (id) => {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS appels,
            COUNT(*) FILTER (WHERE resultat IN ${CONTACTS})::int AS contacts,
            COUNT(*) FILTER (WHERE resultat = 'rdv obtenu')::int AS rdv,
            COUNT(*) FILTER (WHERE resultat = 'devis demande')::int AS propositions,
            COUNT(*) FILTER (WHERE resultat = 'vente')::int AS ventes,
            COALESCE(SUM(duree), 0)::int AS "tempsTotalSec"
     FROM appel WHERE user_id = $1`,
    [id]
  );
  return rows[0];
};

// 4 dernières semaines, y compris celles sans aucun appel
exports.evolution = async (id) => {
  const { rows } = await query(
    `SELECT s.semaine::date AS semaine,
            COUNT(a.id)::int AS appels,
            COUNT(a.id) FILTER (WHERE a.resultat = 'rdv obtenu')::int AS rdv,
            COUNT(a.id) FILTER (WHERE a.resultat = 'vente')::int AS ventes
     FROM generate_series(date_trunc('week', now()) - interval '3 weeks',
                          date_trunc('week', now()), interval '1 week') AS s(semaine)
     LEFT JOIN appel a ON a.user_id = $1
                      AND a.date_heure >= s.semaine
                      AND a.date_heure <  s.semaine + interval '1 week'
     GROUP BY s.semaine ORDER BY s.semaine`,
    [id]
  );
  return rows;
};

// Réutilise la vue des prospects
exports.prospectsARisque = async (entrepriseId, id) => {
  const { rows } = await query(
    `SELECT id, nom, entreprise, telephone, statut
     FROM v_prospects_liste
     WHERE entreprise_id = $1 AND commercial_id = $2
       AND statut IN ('proposition', 'a relancer')
       AND ("derniereInteraction" IS NULL
            OR "derniereInteraction" < now() - interval '5 days')
     ORDER BY "derniereInteraction" NULLS FIRST`,
    [entrepriseId, id]
  );
  return rows;
};