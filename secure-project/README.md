# Secure Project - SQL Injection Prevention

✓ **This project demonstrates secure coding practices!** ✓

This project shows how to properly prevent SQL injection vulnerabilities using security best practices.

## About

This is a secure Node.js web application that demonstrates how to prevent OWASP SQL Injection vulnerabilities. The application includes:
- A secure login system with parameterized queries
- A secure product search feature with input validation
- Password hashing using bcrypt
- Proper error handling

## Security Features

### 1. Parameterized Queries (Prepared Statements)

Instead of string concatenation, we use parameterized queries:

```javascript
// INSECURE (from insecure-project):
const query = `SELECT * FROM users WHERE username = '${username}'`;

// SECURE (this project):
const query = 'SELECT * FROM users WHERE username = ?';
db.get(query, [username], callback);
```

**Why this works:**
- The `?` placeholder separates SQL code from data
- The database driver handles escaping automatically
- User input is treated as data, never as SQL code

### 2. Input Validation

We validate all user inputs before processing:

```javascript
function validateUsername(username) {
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(username);
}
```

**Benefits:**
- Rejects invalid or malicious input early
- Enforces expected data formats
- Reduces attack surface

### 3. Input Sanitization

For search queries, we sanitize input:

```javascript
function sanitizeSearchInput(input) {
  return input.replace(/['"`;\\]/g, '').substring(0, 50);
}
```

**Purpose:**
- Removes potentially dangerous characters
- Limits input length to prevent buffer issues
- Additional defense layer (defense in depth)

### 4. Password Hashing

Passwords are hashed using bcrypt:

```javascript
bcrypt.hash(password, saltRounds, callback);
bcrypt.compare(plainPassword, hashedPassword, callback);
```

**Benefits:**
- Passwords never stored in plain text
- Even if database is compromised, passwords remain protected
- Bcrypt is designed to be slow, preventing brute-force attacks

### 5. Generic Error Messages

We don't reveal system details in error messages:

```javascript
// Don't expose SQL errors to users
res.status(500).send('An error occurred. Please try again later.');
```

**Why this matters:**
- Prevents information leakage
- Attackers can't learn about database structure
- Professional user experience

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

4. Open your browser to `http://localhost:3001`

## Testing the Security

### Valid Credentials:
- admin / admin123
- john / john123
- alice / alice123

### Try SQL Injection (They Won't Work!):

**Login Attempts:**
1. Try: `admin' OR '1'='1` as username → Blocked by validation
2. Try: `' OR '1'='1' --` as username → Blocked by validation

**Search Attempts:**
1. Try: `' UNION SELECT * FROM users --` → Sanitized and parameterized
2. Try: `' OR '1'='1` → Sanitized and parameterized

All these attempts will be safely handled without compromising security.

## Key Takeaways

### Always Use:
1. **Parameterized Queries** - Primary defense against SQL injection
2. **Input Validation** - Verify data meets expected format
3. **Input Sanitization** - Remove dangerous characters
4. **Password Hashing** - Never store plain text passwords
5. **Error Handling** - Don't leak system information

### Never Do:
1. ❌ String concatenation for SQL queries
2. ❌ Trust user input without validation
3. ❌ Store passwords in plain text
4. ❌ Expose detailed error messages to users
5. ❌ Run database queries with elevated privileges

## Comparison with Insecure Project

| Feature | Insecure Project | Secure Project |
|---------|-----------------|----------------|
| SQL Queries | String concatenation | Parameterized queries |
| Passwords | Plain text | Bcrypt hashed |
| Input Validation | None | Strict validation |
| Error Messages | Detailed | Generic |
| SQL Injection Risk | **HIGH** | **NONE** |

## Learning Resources

- [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [OWASP Top 10 - Injection](https://owasp.org/Top10/A03_2021-Injection/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)

## Additional Security Recommendations

For production applications, also consider:
- Using an ORM (like Sequelize or TypeORM) with built-in protections
- Implementing rate limiting to prevent brute force attacks
- Adding CSRF protection
- Using HTTPS for all communications
- Implementing session management securely
- Regular security audits and dependency updates
- Web Application Firewall (WAF)
- Principle of least privilege for database access
