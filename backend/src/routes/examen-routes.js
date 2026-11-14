const express = require('express');
const router = express.Router();
const { generarExamen, guardarExamen } = require('../controllers/examen-controller');

router.get('/', generarExamen);
router.post('/guardar', guardarExamen);

module.exports = router;