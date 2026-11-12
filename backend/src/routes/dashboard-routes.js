const express = require('express');
const { resumen, resultados, generarDiagnosticoIA } = require('../controllers/dashboard-controller');

const router = express.Router();

router.get('/resumen', resumen);
router.get('/resultados', resultados);
router.post('/diagnostico/:id', generarDiagnosticoIA);

module.exports = router;
