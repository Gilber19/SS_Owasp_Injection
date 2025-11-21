const db = require('../../lib/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).send('username and password required');

  // NO usar nunca concatenacion de strings con datos del cliente para construir SQL
  const unsafeQuery = `SELECT id, username, role FROM users WHERE username = '${username}' AND password = '${password}' LIMIT 1`;

  try {
    const { rows } = await db.query(unsafeQuery); 
    if (rows.length === 0) return res.status(401).send('Credenciales inválidas');
    const user = rows[0];
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'dev-secret');
    return res.json({ token, user });
  } catch (err) {
    console.error('Error de login', err);
    return res.status(500).send('Error del servidor');
  }
}
