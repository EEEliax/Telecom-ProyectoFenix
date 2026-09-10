'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Mitiga fuerza bruta / credential stuffing sobre /api/auth/login:
// máximo 10 intentos cada 15 minutos por IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de inicio de sesión. Intente nuevamente más tarde.' },
});

router.post('/login', loginLimiter, authController.login);

module.exports = router;
