// CWE-89: SQL Injection - Búsqueda SEGURA
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

    // MITIGACIÓN CWE-89: Usar consultas parametrizadas
    // El input del usuario se pasa como parámetro, no se concatena en la consulta
    const safeQuery = 'SELECT id, username, role FROM users WHERE username LIKE $1 ORDER BY id';
    
    try {
      // Usar parámetros preparados previene la inyección SQL
      const { rows } = await db.query(safeQuery, [`%${q}%`]);
      return res.json(rows);
    } catch (err) {
      console.error('Error en búsqueda:', err);
      return res.status(500).send('Error en búsqueda');
    }
  }

  return res.status(405).end();
}
