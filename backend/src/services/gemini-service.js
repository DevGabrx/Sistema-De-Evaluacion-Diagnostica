const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generarYGuardarDiagnostico = async (idExamen) => {
    const { rows } = await db.query(
        `SELECT r.*, e.nombre 
         FROM examenes_resultados r
         JOIN estudiantes e ON e.id_estudiante = r.id_estudiante
         WHERE r.id_examen = $1`,
        [idExamen]
    );

    if (!rows.length) return null;
    const r = rows[0];

    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

    const prompt = `
    Eres un tutor experto en matemáticas. Un estudiante de tecnología llamado ${r.nombre} acaba de finalizar una prueba diagnóstica con los siguientes resultados:
    - Puntaje Global: ${r.puntaje_global}/30
    - Estadística: ${r.aciertos_estadistica}/10
    - Geometría: ${r.aciertos_geometria}/10
    - Cálculo y Álgebra: ${r.aciertos_calculo}/10
    - Tiempo empleado: ${r.tiempo_empleado_minutos} minutos.

    Genera un diagnóstico pedagógico estructurado en texto plano (sin markdown complejo) en 3 partes:
    1. Fortalezas: Qué áreas domina basándote en los puntajes más altos y el tiempo.
    2. Oportunidades de mejora: Qué conceptos falló (puntajes más bajos).
    3. Plan de estudio: Una recomendación corta, directa y motivadora.
    `;

    const result = await model.generateContent(prompt);
    const diagnostico = result.response.text();

    await db.query(
        'UPDATE examenes_resultados SET diagnostico_ia = $1 WHERE id_examen = $2',
        [diagnostico, idExamen]
    );

    return diagnostico;
};

module.exports = { generarYGuardarDiagnostico };