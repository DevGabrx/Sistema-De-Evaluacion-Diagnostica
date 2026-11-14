const express = require('express');
const router = express.Router();
const { registrarEstudiante, loginEstudiante } = require('../controllers/estudiante-controller');

router.post('/registro', registrarEstudiante);

router.post('/login', loginEstudiante);

module.exports = router;