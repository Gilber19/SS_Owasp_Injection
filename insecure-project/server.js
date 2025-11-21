/*
 * ================================================================================================
 * ⚠️⚠️⚠️ WARNING: INTENTIONALLY VULNERABLE CODE - FOR EDUCATIONAL PURPOSES ONLY ⚠️⚠️⚠️
 * ================================================================================================
 * 
 * This file contains INTENTIONALLY INSECURE code to demonstrate OWASP injection vulnerabilities.
 * 
 * NEVER USE THIS CODE IN PRODUCTION OR COPY IT TO REAL APPLICATIONS
 * 
 * This code is vulnerable to:
 * - SQL Injection (OWASP A03:2021)
 * - Cross-Site Scripting (XSS)
 * - Information Disclosure
 * 
 * For secure implementations, see the secure-project directory.
 * ================================================================================================
 */

const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;
const db = new sqlite3.Database('./database.db');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve a simple HTML page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Insecure Login System - VULNERABLE</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .warning { background: #ffcccc; padding: 15px; border: 2px solid #ff0000; margin-bottom: 20px; }
        .form-group { margin-bottom: 15px; }
        input { padding: 8px; width: 300px; }
        button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
        button:hover { background: #0056b3; }
        .example { background: #f0f0f0; padding: 10px; margin: 10px 0; font-family: monospace; }
        h2 { color: #333; }
      </style>
    </head>
    <body>
      <div class="warning">
        <strong>⚠️ WARNING: This is an INSECURE demonstration!</strong><br>
        This application is intentionally vulnerable to SQL Injection attacks for educational purposes.
        Never use this code in production!
      </div>

      <h1>Vulnerable Login System</h1>
      
      <h2>Login Form</h2>
      <form action="/login" method="POST">
        <div class="form-group">
          <label>Username:</label><br>
          <input type="text" name="username" required>
        </div>
        <div class="form-group">
          <label>Password:</label><br>
          <input type="password" name="password" required>
        </div>
        <button type="submit">Login</button>
      </form>

      <h2>Product Search</h2>
      <form action="/search" method="GET">
        <div class="form-group">
          <label>Search products:</label><br>
          <input type="text" name="query" placeholder="Enter product name">
        </div>
        <button type="submit">Search</button>
      </form>

      <h2>SQL Injection Examples</h2>
      <p>Try these payloads to exploit the vulnerabilities:</p>
      
      <h3>Login Bypass:</h3>
      <div class="example">Username: admin' OR '1'='1<br>Password: anything</div>
      <div class="example">Username: ' OR '1'='1' --<br>Password: anything</div>
      
      <h3>Data Extraction (Search):</h3>
      <div class="example">Search: ' UNION SELECT username, password, email, role FROM users --</div>
      <div class="example">Search: ' OR '1'='1</div>

      <h2>Valid Credentials (for testing):</h2>
      <ul>
        <li>admin / admin123</li>
        <li>john / john123</li>
        <li>alice / alice123</li>
      </ul>
    </body>
    </html>
  `);
});

// VULNERABLE: SQL Injection in login endpoint
// ⚠️ WARNING: THIS CODE IS INTENTIONALLY INSECURE FOR EDUCATIONAL PURPOSES
// ⚠️ NEVER USE THIS PATTERN IN PRODUCTION CODE
// ⚠️ This demonstrates OWASP A03:2021 - Injection vulnerability
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // INSECURE: Direct string concatenation - vulnerable to SQL injection
  // DO NOT COPY THIS CODE - This is vulnerable by design
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  console.log('Executing query:', query);

  db.get(query, (err, row) => {
    if (err) {
      res.status(500).send(`
        <h2>Database Error</h2>
        <p>${err.message}</p>
        <a href="/">Go Back</a>
      `);
      return;
    }

    if (row) {
      res.send(`
        <h2>Login Successful! ✓</h2>
        <p>Welcome, ${row.username}!</p>
        <p>Email: ${row.email}</p>
        <p>Role: ${row.role}</p>
        <p><strong>Query executed:</strong> <code>${query}</code></p>
        <a href="/">Go Back</a>
      `);
    } else {
      res.send(`
        <h2>Login Failed ✗</h2>
        <p>Invalid username or password</p>
        <p><strong>Query executed:</strong> <code>${query}</code></p>
        <a href="/">Go Back</a>
      `);
    }
  });
});

// VULNERABLE: SQL Injection in search endpoint
// ⚠️ WARNING: THIS CODE IS INTENTIONALLY INSECURE FOR EDUCATIONAL PURPOSES
// ⚠️ NEVER USE THIS PATTERN IN PRODUCTION CODE
// ⚠️ This demonstrates OWASP A03:2021 - Injection vulnerability
app.get('/search', (req, res) => {
  const searchQuery = req.query.query || '';

  // INSECURE: Direct string concatenation - vulnerable to SQL injection
  // DO NOT COPY THIS CODE - This is vulnerable by design
  const query = `SELECT * FROM products WHERE name LIKE '%${searchQuery}%'`;
  
  console.log('Executing query:', query);

  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).send(`
        <h2>Database Error</h2>
        <p>${err.message}</p>
        <p><strong>Query executed:</strong> <code>${query}</code></p>
        <a href="/">Go Back</a>
      `);
      return;
    }

    let results = '<h2>Search Results</h2>';
    results += `<p><strong>Query executed:</strong> <code>${query}</code></p>`;
    
    if (rows.length > 0) {
      results += '<ul>';
      rows.forEach(row => {
        results += `<li><strong>${row.name || row[Object.keys(row)[0]]}</strong> - `;
        results += Object.entries(row).map(([key, val]) => `${key}: ${val}`).join(', ');
        results += '</li>';
      });
      results += '</ul>';
    } else {
      results += '<p>No results found</p>';
    }
    
    results += '<a href="/">Go Back</a>';
    res.send(results);
  });
});

app.listen(port, () => {
  console.log(`Insecure server running at http://localhost:${port}`);
  console.log('⚠️  WARNING: This server is intentionally vulnerable to SQL injection!');
});
