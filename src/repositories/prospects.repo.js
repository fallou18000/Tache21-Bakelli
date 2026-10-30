const { query } = require('../config/db');

exports.list = async (entrepriseId, userIds) => {
  const { rows } = await query(
    `SELECT id, nom, telephone, entreprise, ville, statut,
            "commercialAssigne", "derniereInteraction", "typeInteraction",
            "prochaineAction", "dateProchaineAction"
     FROM v_prospects_liste
     WHERE entreprise_id = $1 AND commercial_id = ANY($2)
     ORDER BY id DESC`,
    [entrepriseId, userIds]
  );
  return rows;
};