const db = require('../config/db');
const { obtenerResumenGeneral } = require('../services/resumen-service');

const resumen = async (req, res) => {
    try {
        const data = await obtenerResumenGeneral();
        res.json(data);
    } catch (error) {
        console.error('Error en resumen:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const resultados = async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT r.id_examen, e.nombre, e.correo, r.fecha_aplicacion, r.tiempo_empleado_minutos,
                    r.puntaje_global, r.aciertos_estadistica, r.aciertos_geometria, r.aciertos_calculo, r.diagnostico_ia
             FROM examenes_resultados r 
             JOIN estudiantes e ON e.id_estudiante = r.id_estudiante
             ORDER BY r.fecha_aplicacion DESC LIMIT 100`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error en resultados:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { resumen, resultados };