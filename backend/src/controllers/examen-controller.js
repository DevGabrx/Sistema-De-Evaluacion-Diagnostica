const db = require('../config/db');

const generarExamen = async (req, res) => {
    try {
        const query = `
            SELECT id_pregunta, id_componente, enunciado, 
                   opcion_a, opcion_b, opcion_c, opcion_d 
            FROM Preguntas 
            WHERE id_componente = $1 
            ORDER BY RANDOM() 
            LIMIT 10
        `;

        const [estadistica, geometria, calculo] = await Promise.all([
            db.query(query, [1]),
            db.query(query, [2]),
            db.query(query, [3])
        ]);

        // PostgreSQL devuelve los registros en la propiedad 'rows'
        let cuestionario = [
            ...estadistica.rows, 
            ...geometria.rows, 
            ...calculo.rows
        ];

        for (let i = cuestionario.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cuestionario[i], cuestionario[j]] = [cuestionario[j], cuestionario[i]];
        }

        res.json({
            total: cuestionario.length,
            preguntas: cuestionario
        });

    } catch (error) {
        console.error('Error generando examen:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { generarExamen };