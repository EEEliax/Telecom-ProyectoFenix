'use strict';

const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 *
 * Extracts the Bearer token from the Authorization header, verifies it,
 * and attaches the decoded payload to req.user before calling next().
 *
 * Responds HTTP 401 with a specific cause on any failure:
 *   - 'Token ausente'   — missing header or not in Bearer format
 *   - 'Token expirado'  — token is expired (TokenExpiredError)
 *   - 'Token inválido'  — signature invalid or any other jwt error
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];

    // Check header presence and Bearer format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token ausente' });
    }

    const token = authHeader.slice(7); // strip "Bearer " prefix

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    // JsonWebTokenError, NotBeforeError, or any other verification failure
    return res.status(401).json({ message: 'Token inválido' });
  }
}

module.exports = authMiddleware;
