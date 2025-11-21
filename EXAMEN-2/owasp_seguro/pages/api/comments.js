// CWE-79: Cross-Site Scripting (XSS) - SEGURO
const db = require('../../lib/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Función para sanitizar HTML y prevenir XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  };
  return text.replace(/[&<>"'/]/g, (m) => map[m]);
}

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
      
      // MITIGACIÓN CWE-79: Sanitizar el output antes de enviarlo
      const sanitizedRows = rows.map(row => ({
        ...row,
        comment: escapeHtml(row.comment),
        username: escapeHtml(row.username)
      }));
      
      return res.json(sanitizedRows);
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

    // MITIGACIÓN CWE-79: Sanitizar el input antes de guardarlo
    const sanitizedComment = escapeHtml(comment.trim());
    
    // Validación adicional: limitar longitud
    if (sanitizedComment.length > 1000) {
      return res.status(400).send('Comentario demasiado largo');
    }

    try {
      const result = await db.query(
        'INSERT INTO comments (user_id, username, comment, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [payload.id, payload.username, sanitizedComment]
      );
      
      // Sanitizar también el resultado antes de devolverlo
      const sanitizedResult = {
        ...result.rows[0],
        comment: escapeHtml(result.rows[0].comment),
        username: escapeHtml(result.rows[0].username)
      };
      
      return res.json(sanitizedResult);
    } catch (err) {
      console.error('Error al guardar comentario:', err);
      return res.status(500).send('Error al guardar comentario');
    }
  }

  return res.status(405).end();
}
