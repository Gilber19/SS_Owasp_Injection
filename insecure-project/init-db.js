const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL
  )`);

  // Create products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL
  )`);

  // Insert sample users
  db.run(`DELETE FROM users`);
  db.run(`INSERT INTO users (username, password, email, role) VALUES 
    ('admin', 'admin123', 'admin@example.com', 'admin'),
    ('john', 'john123', 'john@example.com', 'user'),
    ('alice', 'alice123', 'alice@example.com', 'user'),
    ('bob', 'bob123', 'bob@example.com', 'user')`);

  // Insert sample products
  db.run(`DELETE FROM products`);
  db.run(`INSERT INTO products (name, description, price) VALUES 
    ('Laptop', 'High-performance laptop', 999.99),
    ('Mouse', 'Wireless mouse', 29.99),
    ('Keyboard', 'Mechanical keyboard', 79.99),
    ('Monitor', '27-inch 4K monitor', 399.99),
    ('Headphones', 'Noise-cancelling headphones', 149.99)`);

  console.log('Database initialized successfully!');
});

db.close();
