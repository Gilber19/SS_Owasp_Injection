// CWE-79: Cross-Site Scripting (XSS)
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
    // Obtener todos los comentarios
    try {
      const { rows } = await db.query('SELECT * FROM comments ORDER BY created_at DESC');
      return res.json(rows);
    } catch (err) {
      console.error('Error al obtener comentarios:', err);
      return res.status(500).send('Error al obtener comentarios');
    }
  }

  if (req.method === 'POST') {
    const { comment } = req.body || {};
    
    if (!comment) {
      return res.status(400).send('Comentario requerido');
    }

    // VULNERABILIDAD CWE-79: XSS
    // Se guarda el comentario sin sanitizar y se mostrará sin escape en el frontend
    try {
      const result = await db.query(
        'INSERT INTO comments (user_id, username, comment, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [payload.id, payload.username, comment]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('Error al guardar comentario:', err);
      return res.status(500).send('Error al guardar comentario');
    }
  }

  return res.status(405).end();
}
