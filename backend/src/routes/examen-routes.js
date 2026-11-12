const express = require('express');
const { generarExamen } = require('../controllers/examen-controller');
const { enviarExamen } = require('../controllers/dashboard-controller');

const router = express.Router();

router.get('/', generarExamen);
router.post('/resultados', enviarExamen);

module.exports = router;
