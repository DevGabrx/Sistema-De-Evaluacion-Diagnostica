const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Endpoint de prueba
app.get('/api/status', (req, res) => {
    res.json({ mensaje: 'API del Sistema de Evaluación funcionando correctamente' });
});

// Arranque del servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});