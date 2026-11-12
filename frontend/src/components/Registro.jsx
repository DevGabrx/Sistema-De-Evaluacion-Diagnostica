// src/components/Registro.jsx
import React, { useState } from 'react';

export default function Registro({ onRegistroExitoso, irALogin }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [documento, setDocumento] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, documento })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error al registrar');

      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      onRegistroExitoso(); // Cambia la vista a Login
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Registro de Estudiante</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" placeholder="Nombre completo" required
          value={nombre} onChange={(e) => setNombre(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
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
        <button type="submit" disabled={cargando} style={{ padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: cargando ? 'not-allowed' : 'pointer' }}>
          {cargando ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.9rem' }}>
        ¿Ya tienes cuenta? <button onClick={irALogin} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', textDecoration: 'underline' }}>Inicia sesión</button>
      </p>
    </div>
  );
}