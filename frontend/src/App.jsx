import React from 'react';
import Examen from './components/examen';
import './App.css';

function App() {
  return (
    <div className="app">
      <div className="server-status-bar" style={{ padding: '8px', background: '#e0e7ff', textAlign: 'center', fontSize: '0.85rem' }}>
        Sistema de Evaluación Diagnóstica conectado a <b>http://localhost:3000/api/examenes</b>
      </div>
      <Examen />
    </div>
  );
}

export default App;