const db = require('../config/db');

const obtenerResumenGeneral = async () => {
    const [kpi, evo] = await Promise.all([
        db.query(`
            SELECT 
                COUNT(*)::int AS total_examenes,
                COUNT(DISTINCT id_estudiante)::int AS total_estudiantes,
                COALESCE(ROUND(AVG(puntaje_global), 1), 0)::float AS promedio,
                COALESCE(ROUND(AVG(tiempo_empleado_minutos), 1), 0)::float AS tiempo_promedio,
                COALESCE(ROUND(AVG(aciertos_estadistica), 1), 0)::float AS estadistica,
                COALESCE(ROUND(AVG(aciertos_geometria), 1), 0)::float AS geometria,
                COALESCE(ROUND(AVG(aciertos_calculo), 1), 0)::float AS calculo
            FROM examenes_resultados
        `),
        db.query(`
            SELECT 
                TO_CHAR(fecha_aplicacion, 'YYYY-MM-DD') AS dia,
                ROUND(AVG(puntaje_global), 1)::float AS promedio,
                COUNT(*)::int AS examenes
            FROM examenes_resultados 
            GROUP BY 1 
            ORDER BY 1 ASC
        `)
    ]);

    return {
        ...kpi.rows[0],
        evolucion: evo.rows
    };
};

module.exports = { obtenerResumenGeneral };