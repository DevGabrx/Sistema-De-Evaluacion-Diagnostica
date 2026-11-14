const { generarYGuardarDiagnostico } = require('../services/gemini-service');

const crearDiagnostico = async (req, res) => {
    try {
        const idExamen = Number(req.params.id);
        const diagnostico_ia = await generarYGuardarDiagnostico(idExamen);

        if (!diagnostico_ia) {
            return res.status(404).json({ error: 'Examen no encontrado' });
        }

        res.json({ id_examen: idExamen, diagnostico_ia });
    } catch (error) {
        console.error('Error en IA Controller:', error);
        res.status(502).json({ error: 'No se pudo generar el diagnóstico con Gemini' });
    }
};

module.exports = { crearDiagnostico };