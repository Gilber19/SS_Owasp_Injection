const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
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

  // Insert sample users with hashed passwords
  db.run(`DELETE FROM users`);
  
  const saltRounds = 10;
  const users = [
    { username: 'admin', password: 'admin123', email: 'admin@example.com', role: 'admin' },
    { username: 'john', password: 'john123', email: 'john@example.com', role: 'user' },
    { username: 'alice', password: 'alice123', email: 'alice@example.com', role: 'user' },
    { username: 'bob', password: 'bob123', email: 'bob@example.com', role: 'user' }
  ];

  const stmt = db.prepare('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)');
  
  let completed = 0;
  users.forEach(user => {
    bcrypt.hash(user.password, saltRounds, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        return;
      }
      stmt.run(user.username, hash, user.email, user.role);
      completed++;
      if (completed === users.length) {
        stmt.finalize();
        console.log('Users inserted with hashed passwords');
      }
    });
  });

  // Insert sample products
  db.run(`DELETE FROM products`);
  db.run(`INSERT INTO products (name, description, price) VALUES 
    ('Laptop', 'High-performance laptop', 999.99),
    ('Mouse', 'Wireless mouse', 29.99),
    ('Keyboard', 'Mechanical keyboard', 79.99),
    ('Monitor', '27-inch 4K monitor', 399.99),
    ('Headphones', 'Noise-cancelling headphones', 149.99)`, () => {
    console.log('Database initialized successfully!');
  });
});

setTimeout(() => {
  db.close();
}, 2000);
