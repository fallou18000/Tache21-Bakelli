require('dotenv').config();

const required = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'JWT_SECRET', 'WEB_URL'];
const missing = required.filter((k) => !process.env[k]);

if (missing.length) {
  console.error('Variables manquantes dans .env :', missing.join(', '));
  process.exit(1);
}

module.exports = {
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: Number(process.env.DB_PORT),
  DB_NAME: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
  WEB_URL: process.env.WEB_URL,
  IS_PROD: process.env.NODE_ENV === 'production',
};