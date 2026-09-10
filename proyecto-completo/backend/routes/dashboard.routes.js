'use strict';

const express = require('express');
const authMiddleware = require('../middleware/auth');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

// GET /api/dashboard/inicio - Datos de la página de inicio
router.get('/inicio', authMiddleware, dashboardController.getInicio);

// GET /api/dashboard/facturacion - Datos de facturación
router.get('/facturacion', authMiddleware, dashboardController.getFacturacion);

// GET /api/dashboard/servicios - Estado de servicios
router.get('/servicios', authMiddleware, dashboardController.getServicios);

// GET /api/dashboard/tickets/history - Historial de tickets
router.get('/tickets/history', authMiddleware, dashboardController.getTicketsHistory);

module.exports = router;