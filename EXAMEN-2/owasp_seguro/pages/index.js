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
          <span style={{color: '#00ff41'}}>✓</span> OWASP Demo Seguro
        </h1>
        <p style={{color: '#66ddff', fontSize: '14px', letterSpacing: '2px'}}>
          SISTEMA DE AUTENTICACIÓN PROTEGIDO
        </p>
      </div>

      <form onSubmit={submit} style={{background: 'rgba(0, 20, 10, 0.4)', padding: '30px', borderRadius: '8px', border: '1px solid rgba(0, 255, 65, 0.2)'}}>
        <div style={{marginBottom: '15px', color: '#00ff41', fontSize: '12px', textAlign: 'center'}}>
          <span style={{display: 'inline-block', padding: '5px 15px', background: 'rgba(0, 255, 65, 0.1)', borderRadius: '4px', border: '1px solid #00ff41'}}>
            � PROTEGIDO CONTRA SQL INJECTION
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

      <div style={{marginTop: '25px', padding: '15px', background: 'rgba(0, 255, 65, 0.1)', border: '1px solid rgba(0, 255, 65, 0.3)', borderRadius: '6px'}}>
        <p style={{margin: '0', fontSize: '12px', color: '#66ffaa', lineHeight: '1.6'}}>
          <strong>✓ SEGURIDAD:</strong> Esta aplicación está protegida contra SQL Injection mediante el uso de consultas parametrizadas. 
          Las credenciales son validadas de forma segura y las entradas son sanitizadas correctamente.
        </p>
      </div>
    </div>
  );
}
