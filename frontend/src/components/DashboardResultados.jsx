import React, { useState, useEffect } from 'react';
import './Dashboard.css';

export default function DashboardResultados() {
  const [resumen, setResumen] = useState({
    total_examenes: 0,
    total_estudiantes: 0,
    promedio: 0,
    tiempo_promedio: 0,
    estadistica: 0,
    geometria: 0,
    calculo: 0,
    evolucion: []
  });
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [diagnosticoActivo, setDiagnosticoActivo] = useState(null);
  const [tituloDiag, setTituloDiag] = useState('');

  const cargarDatos = () => {
    Promise.all([
      fetch('http://localhost:3000/api/dashboard/resumen').then(r => {
        if (!r.ok) throw new Error('Error en resumen');
        return r.json();
      }),
      fetch('http://localhost:3000/api/dashboard/resultados').then(r => {
        if (!r.ok) throw new Error('Error en resultados');
        return r.json();
      })
    ])
      .then(([resData, filasData]) => {
        if (resData) setResumen(resData);
        if (Array.isArray(filasData)) setResultados(filasData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('No se pudo conectar con los endpoints del dashboard.');
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const manejarDiagnosticoIA = async (examen) => {
    if (examen.diagnostico_ia) {
      setTituloDiag(`Diagnóstico de ${examen.nombre}`);
      setDiagnosticoActivo(examen.diagnostico_ia);
      return;
    }

    setTituloDiag(`Generando diagnóstico para ${examen.nombre}...`);
    setDiagnosticoActivo('Consultando a la inteligencia artificial de Gemini, por favor espere...');
    
    try {
      const res = await fetch(`http://localhost:3000/api/ia/diagnostico/${examen.id_examen}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Error al generar');
      const data = await res.json();
      setDiagnosticoActivo(data.diagnostico_ia);
      setTituloDiag(`Diagnóstico de ${examen.nombre}`);
      cargarDatos();
    } catch {
      setDiagnosticoActivo('No se pudo conectar con el servicio de IA.');
      setTituloDiag('Error');
    }
  };

  if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '50px' }}>Cargando métricas del dashboard...</div>;

  return (
    <div>
      <header>
        <h1>Dashboard de Evaluación Diagnóstica</h1>
      </header>
      <main>
        {error && <p className="err">{error}</p>}

        {/* 1. KPIs Generales */}
        <div className="kpis" id="kpis">
          <div className="card kpi">
            <b>{resumen.total_examenes || 0}</b>
            <span>Exámenes aplicados</span>
          </div>
          <div className="card kpi">
            <b>{resumen.total_estudiantes || 0}</b>
            <span>Estudiantes</span>
          </div>
          <div className="card kpi">
            <b>{resumen.promedio || 0} / 30</b>
            <span>Puntaje promedio</span>
          </div>
          <div className="card kpi">
            <b>{resumen.tiempo_promedio || 0} min</b>
            <span>Tiempo promedio</span>
          </div>
        </div>

        {/* 2. Promedio por Componente (lo que faltaba de resumen) */}
        <div className="kpis" style={{ marginTop: '15px' }}>
          <div className="card kpi">
            <b>{resumen.estadistica || 0} / 10</b>
            <span>Promedio Estadística</span>
          </div>
          <div className="card kpi">
            <b>{resumen.geometria || 0} / 10</b>
            <span>Promedio Geometría</span>
          </div>
          <div className="card kpi">
            <b>{resumen.calculo || 0} / 10</b>
            <span>Promedio Cálculo</span>
          </div>
        </div>

        {/* 3. Evolución Diaria (serie histórica de resumen) */}
        {resumen.evolucion && resumen.evolucion.length > 0 && (
          <div className="card" style={{ marginTop: '20px' }}>
            <h2>Evolución por Día</h2>
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Exámenes Realizados</th>
                    <th>Puntaje Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {resumen.evolucion.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.dia}</td>
                      <td>{item.examenes}</td>
                      <td><b>{item.promedio}</b> / 30</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Tabla de Resultados Recientes */}
        <div className="card" style={{ marginTop: '20px' }}>
          <h2>Resultados recientes</h2>
          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Fecha</th>
                  <th>Puntaje</th>
                  <th>Estad.</th>
                  <th>Geom.</th>
                  <th>Cálc.</th>
                  <th>Min.</th>
                  <th>Diagnóstico IA</th>
                </tr>
              </thead>
              <tbody id="rows">
                {resultados.length > 0 ? (
                  resultados.map((r) => (
                    <tr key={r.id_examen}>
                      <td>{r.nombre}</td>
                      <td>{new Date(r.fecha_aplicacion).toLocaleDateString('es-CO')}</td>
                      <td><b>{r.puntaje_global}</b>/30</td>
                      <td>{r.aciertos_estadistica}</td>
                      <td>{r.aciertos_geometria}</td>
                      <td>{r.aciertos_calculo}</td>
                      <td>{r.tiempo_empleado_minutos ?? '-'}</td>
                      <td>
                        <button onClick={() => manejarDiagnosticoIA(r)}>
                          {r.diagnostico_ia ? 'Ver' : 'Generar con Gemini'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', color: 'var(--mu)' }}>
                      Aún no hay resultados registrados en la base de datos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Tarjeta de Diagnóstico IA */}
        {diagnosticoActivo && (
          <div className="card" id="diagCard" style={{ marginTop: '20px' }}>
            <h2 id="diagTitle">{tituloDiag}</h2>
            <div id="diag" style={{ whiteSpace: 'pre-line', marginTop: '10px' }}>{diagnosticoActivo}</div>
          </div>
        )}
      </main>
    </div>
  );
}