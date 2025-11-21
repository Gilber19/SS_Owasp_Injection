// CWE-89: SQL Injection - Búsqueda vulnerable
const db = require('../../lib/db');
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
  try { 
    payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret'); 
  } catch (e) { 
    return res.status(401).send('Invalid token'); 
  }

  if (req.method === 'GET') {
    const { q } = req.query;
    
    if (!q) {
      return res.json([]);
    }

    // VULNERABILIDAD CWE-89: Inyección SQL
    // Concatenación directa del input del usuario en la consulta SQL
    const unsafeQuery = `SELECT id, username, role FROM users WHERE username LIKE '%${q}%' ORDER BY id`;
    
    try {
      const { rows } = await db.query(unsafeQuery);
      return res.json(rows);
    } catch (err) {
      console.error('Error en búsqueda:', err);
      return res.status(500).send('Error en búsqueda');
    }
  }

  return res.status(405).end();
}
