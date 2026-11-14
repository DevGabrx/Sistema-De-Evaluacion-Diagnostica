import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const AREAS = {
  1: 'Estadística',
  2: 'Geometría',
  3: 'Cálculo'
};

export default function Examen({ idEstudiante }) {
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultadoGuardado, setResultadoGuardado] = useState(null);
  const [tiempoInicio] = useState(Date.now());

  useEffect(() => {
    fetch('http://localhost:3000/api/examenes')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo conectar con el servidor');
        return res.json();
      })
      .then((data) => {
        const listaPreguntas = Array.isArray(data) ? data : (data.preguntas || []);
        setPreguntas(listaPreguntas);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleOpcionChange = (idPregunta, letraOpcion) => {
    setRespuestas({ ...respuestas, [idPregunta]: letraOpcion });
  };

  const getBadgeDificultad = (nivel) => {
    const n = (nivel || 'Media').toLowerCase();
    if (n.includes('baj') || n.includes('fác') || n.includes('fac')) return 'badge-baja';
    if (n.includes('alt') || n.includes('dif')) return 'badge-alta';
    return 'badge-media';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    const minutosTranscurridos = Math.max(1, Math.round((Date.now() - tiempoInicio) / 60000));
    const estudianteActivo = idEstudiante || JSON.parse(localStorage.getItem('estudiante') || '{}').id_estudiante;

    try {
      const response = await fetch('http://localhost:3000/api/examenes/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_estudiante: estudianteActivo,
          respuestas,
          tiempo_empleado_minutos: minutosTranscurridos
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al guardar el examen');

      setResultadoGuardado(data.resultado);
      setEnviado(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Cargando evaluación diagnóstica...</div>;
  if (error) return <div style={{ maxWidth: '600px', margin: '40px auto' }} className="err">Error: {error}</div>;

  const respondidasCount = Object.keys(respuestas).length;
  const porcentajeProgreso = preguntas.length > 0 ? Math.round((respondidasCount / preguntas.length) * 100) : 0;

  return (
    <div>
      <header>
        <h1>Evaluación Diagnóstica de Matemáticas</h1>
        <p>Selecciona la respuesta correcta para cada ítem. Puedes enviar la prueba en cualquier momento.</p>
      </header>

      {!enviado && (
        <div className="sticky-progress">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Progreso: {respondidasCount} de {preguntas.length} respondidas</span>
              <span>{porcentajeProgreso}%</span>
            </div>
            <div className="progress-track" style={{ marginTop: '6px' }}>
              <div className="progress-fill" style={{ width: `${porcentajeProgreso}%`, background: 'var(--pr)' }} />
            </div>
          </div>
          <button type="button" onClick={handleSubmit} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Finalizar y Enviar'}
          </button>
        </div>
      )}

      <main>
        {!enviado ? (
          <form onSubmit={handleSubmit} className="preguntas-lista">
            {preguntas.map((p, index) => {
              const opcionesArray = [
                { key: 'A', texto: p.opcion_a },
                { key: 'B', texto: p.opcion_b },
                { key: 'C', texto: p.opcion_c },
                { key: 'D', texto: p.opcion_d },
              ];
              const seleccionada = respuestas[p.id_pregunta];

              return (
                <div key={p.id_pregunta || index} className={`pregunta-card ${seleccionada ? 'respondida' : ''}`}>
                  <div className="pregunta-meta">
                    <span style={{ fontWeight: 700, color: 'var(--mu)', fontSize: '0.85rem' }}>
                      PREGUNTA {index + 1} DE {preguntas.length}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span className="badge badge-area">{AREAS[p.id_componente] || 'General'}</span>
                      <span className={`badge ${getBadgeDificultad(p.nivel_de_dificultad)}`}>
                        Dificultad: {p.nivel_de_dificultad || 'Media'}
                      </span>
                    </div>
                  </div>

                  <p className="pregunta-enunciado">{p.enunciado}</p>

                  <div className="opciones-grid">
                    {opcionesArray.map((op) => {
                      const isSelected = seleccionada === op.key;
                      return (
                        <div
                          key={op.key}
                          onClick={() => handleOpcionChange(p.id_pregunta, op.key)}
                          className={`opcion-card ${isSelected ? 'seleccionada' : ''}`}
                        >
                          <span className="opcion-letra">{op.key}</span>
                          <span>{op.texto}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="submit" disabled={enviando} style={{ padding: '14px 28px', fontSize: '1rem' }}>
                {enviando ? 'Guardando resultados...' : 'Enviar Evaluación'}
              </button>
            </div>
          </form>
        ) : (
          <div className="card resultado-card">
            <span className="badge badge-alto">Evaluación Registrada</span>
            <h2 style={{ marginTop: '14px', fontSize: '1.5rem' }}>¡Prueba Finalizada con Éxito!</h2>
            <p style={{ color: 'var(--mu)' }}>
              Respondiste {respondidasCount} de {preguntas.length} preguntas en {resultadoGuardado?.tiempo_empleado_minutos || 1} min.
            </p>
            <b className="puntaje">
              {resultadoGuardado?.puntaje_global ?? 0} / {preguntas.length}
            </b>
            <div className="kpis" style={{ maxWidth: '650px', margin: '24px auto' }}>
              <div className="card kpi">
                <b>{resultadoGuardado?.aciertos_estadistica ?? 0}/10</b>
                <span>Estadística</span>
              </div>
              <div className="card kpi">
                <b>{resultadoGuardado?.aciertos_geometria ?? 0}/10</b>
                <span>Geometría</span>
              </div>
              <div className="card kpi">
                <b>{resultadoGuardado?.aciertos_calculo ?? 0}/10</b>
                <span>Cálculo</span>
              </div>
            </div>
            <button onClick={() => window.location.reload()}>Presentar Nueva Evaluación</button>
          </div>
        )}
      </main>
    </div>
  );
}