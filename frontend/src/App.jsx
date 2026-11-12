// src/App.jsx
import React, { useState, useEffect } from 'react';
import Examen from './components/Examen';
import DashboardResultados from './components/DashboardResultados';
import Login from './components/Login';
import Registro from './components/Registro';
import './App.css';

function App() {
  const [vista, setVista] = useState('examen'); // 'examen' | 'dashboard'
  const [vistaAuth, setVistaAuth] = useState('login'); // 'login' | 'registro'
  const [usuario, setUsuario] = useState(null);

  // Al cargar la app, verifica si ya hay una sesión guardada
  useEffect(() => {
    const estudianteGuardado = localStorage.getItem('estudiante');
    if (estudianteGuardado) {
      setUsuario(JSON.parse(estudianteGuardado));
    }
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('estudiante');
    setUsuario(null);
  };

  // Si no hay usuario logueado, mostramos Login o Registro
  if (!usuario) {
    return (
      <div className="app" style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingTop: '20px' }}>
        {vistaAuth === 'login' ? (
          <Login onLogin={(user) => setUsuario(user)} irARegistro={() => setVistaAuth('registro')} />
        ) : (
          <Registro onRegistroExitoso={() => setVistaAuth('login')} irALogin={() => setVistaAuth('login')} />
        )}
      </div>
    );
  }

  // Si está logueado, mostramos el sistema principal
  return (
    <div className="app">
      <nav style={{ background: '#1f2937', padding: '12px 24px', display: 'flex', gap: '15px', color: '#fff', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 'bold', marginRight: 'auto' }}>
          Sistema de Evaluación Diagnóstica
        </span>
        
        <span style={{ fontSize: '0.9rem', marginRight: '10px' }}>
          Hola, <b>{usuario.nombre}</b>
        </span>

        <button 
          onClick={() => setVista('examen')} 
          style={{ background: vista === 'examen' ? '#4f46e5' : '#374151', padding: '6px 14px', fontSize: '0.85rem', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}>
          Presentar Examen
        </button>
        <button 
          onClick={() => setVista('dashboard')} 
          style={{ background: vista === 'dashboard' ? '#4f46e5' : '#374151', padding: '6px 14px', fontSize: '0.85rem', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}>
          Ver Dashboard
        </button>
        <button 
          onClick={cerrarSesion} 
          style={{ background: '#ef4444', padding: '6px 14px', fontSize: '0.85rem', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', marginLeft: '10px' }}>
          Salir
        </button>
      </nav>

      <div className="server-status-bar" style={{ padding: '8px', background: '#e0e7ff', textAlign: 'center', fontSize: '0.85rem' }}>
        Conectado a <b>http://localhost:3000/api/examenes</b>
      </div>

      {/* Pasamos el usuario logueado al examen para que el backend sepa a quién asignarle el puntaje */}
      {vista === 'examen' ? <Examen idEstudiante={usuario.id_estudiante} /> : <DashboardResultados />}
    </div>
  );
}

export default App;