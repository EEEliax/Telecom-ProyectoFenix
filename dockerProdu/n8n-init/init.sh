#!/bin/sh
# Inicialización de n8n. Corre una sola vez por volumen n8n_data:
#   1) crea las credenciales (Postgres y Ollama) con los MISMOS IDs que usan los JSON
#   2) importa los workflows de ../n8n-workflows
#   3) los publica (activa), para que los webhooks respondan sin entrar a la UI
# Los secretos salen de variables de entorno (.env), nunca del repo.

MARKER=/home/node/.n8n/.fenix-init-done

if [ -f "$MARKER" ] && [ "$FORCE_REIMPORT" != "1" ]; then
  echo "[n8n-init] Ya inicializado, no hago nada (usar FORCE_REIMPORT=1 para reimportar)."
  exit 0
fi

set -e

echo "[n8n-init] Creando credenciales..."
node -e '
const fs = require("fs");
const creds = [
  {
    id: "Dd3vs2GJa054Njlz",
    name: "Postgres account 2",
    type: "postgres",
    data: {
      host: "postgres",
      port: 5432,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      ssl: "disable",
      allowUnauthorizedCerts: false,
      maxConnections: 100,
      sshTunnel: false
    }
  },
  {
    id: "lNdCV1OQrnKyrrW3",
    name: "Ollama account",
    type: "ollamaApi",
    data: { baseUrl: "http://ollama:11434" }
  }
];
fs.writeFileSync("/tmp/credentials.json", JSON.stringify(creds));
'
n8n import:credentials --input=/tmp/credentials.json
rm -f /tmp/credentials.json

echo "[n8n-init] Importando workflows..."
n8n import:workflow --separate --input=/import

echo "[n8n-init] Publicando workflows..."
for f in /import/*.json; do
  id=$(node -p 'require(process.argv[1]).id' "$f")
  echo "[n8n-init]  -> workflow $id"
  if ! n8n publish:workflow --id="$id"; then
    echo "[n8n-init]  publish:workflow no disponible o fallo, pruebo update:workflow..."
    n8n update:workflow --id="$id" --active=true \
      || echo "[n8n-init] AVISO: no pude activar $id, activalo a mano en la UI de n8n."
  fi
done

touch "$MARKER"
echo "[n8n-init] Listo."
