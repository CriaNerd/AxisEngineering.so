const crypto = require('crypto');

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error('Uso: node scripts/generate-admin-password-hash.js "SuaSenhaForteCom12+Caracteres"');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
console.log(`${salt}:${hash}`);
