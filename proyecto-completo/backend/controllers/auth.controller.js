'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

/**
 * POST /api/auth/login
 *
 * Validation order (strict, immovable):
 *   1. Input validation  — email/password presence, emptiness, max length
 *   2. DB JOIN query     — fetch user + churn via JOIN with clientes
 *   3. Churn check       — reject before bcrypt if churn === 1
 *   4. bcrypt compare    — verify password against stored hash
 *   5. JWT sign          — return token on success
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // ── Paso 1: Validación de entrada ──────────────────────────────────────
    // Check email first, then password
    if (
      email === undefined ||
      email === null ||
      String(email).trim() === ''
    ) {
      return res.status(400).json({ message: "El campo 'email' es inválido o está ausente" });
    }

    if (String(email).length > 254) {
      return res.status(400).json({ message: "El campo 'email' es inválido o está ausente" });
    }

    if (
      password === undefined ||
      password === null ||
      String(password).trim() === ''
    ) {
      return res.status(400).json({ message: "El campo 'password' es inválido o está ausente" });
    }

    if (String(password).length > 128) {
      return res.status(400).json({ message: "El campo 'password' es inválido o está ausente" });
    }

    // ── Paso 2: JOIN con clientes ──────────────────────────────────────────
    const result = await pool.query(
      'SELECT u.id, u.email, u.password_hash, u.customer_id, c.churn_historico as churn FROM usuarios u JOIN clientes c ON u.customer_id = c.customer_id WHERE u.email = $1',
      [email]
    );


    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const row = result.rows[0];

    // ── Paso 3: Churn check (ANTES de bcrypt) ─────────────────────────────
    if (row.churn === true) {
      return res.status(403).json({ message: 'Cuenta inactiva o cliente dado de baja' });
    }

    // ── Paso 4: bcrypt ────────────────────────────────────────────────────
    const passwordMatch = await bcrypt.compare(password, row.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // ── Paso 5: JWT ───────────────────────────────────────────────────────
    const token = jwt.sign(
      { userId: row.id, 
        email: row.email,
        customer_id: row.customer_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({ token });

  } catch (err) {
    // Log server-side para diagnóstico; nunca exponer el stack trace al cliente
    console.error('[auth.controller] Error inesperado en login:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

module.exports = { login };
