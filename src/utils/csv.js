const cellule = (v) => {
  let s = String(v ?? '');
  // Un texte qui commence par = + - @ serait exécuté comme formule par Excel
  if (typeof v === 'string' && /^[=+\-@]/.test(s)) s = "'" + s;
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Séparateur ; et BOM UTF-8 : Excel en français ouvre alors le fichier correctement
exports.toCsv = (lignes) =>
  '\uFEFF' + lignes.map((l) => l.map(cellule).join(';')).join('\r\n');