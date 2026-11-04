const db = require('../config/db');

const generarExamen = async (req, res) => {
    try {
        // Consulta base parametrizada (sin respuesta_correcta)
        const query = `
            SELECT id_pregunta, id_componente, enunciado, 
                   opcion_a, opcion_b, opcion_c, opcion_d 
            FROM Preguntas 
            WHERE id_componente = ? 
            ORDER BY RAND() 
            LIMIT 10
        `;

        // Ejecutar las 3 consultas concurrentemente para Estadística (1), Geometría (2) y Cálculo (3)
        const [estadistica, geometria, calculo] = await Promise.all([
            db.query(query, [1]),
            db.query(query, [2]),
            db.query(query, [3])
        ]);

        // Unir los resultados de los 3 componentes (mysql2 devuelve [rows, fields])
        let cuestionario = [
            ...estadistica[0], 
            ...geometria[0], 
            ...calculo[0]
        ];

        // Algoritmo de Fisher-Yates para mezclar aleatoriamente el array final
        for (let i = cuestionario.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cuestionario[i], cuestionario[j]] = [cuestionario[j], cuestionario[i]];
        }

        // Retornar las 30 preguntas listas para la interfaz iteractiva
        res.json({
            total: cuestionario.length,
            preguntas: cuestionario
        });

    } catch (error) {
        console.error('Error generando examen:', error);
        res.status(500).json({ error: 'Error interno del servidor al generar la prueba' });
    }
};

module.exports = {
    generarExamen
};