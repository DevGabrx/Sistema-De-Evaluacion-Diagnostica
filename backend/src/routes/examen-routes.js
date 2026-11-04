const express = require('express');
const router = express.Router();
const { generarExamen } = require('../controllers/examen.controller');

// Ruta GET para obtener las 30 preguntas
router.get('/generar', generarExamen);

module.exports = router;