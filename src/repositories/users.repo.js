const { query } = require('../config/db');

exports.findByEmail = async (email) => {
  const { rows } = await query(
    `SELECT u.id, u.nom, u.email, u.mot_de_passe, u.entreprise_id, r.nom AS role
     FROM users u
     JOIN role r ON r.id = u.role_id
     WHERE u.email = $1`,
    [email.toLowerCase().trim()]
  );
  return rows[0];
};

exports.findById = async (entrepriseId, id) => {
  const { rows } = await query(
    `SELECT u.id, u.nom, u.email, u.entreprise_id, r.nom AS role
     FROM users u
     JOIN role r ON r.id = u.role_id
     WHERE u.entreprise_id = $1 AND u.id = $2`,
    [entrepriseId, id]
  );
  return rows[0];
};

// managerId = null : tous les utilisateurs de l'entreprise (admin)
exports.findTeamIds = async (entrepriseId, managerId = null) => {
  const { rows } = managerId
    ? await query('SELECT id FROM users WHERE entreprise_id = $1 AND manager_id = $2',
        [entrepriseId, managerId])
    : await query('SELECT id FROM users WHERE entreprise_id = $1', [entrepriseId]);
  return rows.map((r) => r.id);
};