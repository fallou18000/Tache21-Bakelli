const { query } = require('../config/db');

const COLONNES = `id, nom, devise, exclusion_contacts_prives AS "exclusionContactsPrives"`;

exports.lire = async (entrepriseId) => {
  const { rows } = await query(`SELECT ${COLONNES} FROM entreprise WHERE id = $1`, [entrepriseId]);
  return rows[0];
};

exports.modifier = async (entrepriseId, nom, devise, exclusion) => {
  const { rows } = await query(
    `UPDATE entreprise
     SET nom = $2, devise = $3, exclusion_contacts_prives = $4
     WHERE id = $1
     RETURNING ${COLONNES}`,
    [entrepriseId, nom, devise, exclusion]
  );
  return rows[0];
};