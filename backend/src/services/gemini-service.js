const { GoogleGenAI } = require('@google/genai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Inicializamos el cliente oficial de Google Gen AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generarDiagnosticoPedagogico = async (resultados) => {
    // Diseño del Prompt (Ingeniería de Prompts)
    const prompt = `
    Eres un tutor experto en matemáticas. Un estudiante de tecnología acaba de finalizar una prueba diagnóstica con los siguientes resultados:
    - Puntaje Global: ${resultados.puntaje_global}/30
    - Estadística: ${resultados.aciertos_estadistica}/10
    - Geometría: ${resultados.aciertos_geometria}/10
    - Cálculo y Álgebra: ${resultados.aciertos_calculo}/10
    - Tiempo empleado: ${resultados.tiempo_empleado_minutos ?? 0} minutos.

    Genera un diagnóstico pedagógico estructurado en texto plano (sin markdown complejo) en 3 partes:
    1. Fortalezas: Qué áreas domina basándote en los puntajes más altos y el tiempo.
    2. Oportunidades de mejora: Qué conceptos falló (puntajes más bajos).
    3. Plan de estudio: Una recomendación corta, directa y motivadora.
    `.trim();

    // Priorización de modelos: modelo ligero primero para fallback rápido y menor congestión
    const modelos = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    const TIMEOUT_MS = 20000;

    for (let i = 0; i < modelos.length; i++) {
        const nombreModelo = modelos[i];
        try {
            const response = await ai.models.generateContent({
                model: nombreModelo,
                contents: prompt,
                config: {
                    maxOutputTokens: 450,
                    thinkingConfig: {
                        thinkingBudget: 0,
                    },
                    abortSignal: AbortSignal.timeout(TIMEOUT_MS),
                },
            });

            if (response && response.text) {
                return response.text.trim();
            }
        } catch (error) {
            const causeDetail = error.cause ? (error.cause.message || error.cause.code || error.cause) : null;
            console.warn(
                `[GeminiService] Aviso: Error con modelo ${nombreModelo}: ${error.message}${causeDetail ? ` | Causa: ${causeDetail}` : ''}`
            );

            // Si aún quedan modelos de respaldo en la lista
            if (i < modelos.length - 1) {
                const es503 = error.status === 503 || error.statusCode === 503 || (error.message && error.message.includes('503'));
                // Aplicar un breve retraso (backoff) si hubo congestión o error de red antes de intentar con el siguiente
                const backoffMs = es503 ? 600 : 300;
                console.info(`[GeminiService] Pasando al modelo de respaldo con backoff de ${backoffMs}ms...`);
                await delay(backoffMs);
            } else {
                console.error('[GeminiService] Error conectando con Gemini en todos los modelos disponibles:', error);
                if (error.cause) {
                    console.error('[GeminiService] Detalle de causa raíz (error.cause):', error.cause);
                }
            }
        }
    }

    // Retorno amigable en texto plano si todos los modelos fallan
    return 'El diagnóstico de IA no está disponible en este momento. Por favor, revisa tus puntajes.';
};

module.exports = { generarDiagnosticoPedagogico };
