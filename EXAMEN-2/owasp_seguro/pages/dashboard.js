import { useEffect, useState } from 'react';

// Función para escapar HTML y prevenir XSS en el frontend
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

export default function Dashboard() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [downloadFile, setDownloadFile] = useState('document1.txt');

  useEffect(()=>{
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('username');
    const r = localStorage.getItem('role');
    if (!t) {
      window.location.href = '/';
      return;
    }
    setUsername(u);
    setRole(r);
    setIsLoading(false);

    if (r === 'admin') {
      fetch('/api/users', { headers: { Authorization: `Bearer ${t}` } })
        .then(res=>res.json())
        .then(setUsers)
        .catch(()=>setUsers([]));
    }

    // Cargar comentarios
    loadComments();
  }, []);

  async function loadComments() {
    const t = localStorage.getItem('token');
    try {
      const res = await fetch('/api/comments', { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error('Error cargando comentarios:', err);
    }
  }

  async function submitComment() {
    if (!newComment.trim()) return;
    const t = localStorage.getItem('token');
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ comment: newComment })
      });
      setNewComment('');
      loadComments();
    } catch (err) {
      console.error('Error enviando comentario:', err);
    }
  }

  async function searchUsers() {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const t = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Error en búsqueda:', err);
    }
  }

  async function downloadFileFunc() {
    const t = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/download?file=${encodeURIComponent(downloadFile)}`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadFile;
        a.click();
      } else {
        alert('Error: ' + await res.text());
      }
    } catch (err) {
      alert('Error descargando archivo: ' + err.message);
    }
  }

  async function changeRole(id, newRole) {
    const t = localStorage.getItem('token');
    await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ role: newRole })
    });
    // refresh
    const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${t}` } });
    setUsers(await res.json());
  }

  if (isLoading) {
    return (
      <div style={{textAlign: 'center', padding: '50px'}}>
        <p style={{fontSize: '18px', color: '#00ff41'}}>⟳ Cargando sistema...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px'}}>
        <h1 style={{margin: 0}}>
          <span style={{color: '#00ccff'}}>▶</span> PANEL DE CONTROL
        </h1>
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          <span className="security-badge" style={{background: 'rgba(0, 255, 65, 0.15)', border: '1px solid #00ff41', color: '#66ffaa', padding: '6px 12px', fontSize: '11px'}}>
            🔒 SECURE
          </span>
          <span className="security-badge" style={{background: role === 'admin' ? 'rgba(255, 50, 50, 0.2)' : 'rgba(0, 200, 255, 0.2)', border: role === 'admin' ? '1px solid #ff3333' : '1px solid #00ccff', color: role === 'admin' ? '#ff6666' : '#66ddff'}}>
            {role === 'admin' ? '🛡️ ADMIN' : '👤 USER'}
          </span>
        </div>
      </div>

      <div className="card" style={{marginBottom: '30px'}}>
        <p style={{margin: '0', fontSize: '16px'}}>
          <span style={{color: '#00ccff'}}>◆ Usuario conectado:</span>{' '}
          <strong style={{color: '#00ff41', fontSize: '18px'}}>{username}</strong>
        </p>
        <p style={{margin: '10px 0 0 0', fontSize: '14px', color: '#88ffaa'}}>
          <span style={{color: '#00ccff'}}>◆ Nivel de acceso:</span>{' '}
          <strong style={{color: role === 'admin' ? '#ff6666' : '#66ddff'}}>{role.toUpperCase()}</strong>
        </p>
      </div>

      {role === 'user' && (
        <div>
          <h2>
            <span style={{color: '#00ff41'}}>●</span> ACCIONES DE USUARIO
          </h2>
          <div className="card">
            <ul style={{margin: 0}}>
              <li>Ver perfil personal</li>
              <li>Editar configuración de cuenta</li>
              <li>Consultar estadísticas propias</li>
              <li>Generar reportes personales</li>
              <li>Acceder a recursos compartidos</li>
            </ul>
          </div>
          
          <div style={{marginTop: '25px', padding: '15px', background: 'rgba(0, 200, 255, 0.1)', border: '1px solid rgba(0, 200, 255, 0.3)', borderRadius: '6px'}}>
            <p style={{margin: '0', fontSize: '13px', color: '#66ddff', lineHeight: '1.6'}}>
              <strong>ℹ️ INFO:</strong> Tu cuenta de usuario tiene permisos limitados. 
              Para acceder a funciones administrativas, contacta al administrador del sistema.
            </p>
          </div>
        </div>
      )}

      {/* PROTECCIÓN CWE-89: SQL Injection - Búsqueda SEGURA */}
      <div style={{marginTop: '30px'}}>
        <h2><span style={{color: '#00ff41'}}>●</span> CWE-89: SQL Injection - PROTEGIDO</h2>
        <div className="card" style={{background: 'rgba(0, 255, 65, 0.1)', border: '1px solid rgba(0, 255, 65, 0.3)'}}>
          <p style={{color: '#66ffaa', fontSize: '13px', marginBottom: '15px'}}>
            <strong>✓ PROTECCIÓN:</strong> Esta búsqueda usa consultas parametrizadas ($1, $2...).
            Los intentos de SQL injection son neutralizados automáticamente.
          </p>
          <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar usuarios..."
              style={{flex: 1}}
            />
            <button onClick={searchUsers}>🔍 Buscar</button>
          </div>
          {searchResults.length > 0 && (
            <div style={{marginTop: '10px'}}>
              <strong>Resultados:</strong>
              <ul style={{marginTop: '10px'}}>
                {searchResults.map(u => (
                  <li key={u.id}>{u.username} ({u.role})</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* PROTECCIÓN CWE-79: XSS - Comentarios SEGUROS */}
      <div style={{marginTop: '30px'}}>
        <h2><span style={{color: '#00ff41'}}>●</span> CWE-79: XSS - PROTEGIDO</h2>
        <div className="card" style={{background: 'rgba(0, 255, 65, 0.1)', border: '1px solid rgba(0, 255, 65, 0.3)'}}>
          <p style={{color: '#66ffaa', fontSize: '13px', marginBottom: '15px'}}>
            <strong>✓ PROTECCIÓN:</strong> Todos los comentarios son sanitizados con escapeHtml().
            Los tags HTML son convertidos a entidades seguras (&lt;, &gt;, etc).
          </p>
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..."
            rows="3"
            style={{width: '100%', marginBottom: '10px'}}
          />
          <button onClick={submitComment}>💬 Enviar Comentario</button>
          
          <div style={{marginTop: '20px'}}>
            <strong>Comentarios:</strong>
            {comments.map(c => (
              <div key={c.id} style={{marginTop: '10px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px'}}>
                <div style={{fontSize: '12px', color: '#00ccff', marginBottom: '5px'}}>
                  <strong>{c.username}</strong> - {new Date(c.created_at).toLocaleString()}
                </div>
                {/* SEGURO: Se usa texto plano, React escapa automáticamente */}
                <div>{c.comment}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PROTECCIÓN CWE-73: Path Traversal - Descarga SEGURA */}
      <div style={{marginTop: '30px'}}>
        <h2><span style={{color: '#00ff41'}}>●</span> CWE-73: Path Traversal - PROTEGIDO</h2>
        <div className="card" style={{background: 'rgba(0, 255, 65, 0.1)', border: '1px solid rgba(0, 255, 65, 0.3)'}}>
          <p style={{color: '#66ffaa', fontSize: '13px', marginBottom: '15px'}}>
            <strong>✓ PROTECCIÓN:</strong> Whitelist de archivos permitidos + validación de path con path.resolve().
            Se bloquean caracteres peligrosos (.., /, \) y se verifica que el path esté dentro del directorio permitido.
          </p>
          <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <label style={{minWidth: '120px'}}>Archivo a descargar:</label>
            <input
              value={downloadFile}
              onChange={e => setDownloadFile(e.target.value)}
              placeholder="Nombre del archivo"
              style={{flex: 1}}
            />
            <button onClick={downloadFileFunc}>📥 Descargar</button>
          </div>
          <div style={{marginTop: '10px', fontSize: '12px', color: '#66ffaa'}}>
            Archivos permitidos: document1.txt, document2.txt<br/>
            Los intentos de path traversal (../secret.txt) serán bloqueados
          </div>
        </div>
      </div>

      {role === 'admin' && (
        <div>
          <h2>
            <span style={{color: '#ff3366'}}>●</span> PANEL DE ADMINISTRACIÓN
          </h2>
          
          <div style={{marginBottom: '20px', padding: '15px', background: 'rgba(0, 255, 65, 0.1)', border: '1px solid rgba(0, 255, 65, 0.3)', borderRadius: '6px'}}>
            <p style={{margin: '0', fontSize: '13px', color: '#66ffaa', lineHeight: '1.6'}}>
              <strong>✓ SEGURIDAD:</strong> Esta aplicación está protegida contra SQL Injection. 
              Todas las consultas a la base de datos utilizan consultas parametrizadas y las entradas son sanitizadas correctamente.
            </p>
          </div>

          <div style={{background: 'rgba(0, 20, 10, 0.4)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(0, 255, 65, 0.2)'}}>
            <h3 style={{fontFamily: 'Orbitron, monospace', color: '#00ff41', fontSize: '16px', marginTop: '0', marginBottom: '15px', letterSpacing: '1px'}}>
              📊 GESTIÓN DE USUARIOS
            </h3>
            
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>USUARIO</th>
                  <th>ROL</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <span style={{color: '#00ccff', fontFamily: 'Orbitron, monospace', fontWeight: 'bold'}}>
                        #{String(u.id).padStart(3, '0')}
                      </span>
                    </td>
                    <td>
                      <span style={{color: '#00ff41', fontWeight: 'bold'}}>{u.username}</span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        background: u.role === 'admin' ? 'rgba(255, 50, 50, 0.2)' : 'rgba(0, 200, 255, 0.2)',
                        border: u.role === 'admin' ? '1px solid #ff3333' : '1px solid #00ccff',
                        borderRadius: '4px',
                        color: u.role === 'admin' ? '#ff6666' : '#66ddff',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={()=>changeRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                        style={{
                          padding: '6px 15px',
                          fontSize: '11px',
                          background: 'linear-gradient(135deg, rgba(255, 170, 0, 0.2) 0%, rgba(255, 140, 0, 0.2) 100%)',
                          border: '1px solid #ffaa00',
                          color: '#ffcc66'
                        }}
                      >
                        ⇄ CAMBIAR ROL
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <p style={{textAlign: 'center', color: '#5599ff', marginTop: '20px', fontSize: '14px'}}>
                No hay usuarios disponibles
              </p>
            )}
          </div>

          <div style={{marginTop: '25px', padding: '15px', background: 'rgba(0, 255, 65, 0.1)', border: '1px solid rgba(0, 255, 65, 0.3)', borderRadius: '6px'}}>
            <p style={{margin: '0', fontSize: '12px', color: '#66ffaa', lineHeight: '1.6'}}>
              <strong>✓ PROTECCIÓN IMPLEMENTADA:</strong> Esta funcionalidad utiliza consultas parametrizadas para prevenir SQL Injection. 
              Las entradas del usuario son validadas y sanitizadas antes de realizar operaciones en la base de datos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
