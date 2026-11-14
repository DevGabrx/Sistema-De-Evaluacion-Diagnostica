const express = require('express');
const router = express.Router();
const { resumen, resultados } = require('../controllers/dashboard-controller');

router.get('/resumen', resumen);
router.get('/resultados', resultados);

module.exports = router;