import React, { useState, useEffect } from 'react';
import './Dashboard.css';

export default function Examen({ idEstudiante }) {
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [enviado, setEnviado] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [inicioTiempo] = useState(Date.now());

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

  const handleOpcionChange = (idPregunta, opcionKey) => {
    setRespuestas((prev) => ({
      ...prev,
      [idPregunta]: opcionKey,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    // Obtener el ID del estudiante (prop o fallback a localStorage)
    const estudianteId = idEstudiante || JSON.parse(localStorage.getItem('estudiante') || '{}').id_estudiante;
    if (!estudianteId) {
      setError('No se pudo identificar al estudiante. Por favor, vuelve a iniciar sesión.');
      setEnviando(false);
      return;
    }

    // Calcular el tiempo transcurrido en minutos
    const minutosTranscurridos = Math.max(1, Math.round((Date.now() - inicioTiempo) / 60000));

    // Formatear respuestas para el backend: [{ id_pregunta, respuesta: 'A'|'B'|'C'|'D' }]
    const payloadRespuestas = Object.entries(respuestas).map(([id_pregunta, respuesta]) => ({
      id_pregunta: Number(id_pregunta),
      respuesta: respuesta,
    }));

    try {
      const res = await fetch('http://localhost:3000/api/examenes/resultados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_estudiante: Number(estudianteId),
          tiempo_empleado_minutos: minutosTranscurridos,
          respuestas: payloadRespuestas,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error al calificar el examen');
      }

      setResultado(data);
      setEnviado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '50px' }}>Cargando evaluación diagnóstica...</div>;
  if (error && !enviado) return <div className="err" style={{ textAlign: 'center', padding: '50px' }}>Error: {error}</div>;

  return (
    <div>
      <header>
        <h1>Dashboard de Evaluación Diagnóstica</h1>
      </header>
      <main>
        {/* KPIs de resumen */}
        <div className="kpis" id="kpis">
          <div className="card kpi">
            <b>{preguntas.length}</b>
            <span>Total Preguntas</span>
          </div>
          <div className="card kpi">
            <b>{Object.keys(respuestas).length}</b>
            <span>Respondidas</span>
          </div>
          <div className="card kpi">
            <b>{enviado ? `${resultado?.puntaje_global ?? 0} / ${preguntas.length}` : 'En proceso'}</b>
            <span>Estado Actual</span>
          </div>
        </div>

        {!enviado ? (
          <form onSubmit={handleSubmit}>
            <div className="card" style={{ marginTop: '20px' }}>
              <h2>Preguntas de la Evaluación</h2>
              {error && <p className="err" style={{ marginBottom: '15px' }}>{error}</p>}
              <div className="scroll">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Enunciado</th>
                      <th>Opciones de Respuesta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preguntas.map((p, index) => {
                      const opcionesArray = [
                        { key: 'A', texto: p.opcion_a },
                        { key: 'B', texto: p.opcion_b },
                        { key: 'C', texto: p.opcion_c },
                        { key: 'D', texto: p.opcion_d },
                      ];

                      return (
                        <tr key={p.id_pregunta || index}>
                          <td><b>{index + 1}</b></td>
                          <td style={{ whiteSpace: 'normal', maxWidth: '400px' }}>{p.enunciado}</td>
                          <td style={{ whiteSpace: 'normal' }}>
                            <div className="opciones">
                              {opcionesArray.map((op) => (
                                <label key={op.key} className="opcion-label">
                                  <input
                                    type="radio"
                                    name={`pregunta_${p.id_pregunta}`}
                                    value={op.key}
                                    checked={respuestas[p.id_pregunta] === op.key}
                                    onChange={() => handleOpcionChange(p.id_pregunta, op.key)}
                                    required
                                  />
                                  <span><b>{op.key})</b> {op.texto}</span>
                                </label>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button type="submit" disabled={enviando} style={{ marginTop: '20px' }}>
                {enviando ? 'Calificando y registrando...' : 'Enviar Evaluación'}
              </button>
            </div>
          </form>
        ) : (
          <div className="card resultado-card">
            <h2>¡Evaluación Completada con Éxito!</h2>
            <p style={{ color: 'var(--mu)', marginTop: '10px' }}>
              Tus respuestas han sido evaluadas y registradas en el sistema.
            </p>
            <b className="puntaje">
              {resultado?.puntaje_global ?? 0} / {preguntas.length}
            </b>

            {resultado?.aciertos && (
              <div style={{ margin: '20px auto', maxWidth: '350px', textAlign: 'left', background: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid var(--bd)' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: '1rem' }}>Desglose por Componente:</h3>
                <p style={{ margin: '5px 0' }}>📊 <b>Estadística:</b> {resultado.aciertos.estadistica ?? 0} / 10</p>
                <p style={{ margin: '5px 0' }}>📐 <b>Geometría:</b> {resultado.aciertos.geometria ?? 0} / 10</p>
                <p style={{ margin: '5px 0' }}>∫ <b>Cálculo:</b> {resultado.aciertos.calculo ?? 0} / 10</p>
              </div>
            )}

            {resultado?.diagnostico_ia && (
              <div className="card" style={{ marginTop: '20px', textAlign: 'left', whiteSpace: 'pre-line', background: '#f8fafc' }}>
                <h3 style={{ marginTop: 0 }}>Diagnóstico Pedagógico (IA):</h3>
                <p>{resultado.diagnostico_ia}</p>
              </div>
            )}

            <button onClick={() => window.location.reload()} style={{ marginTop: '20px' }}>
              Presentar Nueva Evaluación
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
