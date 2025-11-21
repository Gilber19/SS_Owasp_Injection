const db = require('../../lib/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).send('username and password required');

  // WARNING: La versión previa construía la consulta por concatenación, lo cual
  // es vulnerable a SQL Injection. A continuación se aplica la contramedida:
  // FIX: Usar consulta parametrizada para evitar SQL injection.
  const safeQuery = 'SELECT id, username, role FROM users WHERE username = $1 AND password = $2 LIMIT 1';

  try {
    // Ejecutar la consulta con parámetros en lugar de concatenar el input del usuario.
    const result = await db.query(safeQuery, [username, password]);
    const rows = result.rows;
    if (rows.length === 0) return res.status(401).send('Credenciales inválidas');
    const user = rows[0];
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'dev-secret');
    return res.json({ token, user });
  } catch (err) {
    console.error('Error de login', err);
    return res.status(500).send('Error del servidor');
  }
}
