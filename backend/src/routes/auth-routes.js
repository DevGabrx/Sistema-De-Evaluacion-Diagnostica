// src/routes/auth-routes.js
const express = require('express');
const router = express.Router();
const { registrarEstudiante, loginEstudiante } = require('../controllers/estudiante-controller');

// POST /api/auth/registro
router.post('/registro', registrarEstudiante);

// POST /api/auth/login
router.post('/login', loginEstudiante);

module.exports = router;