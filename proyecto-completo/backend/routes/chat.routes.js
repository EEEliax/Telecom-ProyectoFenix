'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/auth');
const chatController = require('../controllers/chat.controller');

const router = express.Router();

// Rate limiting para endpoints de chat (por customer_id, no solo por IP)
const chatRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite por windowMs
  keyGenerator: (req) => req.user?.customer_id || req.ip,
  message: { message: 'Demasiadas solicitudes, intenta más tarde' },
});

// POST /api/chat/start - Inicializar/reconectar sesión
router.post('/start', authMiddleware, chatRateLimit, chatController.startSession);

// POST /api/chat/end - Cerrar sesión manualmente
router.post('/end', authMiddleware, chatRateLimit, chatController.endSession);

module.exports = router;