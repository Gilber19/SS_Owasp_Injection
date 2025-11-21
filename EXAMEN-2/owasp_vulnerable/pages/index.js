import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        const data = await res.json();
        // Guardamos token simple en localStorage para esta demo
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('role', data.user.role);
        
        // Disparar evento personalizado para actualizar el header
        window.dispatchEvent(new Event('userLogin'));
        
        router.push('/dashboard');
      } else {
        const err = await res.text();
        setError(err || 'Login failed');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div style={{textAlign: 'center', marginBottom: '30px'}}>
        <h1 style={{marginBottom: '10px'}}>
          <span style={{color: '#ff3366'}}>⚠</span> OWASP Demo
        </h1>
        <p style={{color: '#66ddff', fontSize: '14px', letterSpacing: '2px'}}>
          SISTEMA DE AUTENTICACIÓN VULNERABLE
        </p>
      </div>

      <form onSubmit={submit} style={{background: 'rgba(0, 20, 10, 0.4)', padding: '30px', borderRadius: '8px', border: '1px solid rgba(0, 255, 65, 0.2)'}}>
        <div style={{marginBottom: '15px', color: '#ffaa00', fontSize: '12px', textAlign: 'center'}}>
          <span style={{display: 'inline-block', padding: '5px 15px', background: 'rgba(255, 170, 0, 0.1)', borderRadius: '4px', border: '1px solid #ffaa00'}}>
            🔓 MODO DE PRUEBA DE SEGURIDAD
          </span>
        </div>

        <label>USUARIO</label>
        <input 
          value={username} 
          onChange={e=>setUsername(e.target.value)}
          placeholder="Ingrese su usuario"
          disabled={isLoading}
        />
        
        <label>CONTRASEÑA</label>
        <input 
          type="password" 
          value={password} 
          onChange={e=>setPassword(e.target.value)}
          placeholder="Ingrese su contraseña"
          disabled={isLoading}
        />
        
        <button type="submit" disabled={isLoading} style={{width: '100%', marginTop: '20px'}}>
          {isLoading ? '⟳ AUTENTICANDO...' : '► INICIAR SESIÓN'}
        </button>
      </form>

      {error && (
        <div className="error" style={{marginTop: '20px'}}>
          <strong>✖ ERROR:</strong> {error}
        </div>
      )}

      <hr />

      <div className="info-box">
        <p style={{margin: '0 0 10px 0', fontSize: '13px'}}>
          <strong>📋 CREDENCIALES DE PRUEBA:</strong>
        </p>
        <div style={{fontSize: '14px', fontFamily: 'Share Tech Mono, monospace'}}>
          <div style={{marginBottom: '8px'}}>
            <span style={{color: '#00ff41'}}>Admin:</span> <b>admin</b> / <b>adminpass</b>
          </div>
          <div>
            <span style={{color: '#00ff41'}}>Usuario:</span> <b>user</b> / <b>userpass</b>
          </div>
        </div>
      </div>

      <div style={{marginTop: '25px', padding: '15px', background: 'rgba(255, 0, 50, 0.1)', border: '1px solid rgba(255, 50, 100, 0.3)', borderRadius: '6px'}}>
        <p style={{margin: '0', fontSize: '12px', color: '#ff6688', lineHeight: '1.6'}}>
          <strong>⚠️ ADVERTENCIA:</strong> Esta aplicación contiene vulnerabilidades intencionales para fines educativos. 
          Incluye ejemplos de SQL Injection, IDOR, y Broken Access Control según OWASP Top 10.
        </p>
      </div>
    </div>
  );
}
