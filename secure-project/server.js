const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const app = express();
const port = 3001;
const db = new sqlite3.Database('./database.db');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Input validation helper functions
function validateUsername(username) {
  // Allow only alphanumeric characters and underscores, 3-20 characters
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(username);
}

function sanitizeSearchInput(input) {
  // Remove special SQL characters and limit length
  return input.replace(/['"`;\\]/g, '').substring(0, 50);
}

// Serve a simple HTML page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Secure Login System - PROTECTED</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .success { background: #ccffcc; padding: 15px; border: 2px solid #00cc00; margin-bottom: 20px; }
        .form-group { margin-bottom: 15px; }
        input { padding: 8px; width: 300px; }
        button { padding: 10px 20px; background: #28a745; color: white; border: none; cursor: pointer; }
        button:hover { background: #218838; }
        .info { background: #e7f3ff; padding: 10px; margin: 10px 0; border-left: 4px solid #2196F3; }
        h2 { color: #333; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
      </style>
    </head>
    <body>
      <div class="success">
        <strong>✓ SECURE: This application is protected against SQL Injection!</strong><br>
        This demonstrates proper security practices for preventing injection attacks.
      </div>

      <h1>Secure Login System</h1>
      
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

      <h2>Security Features</h2>
      <div class="info">
        <strong>Parameterized Queries:</strong> Uses prepared statements with placeholders (?) to prevent SQL injection
      </div>
      <div class="info">
        <strong>Input Validation:</strong> Validates and sanitizes all user inputs
      </div>
      <div class="info">
        <strong>Password Hashing:</strong> Uses bcrypt to hash passwords (not stored in plain text)
      </div>
      <div class="info">
        <strong>Error Handling:</strong> Generic error messages that don't reveal system details
      </div>

      <h2>Try These (They Won't Work!):</h2>
      <p>These SQL injection attempts will be blocked:</p>
      <ul>
        <li><code>admin' OR '1'='1</code> - Parameterized queries prevent this</li>
        <li><code>' OR '1'='1' --</code> - Input validation blocks special characters</li>
        <li><code>' UNION SELECT * FROM users --</code> - Sanitization removes dangerous input</li>
      </ul>

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

// SECURE: SQL Injection protected login endpoint
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Input validation
  if (!username || !password) {
    res.status(400).send(`
      <h2>Login Failed ✗</h2>
      <p>Username and password are required</p>
      <a href="/">Go Back</a>
    `);
    return;
  }

  if (!validateUsername(username)) {
    res.status(400).send(`
      <h2>Login Failed ✗</h2>
      <p>Invalid username format</p>
      <a href="/">Go Back</a>
    `);
    return;
  }

  // SECURE: Use parameterized query with placeholders
  const query = 'SELECT * FROM users WHERE username = ?';
  
  console.log('Executing secure query with parameterized statement');

  db.get(query, [username], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).send(`
        <h2>An error occurred</h2>
        <p>Please try again later</p>
        <a href="/">Go Back</a>
      `);
      return;
    }

    if (row) {
      // SECURE: Use bcrypt to compare hashed passwords
      bcrypt.compare(password, row.password, (err, result) => {
        if (err) {
          console.error('Password comparison error:', err);
          res.status(500).send(`
            <h2>An error occurred</h2>
            <p>Please try again later</p>
            <a href="/">Go Back</a>
          `);
          return;
        }

        if (result) {
          res.send(`
            <h2>Login Successful! ✓</h2>
            <p>Welcome, ${row.username}!</p>
            <p>Email: ${row.email}</p>
            <p>Role: ${row.role}</p>
            <div class="info">
              <strong>Security Note:</strong> This login used parameterized queries 
              and bcrypt password hashing to prevent SQL injection and protect passwords.
            </div>
            <a href="/">Go Back</a>
          `);
        } else {
          res.send(`
            <h2>Login Failed ✗</h2>
            <p>Invalid credentials</p>
            <a href="/">Go Back</a>
          `);
        }
      });
    } else {
      res.send(`
        <h2>Login Failed ✗</h2>
        <p>Invalid credentials</p>
        <a href="/">Go Back</a>
      `);
    }
  });
});

// SECURE: SQL Injection protected search endpoint
app.get('/search', (req, res) => {
  let searchQuery = req.query.query || '';

  // Input sanitization
  searchQuery = sanitizeSearchInput(searchQuery);

  // SECURE: Use parameterized query with placeholders
  const query = 'SELECT * FROM products WHERE name LIKE ?';
  const param = `%${searchQuery}%`;
  
  console.log('Executing secure search query with parameterized statement');

  db.all(query, [param], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).send(`
        <h2>An error occurred</h2>
        <p>Please try again later</p>
        <a href="/">Go Back</a>
      `);
      return;
    }

    let results = '<h2>Search Results</h2>';
    results += '<div class="info"><strong>Security Note:</strong> This search uses parameterized queries to prevent SQL injection</div>';
    
    if (rows.length > 0) {
      results += '<ul>';
      rows.forEach(row => {
        results += `<li><strong>${row.name}</strong> - ${row.description} - $${row.price}</li>`;
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
  console.log(`Secure server running at http://localhost:${port}`);
  console.log('✓ This server is protected against SQL injection attacks');
});
