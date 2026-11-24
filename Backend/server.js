/*require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { PORT } = require('./src/config/env');
const usuariosService = require('./src/services/usuariosService');
const ofertasService = require('./src/services/ofertasService');
const ofertasService = require('./src/services/ofertasService');

const app = express();

// Middlewares globales
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());
app.use('/uploads/ofertas', express.static(path.join(__dirname, 'uploads', 'ofertas')));

// Rutas
app.use('/api/reportes', require('./src/routes/reportes'));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/ofertas', require('./src/routes/ofertas'));
app.use('/api/inscripciones', require('./src/routes/inscripciones'));
app.use('/api/usuarios', require('./src/routes/usuarios'));
app.use('/api/carreras', require('./src/routes/carreras'));

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

const purgarEstudiantesVencidos = () => usuariosService.purgarVencidos()
  .catch(err => console.error('Error al purgar estudiantes vencidos:', err.message));
purgarEstudiantesVencidos();
setInterval(purgarEstudiantesVencidos, 60 * 60 * 1000).unref();

const purgarOfertasVencidas = () => ofertasService.purgarVencidas()
  .catch(err => console.error('Error al purgar ofertas vencidas:', err.message));
purgarOfertasVencidas();
setInterval(purgarOfertasVencidas, 60 * 60 * 1000).unref();

const purgarOfertasVencidas = () => ofertasService.purgarVencidas()
  .catch(err => console.error('Error al purgar ofertas vencidas:', err.message));
purgarOfertasVencidas();
setInterval(purgarOfertasVencidas, 60 * 60 * 1000).unref();

// Iniciar servidor
app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`));*/

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { PORT } = require('./src/config/env');

const app = express();

// Middlewares globales (Actualizado para permitir conexiones desde tu celular en la red local)
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://192.168.1.37:5173', // IP local de tu PC para Vite
    'http://192.168.1.37:5174'  // Puerto alternativo por si acaso
  ],
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/reportes', require('./src/routes/reportes'));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/ofertas', require('./src/routes/ofertas'));
app.use('/api/inscripciones', require('./src/routes/inscripciones'));
app.use('/api/usuarios', require('./src/routes/usuarios'));
app.use('/api/carreras', require('./src/routes/carreras'));

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Iniciar servidor ('0.0.0.0' permite que escuche peticiones externas de tu red Wi-Fi)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend corriendo y accesible en red local en el puerto ${PORT}`);
});
