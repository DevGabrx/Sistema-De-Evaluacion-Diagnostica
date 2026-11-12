// Llama a la API REST de Gemini (Node 18+ trae fetch, no requiere dependencias nuevas)
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

async function generarDiagnostico({ nombre, tiempo, puntaje, estadistica, geometria, calculo }) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY no está definida en el .env');

    const prompt = `Eres un tutor de matemáticas. Analiza este examen diagnóstico de 30 preguntas (10 por componente).
Estudiante: ${nombre}
Puntaje global: ${puntaje}/30
Tiempo empleado: ${tiempo ?? 'no registrado'} minutos
Aciertos: Estadística ${estadistica}/10, Geometría ${geometria}/10, Cálculo y Álgebra ${calculo}/10

Responde en español, sin saludos, con estas secciones:
FORTALEZAS: ...
DEBILIDADES: ...
PLAN DE ESTUDIO: (pasos concretos y breves)`;

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (!r.ok) throw new Error(`Gemini respondió ${r.status}: ${await r.text()}`);
    const data = await r.json();
    const texto = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
    if (!texto) throw new Error('Gemini devolvió una respuesta vacía');
    return texto;
}

module.exports = { generarDiagnostico };
