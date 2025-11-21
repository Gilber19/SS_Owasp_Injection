-- Esquema simple para la demo. Contraseñas en texto plano intencionalmente para la clase.
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL
);

-- Tabla de comentarios para demostrar XSS
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  username TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users de ejemplo
INSERT INTO users (username, password, role) VALUES
  ('admin', 'adminpass', 'admin'),
  ('user', 'userpass', 'user')
ON CONFLICT (username) DO NOTHING;
