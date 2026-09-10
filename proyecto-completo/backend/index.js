// IMPORTANT: dotenv.config() must be the very first instruction
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./db/pool');

// ─── 1. Validate required environment variables ───────────────────────────────
const REQUIRED_ENV_VARS = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'N8N_WEBHOOK_URL',
  'N8N_CLOSE_WEBHOOK_URL',
  'CORS_ALLOWED_ORIGINS',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
];

for (const varName of REQUIRED_ENV_VARS) {
  if (!process.env[varName]) {
    console.error(`[ERROR] Variable de entorno requerida no definida: ${varName}`);
    process.exit(1);
  }
}

// ─── 2. Router imports ───────────────────────────────────────────────────────
const authRouter = require('./routes/auth.routes');
const chatRouter = require('./routes/chat.routes');
const dashboardRouter = require('./routes/dashboard.routes');

// ─── 3. Socket.io and Cron imports ───────────────────────────────────────────
const initializeChatSocket = require('./sockets/chat.socket');
const initializeGarbageCollector = require('./jobs/sessionGarbageCollector');

// ─── 4. Async IIFE — DB check + server startup ───────────────────────────────
(async () => {
  // Verify DB connectivity before mounting routes
  try {
    await pool.query('SELECT 1');
    console.log('[INFO] Conexión a PostgreSQL establecida correctamente.');
  } catch (err) {
    console.error('[ERROR] No se pudo conectar a PostgreSQL:', err.message);
    process.exit(1);
  }

  const app = express();
  app.locals.pool = pool; // requerido por chat.controller.js (req.app.locals.pool)

  // ─── 5. Middlewares ────────────────────────────────────────────────────────
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
    .split(',')
    .map((s) => s.trim());

  app.use(helmet());

  app.use(
    cors({
      origin: allowedOrigins,
    })
  );

  app.use(express.json({ limit: '1mb' }));

  // ─── 6. Routes ────────────────────────────────────────────────────────────
  app.use('/api/auth', authRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/dashboard', dashboardRouter);

  // ─── 7. Create HTTP server and initialize Socket.io ─────────────────────────
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
    },
  });

  // ─── 8. Initialize Socket.io handler ─────────────────────────────────────────
  // Pasar io y pool al handler de sockets
  io.use((socket, next) => {
    socket.app = { locals: { pool } };
    next();
  });

  initializeChatSocket(io);

  // ─── 9. Initialize Garbage Collector ────────────────────────────────────────
  initializeGarbageCollector(pool);

  // ─── 10. Start HTTP listener ───────────────────────────────────────────────
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`[INFO] Servidor HTTP escuchando en el puerto ${PORT}`);
    console.log(`[INFO] Socket.io inicializado y listo para conexiones.`);
  });
})();