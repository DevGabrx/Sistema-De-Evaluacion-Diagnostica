const express = require('express');
const router = express.Router();
const { crearDiagnostico } = require('../controllers/ia-controller');

router.post('/diagnostico/:id', crearDiagnostico);

module.exports = router;