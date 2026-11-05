const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const examenRoutes = require('./routes/examen-routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

app.use('/api/examenes', examenRoutes)

// Endpoint de prueba
app.get('/api/status', (req, res) => {
    res.json({ mensaje: 'API del Sistema de Evaluación funcionando correctamente' });
});

// Arranque del servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});