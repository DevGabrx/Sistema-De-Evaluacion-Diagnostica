import React, { useState } from 'react';
import Examen from './Examen';
import DashboardResultados from './DashboardResultados';
import './App.css';

function App() {
  const [vista, setVista] = useState('examen');

  return (
    <div className="app">
      <nav style={{ background: '#1f2937', padding: '12px 24px', display: 'flex', gap: '15px', color: '#fff', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', marginRight: 'auto' }}>
          Sistema de Evaluación Diagnóstica
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
      </nav>

      <div className="server-status-bar" style={{ padding: '8px', background: '#e0e7ff', textAlign: 'center', fontSize: '0.85rem' }}>
        Conectado a <b>http://localhost:3000/api/examenes</b>
      </div>

      {vista === 'examen' ? <Examen /> : <DashboardResultados />}
    </div>
  );
}

export default App;