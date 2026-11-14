import React, { useState, useEffect } from 'react';
import Examen from './components/Examen';
import DashboardResultados from './components/DashboardResultados';
import Login from './components/Login';
import Registro from './components/Registro';
import './components/Dashboard.css';

function App() {
  const [vista, setVista] = useState('examen');
  const [vistaAuth, setVistaAuth] = useState('login');
  const [usuario, setUsuario] = useState(null);

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

  if (!usuario) {
    return (
      <div className="auth-wrapper">
        {vistaAuth === 'login' ? (
          <Login onLogin={(user) => setUsuario(user)} irARegistro={() => setVistaAuth('registro')} />
        ) : (
          <Registro onLogin={(user) => setUsuario(user)} irALogin={() => setVistaAuth('login')} />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <span className="navbar-brand">
          <span className="status-dot" title="Servidor conectado" />
          Sistema de Evaluación Diagnóstica
        </span>
        
        <span style={{ fontSize: '0.88rem', color: '#94a3b8', marginRight: '8px' }}>
          Estudiante: <b style={{ color: '#fff' }}>{usuario.nombre}</b>
        </span>

        <button 
          onClick={() => setVista('examen')} 
          className={`nav-btn ${vista === 'examen' ? 'active' : ''}`}>
          Presentar Examen
        </button>
        <button 
          onClick={() => setVista('dashboard')} 
          className={`nav-btn ${vista === 'dashboard' ? 'active' : ''}`}>
          Ver Dashboard
        </button>
        <button onClick={cerrarSesion} className="nav-btn logout">
          Salir
        </button>
      </nav>

      {vista === 'examen' ? <Examen idEstudiante={usuario.id_estudiante} /> : <DashboardResultados />}
    </div>
  );
}

export default App;