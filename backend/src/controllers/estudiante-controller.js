const db = require('../config/db'); //[cite: 4]

const registrarEstudiante = async (req, res) => {
    try {
        const { nombre, correo, documento } = req.body;
        
        if (!nombre || !correo || !documento) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        const { rows } = await db.query(
            `INSERT INTO Estudiantes (nombre, correo, documento) 
             VALUES ($1, $2, $3) RETURNING *`,
            [nombre, correo, documento]
        );

        res.status(201).json({ mensaje: 'Estudiante creado exitosamente', usuario: rows[0] });
    } catch (error) {
        console.error('Error en registro:', error);
        // Manejo de error de duplicidad si el correo o documento son UNIQUE
        res.status(500).json({ error: 'Error al registrar el estudiante' });
    }
};

const loginEstudiante = async (req, res) => {
    try {
        const { correo, documento } = req.body;

        if (!correo || !documento) {
            return res.status(400).json({ error: 'Correo y documento son requeridos' });
        }

        const { rows } = await db.query(
            `SELECT * FROM Estudiantes WHERE correo = $1 AND documento = $2`,
            [correo, documento]
        );

        if (!rows.length) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        res.status(200).json({ mensaje: 'Login exitoso', usuario: rows[0] });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { registrarEstudiante, loginEstudiante };