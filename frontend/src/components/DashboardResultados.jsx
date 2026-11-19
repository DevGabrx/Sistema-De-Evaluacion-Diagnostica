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
  const [generandoId, setGenerandoId] = useState(null); // Controla el estado de petición en curso por examen

  useEffect(() => {
    let montado = true;

    Promise.all([
      fetch('http://localhost:3000/api/dashboard/resumen').then(r => r.json()).catch(() => null),
      fetch('http://localhost:3000/api/dashboard/resultados').then(r => r.json()).catch(() => [])
    ])
      .then(([resData, filasData]) => {
        if (!montado) return;
        if (resData) setResumen(resData);
        if (filasData) setResultados(filasData);
        setLoading(false);
      })
      .catch((err) => {
        if (!montado) return;
        setError('No se pudo conectar con los endpoints del dashboard.');
        setLoading(false);
      });

    return () => {
      montado = false;
    };
  }, []);

  // Muestra el diagnóstico ya existente en memoria o BD sin hacer peticiones a la API
  const mostrarDiagnostico = (diagnostico, nombreEstudiante) => {
    setTituloDiag(`Diagnóstico de ${nombreEstudiante}`);
    setDiagnosticoActivo(diagnostico);
  };

  // Solo se invoca si el examen NO tiene diagnóstico previo
  const generarDiagnosticoIA = async (idExamen, nombreEstudiante) => {
    if (generandoId !== null) return; // Bloquear si ya hay una petición en curso

    setGenerandoId(idExamen);
    setTituloDiag(`Generando diagnóstico para ${nombreEstudiante}...`);
    setDiagnosticoActivo('Consultando a la inteligencia artificial de Gemini, por favor espere...');
    
    try {
      const res = await fetch(`http://localhost:3000/api/dashboard/diagnostico/${idExamen}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Error al generar');
      const data = await res.json();
      
      setDiagnosticoActivo(data.diagnostico_ia);
      setTituloDiag(`Diagnóstico de ${nombreEstudiante}`);

      // Actualizar el examen en el estado local para que el botón pase a "Ver" inmediatamente
      setResultados(prev => prev.map(item => 
        item.id_examen === idExamen ? { ...item, diagnostico_ia: data.diagnostico_ia } : item
      ));
    } catch {
      setDiagnosticoActivo('No se pudo conectar con el servicio de IA.');
      setTituloDiag('Error');
    } finally {
      setGenerandoId(null);
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

        {/* Tarjetas KPI superiores */}
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

        {/* Sección de la tabla de resultados recientes */}
        <div className="card">
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
                        {r.diagnostico_ia ? (
                          <button 
                            type="button" 
                            onClick={() => mostrarDiagnostico(r.diagnostico_ia, r.nombre)}
                          >
                            Ver
                          </button>
                        ) : (
                          <button 
                            type="button"
                            disabled={generandoId !== null}
                            onClick={() => generarDiagnosticoIA(r.id_examen, r.nombre)}
                          >
                            {generandoId === r.id_examen ? 'Generando...' : 'Generar con Gemini'}
                          </button>
                        )}
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

        {/* Tarjeta dinámica para mostrar el diagnóstico de IA seleccionado */}
        {diagnosticoActivo && (
          <div className="card" id="diagCard">
            <h2 id="diagTitle">{tituloDiag}</h2>
            <div id="diag" style={{ whiteSpace: 'pre-line' }}>{diagnosticoActivo}</div>
          </div>
        )}
      </main>
    </div>
  );
}
