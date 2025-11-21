// CWE-73: External Control of File Name or Path - SEGURO
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

function getTokenFromHeader(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  return h.slice(7);
}

// MITIGACIÓN CWE-73: Whitelist de archivos permitidos
const ALLOWED_FILES = [
  'document1.txt',
  'document2.txt',
  'report.txt',
  'manual.txt'
];

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

    // MITIGACIÓN CWE-73: Validar contra whitelist
    if (!ALLOWED_FILES.includes(file)) {
      return res.status(403).send('Acceso al archivo no permitido');
    }

    // MITIGACIÓN CWE-73: Validar que no contenga secuencias peligrosas
    if (file.includes('..') || file.includes('/') || file.includes('\\')) {
      return res.status(400).send('Nombre de archivo inválido');
    }

    // MITIGACIÓN CWE-73: Usar path.basename para extraer solo el nombre del archivo
    const safeName = path.basename(file);
    const basePath = path.join(process.cwd(), 'public', 'files');
    const filePath = path.join(basePath, safeName);

    // MITIGACIÓN CWE-73: Verificar que el path resuelto esté dentro del directorio permitido
    const resolvedPath = path.resolve(filePath);
    const resolvedBase = path.resolve(basePath);
    
    if (!resolvedPath.startsWith(resolvedBase)) {
      return res.status(403).send('Acceso denegado: path traversal detectado');
    }

    try {
      if (!fs.existsSync(filePath)) {
        return res.status(404).send('Archivo no encontrado');
      }

      const content = fs.readFileSync(filePath, 'utf8');
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
      return res.send(content);
    } catch (err) {
      console.error('Error al leer archivo:', err);
      return res.status(500).send('Error al leer archivo');
    }
  }

  return res.status(405).end();
}
