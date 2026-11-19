const db = require('../config/db');
const { generarDiagnosticoPedagogico } = require('../services/gemini-service');

const COMP = { 1: 'estadistica', 2: 'geometria', 3: 'calculo' };

// Control de concurrencia: almacena promesas en curso por id_examen para evitar llamadas simultáneas duplicadas
const diagnosticosEnCurso = new Map();

// Genera el diagnóstico con Gemini y lo guarda en diagnostico_ia (solo si no existe o se fuerza)
async function diagnosticarExamen(idExamen, { forzar = false } = {}) {
    // Si ya existe una promesa activa para este examen, nos unimos a ella en lugar de crear otra
    if (diagnosticosEnCurso.has(idExamen)) {
        return diagnosticosEnCurso.get(idExamen);
    }

    const tarea = (async () => {
        const { rows } = await db.query(
            `SELECT r.*, e.nombre FROM Examenes_Resultados r
             JOIN Estudiantes e ON e.id_estudiante = r.id_estudiante
             WHERE r.id_examen = $1`, [idExamen]);
        if (!rows.length) return null;
        const r = rows[0];

        // Idempotencia: Si ya cuenta con diagnóstico y no se requiere forzar regeneración, retornarlo directo
        if (r.diagnostico_ia && !forzar) {
            return r.diagnostico_ia;
        }

        const texto = await generarDiagnosticoPedagogico({
            nombre: r.nombre,
            tiempo_empleado_minutos: r.tiempo_empleado_minutos,
            puntaje_global: r.puntaje_global,
            aciertos_estadistica: r.aciertos_estadistica,
            aciertos_geometria: r.aciertos_geometria,
            aciertos_calculo: r.aciertos_calculo
        });

        if (texto) {
            await db.query('UPDATE Examenes_Resultados SET diagnostico_ia = $1 WHERE id_examen = $2', [texto, idExamen]);
        }
        return texto;
    })();

    diagnosticosEnCurso.set(idExamen, tarea);
    try {
        return await tarea;
    } finally {
        diagnosticosEnCurso.delete(idExamen);
    }
}

// POST /api/examenes/resultados  body: { id_estudiante, tiempo_empleado_minutos, respuestas:[{id_pregunta, respuesta}] }
const enviarExamen = async (req, res) => {
    try {
        const { id_estudiante, tiempo_empleado_minutos, respuestas } = req.body;
        if (!id_estudiante || !Array.isArray(respuestas)) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }
        const ids = respuestas.map(r => Number(r.id_pregunta));
        const { rows } = await db.query(
            'SELECT id_pregunta, id_componente, respuesta_correcta FROM Preguntas WHERE id_pregunta = ANY($1::int[])', [ids]);
        const clave = new Map(rows.map(p => [p.id_pregunta, p]));

        const ac = { estadistica: 0, geometria: 0, calculo: 0 };
        for (const r of respuestas) {
            const p = clave.get(Number(r.id_pregunta));
            if (p && String(r.respuesta).trim().toUpperCase() === String(p.respuesta_correcta).trim().toUpperCase()) {
                const comp = COMP[p.id_componente];
                if (comp && ac[comp] !== undefined) {
                    ac[comp]++;
                }
            }
        }
        const puntaje = ac.estadistica + ac.geometria + ac.calculo;

        const ins = await db.query(
            `INSERT INTO Examenes_Resultados
             (id_estudiante, tiempo_empleado_minutos, puntaje_global, aciertos_estadistica, aciertos_geometria, aciertos_calculo)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING id_examen`,
            [id_estudiante, tiempo_empleado_minutos ?? null, puntaje, ac.estadistica, ac.geometria, ac.calculo]);
        const id_examen = ins.rows[0].id_examen;

        // El diagnóstico se invoca una única vez por evaluación: si Gemini falla, el resultado ya quedó registrado
        let diagnostico_ia = null;
        try { 
            diagnostico_ia = await diagnosticarExamen(id_examen); 
        } catch (e) { 
            console.error('Gemini falló al generar diagnóstico inicial:', e.message); 
        }

        res.status(201).json({ id_examen, puntaje_global: puntaje, aciertos: ac, diagnostico_ia });
    } catch (error) {
        console.error('Error guardando examen:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// GET /api/dashboard/resumen
const resumen = async (req, res) => {
    try {
        const [kpi, evo] = await Promise.all([
            db.query(`SELECT COUNT(*)::int AS total_examenes,
                             COUNT(DISTINCT id_estudiante)::int AS total_estudiantes,
                             COALESCE(ROUND(AVG(puntaje_global),1),0)::float AS promedio,
                             COALESCE(ROUND(AVG(tiempo_empleado_minutos),1),0)::float AS tiempo_promedio,
                             COALESCE(ROUND(AVG(aciertos_estadistica),1),0)::float AS estadistica,
                             COALESCE(ROUND(AVG(aciertos_geometria),1),0)::float AS geometria,
                             COALESCE(ROUND(AVG(aciertos_calculo),1),0)::float AS calculo
                      FROM Examenes_Resultados`),
            db.query(`SELECT TO_CHAR(fecha_aplicacion,'YYYY-MM-DD') AS dia,
                             ROUND(AVG(puntaje_global),1)::float AS promedio, COUNT(*)::int AS examenes
                      FROM Examenes_Resultados GROUP BY 1 ORDER BY 1`)
        ]);
        res.json({ ...kpi.rows[0], evolucion: evo.rows });
    } catch (error) {
        console.error('Error en resumen:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// GET /api/dashboard/resultados
const resultados = async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT r.id_examen, e.nombre, e.correo, r.fecha_aplicacion, r.tiempo_empleado_minutos,
                    r.puntaje_global, r.aciertos_estadistica, r.aciertos_geometria, r.aciertos_calculo, r.diagnostico_ia
             FROM Examenes_Resultados r JOIN Estudiantes e ON e.id_estudiante = r.id_estudiante
             ORDER BY r.fecha_aplicacion DESC LIMIT 100`);
        res.json(rows);
    } catch (error) {
        console.error('Error en resultados:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// POST /api/dashboard/diagnostico/:id  (obtiene diagnóstico existente o genera con Gemini si no existe)
const generarDiagnosticoIA = async (req, res) => {
    try {
        const idExamen = Number(req.params.id);
        const forzar = req.query.forzar === 'true';
        const texto = await diagnosticarExamen(idExamen, { forzar });
        if (!texto) return res.status(404).json({ error: 'Examen no encontrado' });
        res.json({ id_examen: idExamen, diagnostico_ia: texto });
    } catch (error) {
        console.error('Error con Gemini:', error);
        res.status(502).json({ error: 'No se pudo generar el diagnóstico con Gemini' });
    }
};

module.exports = { enviarExamen, resumen, resultados, generarDiagnosticoIA };
