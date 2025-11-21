const fs = require('fs');
const path = require('path');
require('dotenv').config();
const db = require('../lib/db');

(async () => {
  try {
    const sqlPath = path.join(__dirname, '..', 'db', 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await db.pool.query(sql);
    console.log('Migración aplicada correctamente.');
    process.exit(0);
  } catch (err) {
    console.error('Fallo al aplicar migración:', err);
    process.exit(1);
  }
})();
