# Insecure Project - SQL Injection Demonstration

⚠️ **WARNING: This project is intentionally vulnerable!** ⚠️

This project demonstrates common SQL injection vulnerabilities for educational purposes. **DO NOT use this code in production!**

## About

This is a simple Node.js web application that demonstrates OWASP SQL Injection vulnerabilities. The application includes:
- A vulnerable login system
- A vulnerable product search feature
- Examples of SQL injection attacks

## Vulnerabilities

### 1. SQL Injection in Login (Authentication Bypass)

The login endpoint uses direct string concatenation to build SQL queries:

```javascript
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
```

**Attack Examples:**
- Username: `admin' OR '1'='1` Password: `anything`
- Username: `' OR '1'='1' --` Password: `anything`

These attacks bypass authentication by manipulating the SQL query logic.

### 2. SQL Injection in Search (Data Extraction)

The search endpoint is also vulnerable:

```javascript
const query = `SELECT * FROM products WHERE name LIKE '%${searchQuery}%'`;
```

**Attack Examples:**
- Search: `' UNION SELECT username, password, email, role FROM users --`
- Search: `' OR '1'='1`

These attacks can extract sensitive data from other tables.

### 3. Cross-Site Scripting (XSS)

User data is displayed directly in HTML without escaping, creating XSS vulnerabilities:

```javascript
res.send(`<p>Welcome, ${row.username}!</p>`);
```

**Why this is dangerous:**
- Malicious JavaScript could be injected through database content
- Attackers could steal session cookies or perform actions as the victim
- This compounds with SQL injection - attacker can inject both SQL and JavaScript

## Setup

1. Install dependencies:
```bash
npm install
```

2. Initialize the database:
```bash
npm run init-db
```

3. Start the server:
```bash
npm start
```

4. Open your browser to `http://localhost:3000`

## Testing the Vulnerabilities

### Valid Credentials (for normal testing):
- admin / admin123
- john / john123
- alice / alice123

### SQL Injection Payloads:

**Login Bypass:**
1. Try: `admin' OR '1'='1` as username (any password)
2. Try: `' OR '1'='1' --` as username (any password)

**Data Extraction via Search:**
1. Try: `' UNION SELECT username, password, email, role FROM users --`
2. Try: `' OR '1'='1`

## Why This Is Dangerous

1. **Authentication Bypass**: Attackers can log in as any user without knowing passwords
2. **Data Theft**: Sensitive information (passwords, emails) can be extracted
3. **Data Manipulation**: Attackers could modify or delete data
4. **Privilege Escalation**: Normal users could gain admin access
5. **Cross-Site Scripting**: Malicious scripts can be injected and executed in victim browsers
6. **Session Hijacking**: XSS can be used to steal authentication tokens/cookies

## How to Fix

See the `secure-project` directory for a properly secured version that uses:
- Parameterized queries (prepared statements)
- HTML output escaping to prevent XSS
- Input validation and sanitization
- Proper error handling
- Password hashing with bcrypt
- Security best practices

## Learning Resources

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [OWASP Top 10 - Injection](https://owasp.org/Top10/A03_2021-Injection/)
