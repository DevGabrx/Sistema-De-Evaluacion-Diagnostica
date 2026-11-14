// src/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const examenRoutes = require('./routes/examen-routes'); //[cite: 6]
const authRoutes = require('./routes/auth-routes'); // <-- NUEVO

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); //[cite: 6]
app.use(express.json()); //[cite: 6]

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/examenes', examenRoutes); //[cite: 6]
app.use('/api/dashboard', require('./routes/dashboard-routes')); //[cite: 6]
app.use('/api/ia', require('./routes/ia-routes'));

// Endpoint de prueba
app.get('/api/status', (req, res) => { //[cite: 6]
    res.json({ mensaje: 'API del Sistema de Evaluación funcionando correctamente' }); //[cite: 6]
}); //[cite: 6]

// Arranque del servidor
app.listen(PORT, () => { //[cite: 6]
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`); //[cite: 6]
}); //[cite: 6]