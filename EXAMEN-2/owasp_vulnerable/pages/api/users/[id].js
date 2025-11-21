const db = require('../../../lib/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

function getTokenFromHeader(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  return h.slice(7);
}

export default async function handler(req, res) {
  const { id } = req.query;
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).send('Missing token');
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret'); } catch (e) { return res.status(401).send('Invalid token'); }

  // Solo admin puede cambiar roles
  if (payload.role !== 'admin') return res.status(403).send('Forbidden');

  if (req.method === 'PATCH') {
    const { role } = req.body || {};
    if (!role) return res.status(400).send('role required');
    await db.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
    return res.status(204).end();
  }

  return res.status(405).end();
}
