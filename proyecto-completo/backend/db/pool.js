const { Pool } = require('pg');

// ─── SSL ────────────────────────────────────────────────────────────────────
// Por defecto se valida el certificado del servidor (rejectUnauthorized: true),
// como corresponde en producción. Si se provee DB_SSL_CA (ruta a un archivo
// con el bundle de CA, ej. el de Amazon RDS: https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem)
// se usa ese CA para validar la cadena de confianza.
//
// Sólo se permite deshabilitar la verificación (inseguro, no usar en
// producción) definiendo explícitamente DB_SSL_REJECT_UNAUTHORIZED=false.
const fs = require('fs');

const sslRejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';

if (!sslRejectUnauthorized) {
  console.warn(
    '[WARN] DB_SSL_REJECT_UNAUTHORIZED=false: la verificación del certificado TLS ' +
    'de la base de datos está deshabilitada. No usar en producción.'
  );
}

const sslConfig = {
  rejectUnauthorized: sslRejectUnauthorized,
};

if (process.env.DB_SSL_CA) {
  sslConfig.ca = fs.readFileSync(process.env.DB_SSL_CA).toString();
}

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: sslConfig,
});

module.exports = pool;
