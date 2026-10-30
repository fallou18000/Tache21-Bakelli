const CLES = ['semaine', 'mois', 'mois_precedent', 'trimestre'];

const jour = (d, k) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + k);

function bornes(cle) {
  const n = new Date();
  const y = n.getFullYear();
  const m = n.getMonth();
  const auj = jour(n, 0);
  const lundi = jour(auj, -((auj.getDay() + 6) % 7));
  let debut, fin, debutPrec;

  if (cle === 'semaine') {
    debut = lundi;
    fin = jour(lundi, 7);
    debutPrec = jour(lundi, -7);
  } else if (cle === 'trimestre') {
    const t = Math.floor(m / 3) * 3;
    debut = new Date(y, t, 1);
    fin = new Date(y, t + 3, 1);
    debutPrec = new Date(y, t - 3, 1);
  } else if (cle === 'mois_precedent') {
    debut = new Date(y, m - 1, 1);
    fin = new Date(y, m, 1);
    debutPrec = new Date(y, m - 2, 1);
  } else {                                   // mois
    debut = new Date(y, m, 1);
    fin = new Date(y, m + 1, 1);
    debutPrec = new Date(y, m - 1, 1);
  }
  return { debut, fin, debutPrec, finPrec: debut };
}

module.exports = { CLES, bornes };