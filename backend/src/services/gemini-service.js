const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Inicializamos el cliente con la clave de tu .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generarDiagnosticoPedagogico = async (resultados) => {
    try {
        // Usamos gemini-1.5-flash porque es el más rápido y eficiente para texto
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Diseño del Prompt (Ingeniería de Prompts)
        const prompt = `
        Eres un tutor experto en matemáticas. Un estudiante de tecnología acaba de finalizar una prueba diagnóstica con los siguientes resultados:
        - Puntaje Global: ${resultados.puntaje_global}/30
        - Estadística: ${resultados.aciertos_estadistica}/10
        - Geometría: ${resultados.aciertos_geometria}/10
        - Cálculo y Álgebra: ${resultados.aciertos_calculo}/10
        - Tiempo empleado: ${resultados.tiempo_empleado_minutos} minutos.

        Genera un diagnóstico pedagógico estructurado en texto plano (sin markdown complejo) en 3 partes:
        1. Fortalezas: Qué áreas domina basándote en los puntajes más altos y el tiempo.
        2. Oportunidades de mejora: Qué conceptos falló (puntajes más bajos).
        3. Plan de estudio: Una recomendación corta, directa y motivadora.
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Error conectando con Gemini:", error);
        return "El diagnóstico de IA no está disponible en este momento. Por favor, revisa tus puntajes.";
    }
};

module.exports = { generarDiagnosticoPedagogico };