const db = require('../../../lib/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

function getTokenFromHeader(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  return h.slice(7);
}

export default async function handler(req, res) {
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).send('Missing token');
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret'); } catch (e) { return res.status(401).send('Invalid token'); }

  if (req.method === 'GET') {
    // Solo admin puede obtener la lista completa
    if (payload.role !== 'admin') return res.status(403).send('Forbidden');
    const { rows } = await db.query('SELECT id, username, role FROM users ORDER BY id');
    return res.json(rows);
  }

  return res.status(405).end();
}
