// CWE-73: External Control of File Name or Path (Path Traversal)
const fs = require('fs');
const path = require('path');
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
    const { file } = req.query;
    
    if (!file) {
      return res.status(400).send('Parámetro file requerido');
    }

    // VULNERABILIDAD CWE-73: Path Traversal
    // Se concatena directamente el input del usuario sin validación
    // Un atacante podría usar "../" para acceder a archivos fuera del directorio permitido
    const basePath = path.join(process.cwd(), 'public', 'files');
    const filePath = path.join(basePath, file);

    try {
      // No se verifica si el archivo está dentro del directorio permitido
      if (!fs.existsSync(filePath)) {
        return res.status(404).send('Archivo no encontrado');
      }

      const content = fs.readFileSync(filePath, 'utf8');
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${file}"`);
      return res.send(content);
    } catch (err) {
      console.error('Error al leer archivo:', err);
      return res.status(500).send('Error al leer archivo: ' + err.message);
    }
  }

  return res.status(405).end();
}
