const db = require("../config/db");
const { generarYGuardarDiagnostico } = require("../services/gemini-service");

const generarExamen = async (req, res) => {
  try {
    const query = `
        SELECT id_pregunta, id_componente, enunciado, 
           opcion_a, opcion_b, opcion_c, opcion_d, nivel_de_dificultad
        FROM preguntas 
        WHERE id_componente = $1 
        ORDER BY RANDOM() 
        LIMIT 10
`;

    const [estadistica, geometria, calculo] = await Promise.all([
      db.query(query, [1]),
      db.query(query, [2]),
      db.query(query, [3]),
    ]);

    let cuestionario = [
      ...estadistica.rows,
      ...geometria.rows,
      ...calculo.rows,
    ];

    for (let i = cuestionario.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cuestionario[i], cuestionario[j]] = [cuestionario[j], cuestionario[i]];
    }

    res.json({ total: cuestionario.length, preguntas: cuestionario });
  } catch (error) {
    console.error("Error generando examen:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const guardarExamen = async (req, res) => {
  try {
    const { id_estudiante, respuestas, tiempo_empleado_minutos } = req.body;
    if (!id_estudiante)
      return res.status(400).json({ error: "Falta el id_estudiante" });

    const idsRespondidos = Object.keys(respuestas || {}).map(Number);
    let aciertos_estadistica = 0;
    let aciertos_geometria = 0;
    let aciertos_calculo = 0;

    if (idsRespondidos.length > 0) {
      const { rows: preguntasBD } = await db.query(
        `SELECT id_pregunta, id_componente, respuesta_correcta 
                 FROM preguntas WHERE id_pregunta = ANY($1::int[])`,
        [idsRespondidos],
      );

      preguntasBD.forEach((p) => {
        const elegida = respuestas[p.id_pregunta];
        const correcta = (p.respuesta_correcta || "").trim().toUpperCase();
        if (elegida && elegida.trim().toUpperCase() === correcta) {
          if (p.id_componente === 1) aciertos_estadistica++;
          if (p.id_componente === 2) aciertos_geometria++;
          if (p.id_componente === 3) aciertos_calculo++;
        }
      });
    }

    const puntaje_global =
      aciertos_estadistica + aciertos_geometria + aciertos_calculo;

    const { rows } = await db.query(
      `INSERT INTO examenes_resultados (
                id_estudiante, fecha_aplicacion, tiempo_empleado_minutos, 
                puntaje_global, aciertos_estadistica, aciertos_geometria, aciertos_calculo
            ) VALUES ($1, NOW(), $2, $3, $4, $5, $6) RETURNING *`,
      [
        id_estudiante,
        tiempo_empleado_minutos || 1,
        puntaje_global,
        aciertos_estadistica,
        aciertos_geometria,
        aciertos_calculo,
      ],
    );

    const resultado = rows[0];

    try {
      resultado.diagnostico_ia = await generarYGuardarDiagnostico(
        resultado.id_examen,
      );
    } catch (err) {
      console.error("Diagnóstico automático omitido:", err.message);
    }

    res.status(201).json({ mensaje: "Evaluación guardada", resultado });
  } catch (error) {
    console.error("Error guardando examen:", error);
    res.status(500).json({ error: "Error al guardar la evaluación" });
  }
};

module.exports = { generarExamen, guardarExamen };
