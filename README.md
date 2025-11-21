# OWASP SQL Injection Demonstration

This repository contains two educational projects demonstrating SQL injection vulnerabilities and how to prevent them.

## 📁 Projects

### 1. 🔓 Insecure Project
**Location:** `/insecure-project`

A deliberately vulnerable web application demonstrating common SQL injection vulnerabilities. This project shows:
- Authentication bypass through SQL injection
- Data extraction via UNION-based injection
- How attackers can exploit poor coding practices

⚠️ **WARNING:** This code is intentionally insecure for educational purposes only. Never use in production!

### 2. 🔒 Secure Project
**Location:** `/secure-project`

A properly secured web application demonstrating best practices for preventing SQL injection. This project shows:
- Parameterized queries (prepared statements)
- Input validation and sanitization
- Password hashing with bcrypt
- Secure error handling

✓ **SAFE:** This code demonstrates security best practices and can be used as a reference for production applications.

## 🎯 Purpose

This repository is designed for:
- **Learning**: Understand how SQL injection works and why it's dangerous
- **Education**: See real examples of vulnerable vs. secure code
- **Training**: Practice identifying and fixing security vulnerabilities
- **Comparison**: Side-by-side comparison of insecure and secure implementations

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Running the Insecure Project
```bash
cd insecure-project
npm install
npm run init-db
npm start
```
Then open http://localhost:3000

### Running the Secure Project
```bash
cd secure-project
npm install
npm run init-db
npm start
```
Then open http://localhost:3001

## 📚 What You'll Learn

### SQL Injection Attacks
1. **Authentication Bypass**: Login without knowing passwords
2. **Data Extraction**: Retrieve sensitive information from the database
3. **Query Manipulation**: Modify SQL queries to perform unintended actions

### Defense Techniques
1. **Parameterized Queries**: Using placeholders instead of string concatenation
2. **Input Validation**: Ensuring data meets expected formats
3. **Input Sanitization**: Removing dangerous characters
4. **Password Hashing**: Protecting passwords with bcrypt
5. **Error Handling**: Preventing information leakage

## 🔍 Comparison

| Aspect | Insecure Project | Secure Project |
|--------|-----------------|----------------|
| SQL Queries | String concatenation | Parameterized queries |
| Password Storage | Plain text | Bcrypt hashed |
| Input Validation | None | Strict validation |
| Error Messages | Detailed (leaks info) | Generic (safe) |
| Security Level | ❌ Vulnerable | ✅ Protected |
| Port | 3000 | 3001 |

## 🧪 Try It Yourself

Both projects include built-in examples of:
- Valid login credentials
- SQL injection payloads
- Search queries (both safe and malicious)

The insecure project will demonstrate how attacks work, while the secure project will show how proper defenses prevent them.

## 📖 Resources

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [OWASP Top 10 - Injection](https://owasp.org/Top10/A03_2021-Injection/)
- [SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

## ⚠️ Disclaimer

The insecure project is intentionally vulnerable and should **NEVER** be deployed to production or any environment accessible from the internet. It is strictly for educational purposes in controlled environments.

## 📝 License

MIT License - Feel free to use these projects for educational purposes.