const express = require('express');
const { generarExamen } = require('../controllers/examen-controller');

const router = express.Router();

router.get('/', generarExamen);

module.exports = router;