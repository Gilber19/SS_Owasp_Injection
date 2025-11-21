import '../styles.css';
import { useEffect, useState } from 'react';

function Header() {
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);

  const updateUserInfo = () => {
    const u = typeof window !== 'undefined' ? localStorage.getItem('username') : null;
    const r = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
    setUsername(u);
    setRole(r);
  };

  useEffect(() => {
    // client-only - cargar datos iniciales
    updateUserInfo();

    // Escuchar cambios en el localStorage
    const handleStorageChange = () => {
      updateUserInfo();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleStorageChange);
    window.addEventListener('userLogout', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleStorageChange);
      window.removeEventListener('userLogout', handleStorageChange);
    };
  }, []);

  function logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      window.dispatchEvent(new Event('userLogout'));
      window.location.href = '/';
    }
  }

  return (
    <header className="app-header">
      <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
        <div className="app-title">
          <span style={{color: '#ff3366'}}>⚠</span> OWASP SECURITY LAB
        </div>
        <div style={{fontSize: '11px', color: '#5599ff', letterSpacing: '1px', opacity: '0.7'}}>
          v1.0.0 | VULNERABLE MODE
        </div>
      </div>
      <div style={{display:'flex', alignItems:'center', gap: 15}}>
        {username ? (
          <>
            <div className="user-info">
              <span style={{opacity: 0.7, fontSize: '12px'}}>◆ Sesión activa:</span>{' '}
              <strong style={{color: '#00ff41', textShadow: '0 0 8px #00ff41'}}>{username}</strong>
              {role && (
                <span style={{
                  marginLeft: '10px',
                  padding: '3px 8px',
                  background: role === 'admin' ? 'rgba(255, 50, 50, 0.2)' : 'rgba(0, 200, 255, 0.2)',
                  border: role === 'admin' ? '1px solid #ff3333' : '1px solid #00ccff',
                  borderRadius: '3px',
                  color: role === 'admin' ? '#ff6666' : '#66ddff',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {role}
                </span>
              )}
            </div>
            <button className="logout-btn" onClick={logout}>
              ✖ Cerrar sesión
            </button>
          </>
        ) : (
          <div className="muted" style={{fontSize: '13px'}}>
            🔒 No autenticado
          </div>
        )}
      </div>
    </header>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <div>
      <Header />
      <main className="container">
        <Component {...pageProps} />
      </main>
      <footer style={{
        textAlign: 'center',
        padding: '30px 20px',
        color: '#5599ff',
        fontSize: '12px',
        opacity: '0.6',
        letterSpacing: '1px'
      }}>
        <div style={{marginBottom: '8px'}}>
          OWASP Vulnerable Demo | Desarrollado con fines educativos
        </div>
        <div style={{fontSize: '11px', color: '#66ff99'}}>
          ⚠️ No usar en producción - Contiene vulnerabilidades intencionales
        </div>
      </footer>
    </div>
  );
}
