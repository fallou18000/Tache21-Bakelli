const CONTACTS = ['A rappeler', 'interesse', 'tres interesse', 'rdv obtenu',
                  'pas interesse', 'vente', 'devis demande'];
const INTERESSES = ['interesse', 'tres interesse', 'rdv obtenu', 'devis demande', 'vente'];

const liste = (a) => `(${a.map((r) => `'${r}'`).join(',')})`;

exports.CONTACTS_SQL = liste(CONTACTS);
exports.INTERESSES_SQL = liste(INTERESSES);