const { Pool } = require('pg');
const fs = require('fs');

const dbConfig = {
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

// Solo inyectamos la configuración SSL si la variable DB_SSL_ENABLED es true
if (process.env.DB_SSL_ENABLED === 'true') {
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

  // Agregamos la propiedad ssl al objeto de configuración solo si corresponde
  dbConfig.ssl = sslConfig;
}

const pool = new Pool(dbConfig);

module.exports = pool;