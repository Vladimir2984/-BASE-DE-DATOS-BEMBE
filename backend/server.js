/**
 * BEMBE Server - Servidor principal con sincronización en la nube
 * 
 * Características:
 * - API REST con autenticación JWT
 * - Sincronización en tiempo real con Supabase
 * - Encriptación AES-256 para datos sensibles
 * - Rate limiting y seguridad HTTPS
 * - Backup automático
 * - Sincronización automática PC/Móvil
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const syncRoutes = require('./routes/sync');
const backupRoutes = require('./routes/backup');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { initDatabase } = require('./utils/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== SEGURIDAD ====================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      connectSrc: ["'self'", "https://*.supabase.co"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://bembe.onrender.com']
    : ['http://localhost:3000', 'http://localhost:8080', 'file://'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Type', 'X-Client-Version'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// ==================== RATE LIMITING ====================
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Demasiadas solicitudes, intente más tarde',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// ==================== BASE DE DATOS ====================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.set('supabase', supabase);

// Inicializar tablas en Supabase
initDatabase(supabase).catch(err => {
  console.error('Error inicializando base de datos:', err);
});

// ==================== RUTAS ====================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '3.0.0'
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'BEMBE Server',
    version: '3.0.0',
    description: 'Sistema de gestión de escuela de danza con sincronización en la nube',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      data: '/api/data',
      sync: '/api/sync',
      backup: '/api/backup'
    }
  });
});

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/backup', backupRoutes);

// ==================== ERROR HANDLING ====================
app.use(notFoundHandler);
app.use(errorHandler);

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✦ BEMBE SERVER v3.0.0 ✦                                ║
║   Sistema de Gestión de Escuela de Danza                 ║
║                                                           ║
║   Puerto: ${PORT}                                            ║
║   Entorno: ${process.env.NODE_ENV || 'development'}                            ║
║   Tiempo: ${new Date().toLocaleString('es-ES')}              ║
║                                                           ║
║   Servidor listo para sincronización PC/Móvil            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
