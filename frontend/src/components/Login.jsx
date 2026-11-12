// src/components/Login.jsx
import React, { useState } from 'react';

export default function Login({ onLogin, irARegistro }) {
  const [correo, setCorreo] = useState('');
  const [documento, setDocumento] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, documento })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error al iniciar sesión');

      // Guardamos la sesión en el navegador
      localStorage.setItem('estudiante', JSON.stringify(data.usuario));
      onLogin(data.usuario);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Iniciar Sesión</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" placeholder="Correo electrónico" required
          value={correo} onChange={(e) => setCorreo(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="number" placeholder="Documento de identidad" required
          value={documento} onChange={(e) => setDocumento(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" disabled={cargando} style={{ padding: '10px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: cargando ? 'not-allowed' : 'pointer' }}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.9rem' }}>
        ¿No tienes cuenta? <button onClick={irARegistro} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', textDecoration: 'underline' }}>Regístrate</button>
      </p>
    </div>
  );
}