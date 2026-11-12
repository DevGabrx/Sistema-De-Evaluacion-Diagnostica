import React, { useState, useEffect } from 'react';
import './Dashboard.css'; // O './Examen.css' según cómo hayas nombrado tu archivo de estilos

export default function Examen() {
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [enviado, setEnviado] = useState(false);
  const [puntajeFinal, setPuntajeFinal] = useState(null);

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

  const handleOpcionChange = (idPregunta, opcionSeleccionada) => {
    setRespuestas({
      ...respuestas,
      [idPregunta]: opcionSeleccionada,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let respondidas = Object.keys(respuestas).length;
    setPuntajeFinal(respondidas);
    setEnviado(true);
  };

  if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '50px' }}>Cargando evaluación diagnóstica...</div>;
  if (error) return <div className="err" style={{ textAlign: 'center', padding: '50px' }}>No se pudo conectar con el backend ({error}). ¿Está corriendo en http://localhost:3000/api/examenes?</div>;

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
            <b>{enviado ? puntajeFinal : 'En proceso'}</b>
            <span>Estado Actual</span>
          </div>
        </div>

        {!enviado ? (
          <form onSubmit={handleSubmit}>
            <div className="card" style={{ marginTop: '20px' }}>
              <h2>Preguntas de la Evaluación</h2>
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
                              {opcionesArray.map((op, i) => (
                                <label key={i} className="opcion-label">
                                  <input
                                    type="radio"
                                    name={`pregunta_${p.id_pregunta}`}
                                    value={op.texto}
                                    checked={respuestas[p.id_pregunta] === op.texto}
                                    onChange={() => handleOpcionChange(p.id_pregunta, op.texto)}
                                    required
                                  />
                                  <span>{op.texto}</span>
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
              <button type="submit" style={{ marginTop: '20px' }}>Enviar Evaluación</button>
            </div>
          </form>
        ) : (
          <div className="card resultado-card">
            <h2>¡Evaluación Completada con Éxito!</h2>
            <p style={{ color: 'var(--mu)', marginTop: '10px' }}>Has respondido todas las preguntas asignadas.</p>
            <b className="puntaje">
              {puntajeFinal} / {preguntas.length}
            </b>
            <button onClick={() => window.location.reload()}>Volver a Intentar</button>
          </div>
        )}
      </main>
    </div>
  );
}