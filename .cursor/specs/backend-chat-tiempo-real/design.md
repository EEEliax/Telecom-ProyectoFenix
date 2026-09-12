# Design — Backend: Chat en Tiempo Real (BFF + Socket.io)

## Overview
Express pasa de simple proxy hacia n8n a dueño de la sesión y de la persistencia. n8n deja de manejar el bucle turno a turno — solo recibe (Flujo 1) el mensaje individual + contexto y devuelve la respuesta del LLM, y (Flujo 2) procesa el cierre de forma asíncrona.

## Componentes nuevos
```
backend/
├── controllers/
│   └── chat.controller.js         ← REEMPLAZA la versión V1 (proxy simple sin persistencia)
├── routes/
│   └── chat.routes.js             ← REEMPLAZA: ahora solo POST /start y POST /end (el loop es WS, no HTTP)
├── sockets/
│   └── chat.socket.js             ← nuevo: io.use() JWT en el handshake + handler del mensaje
├── jobs/
│   └── sessionGarbageCollector.js ← nuevo: node-cron, Requirement 4
└── index.js                        ← modificado: http.Server + Socket.io sobre el mismo server, registra el cron al arrancar
```

## Estado en memoria (Requirement 1.6)
```javascript
// Map simple en memoria de proceso, no Redis (no hace falta a esta escala)
const sessionContext = new Map(); // sesion_id -> { clientProfile, churnProbability }
```
**Tradeoff documentado:** si Express se reinicia, este contexto se pierde para sesiones activas — pero el historial en Postgres sí sobrevive, así que la conversación no se pierde, solo el contexto cacheado (se puede recalcular en la próxima llamada al Flujo 1). Aceptable para el volumen actual del proyecto.

## POST /api/chat/start
```sql
SELECT c.gender, c.tenure_meses, c.senior_citizen, c.partner, c.dependents,
       cc.monthly_charges, cc.total_charges, cc.paperless_billing,
       tc.descripcion AS contract_type, mp.descripcion AS payment_method
FROM clientes c
JOIN cuentas_contrataciones cc ON cc.customer_id = c.customer_id
JOIN tipos_contrato tc ON cc.tipo_contrato_id = tc.id
JOIN metodos_pago mp ON cc.metodo_pago_id = mp.id
WHERE c.customer_id = $1;

-- + servicios activos (mismo patrón que /api/servicios de backend-datos-dashboard)
SELECT sc.nombre_servicio, sc.categoria, csp.estado_servicio
FROM cliente_servicios_pivot csp
JOIN servicios_catalogo sc ON csp.servicio_id = sc.id
WHERE csp.customer_id = $1;
```

**⚠️ CORREGIDO 2026-08-30 — la query original de esta sección estaba mal y ya fue implementada así por Devin, hay que parchearla:** faltaban `total_charges`, `senior_citizen`, `partner`, `dependents`, `paperless_billing`, el nombre del tipo de contrato (se mandaba el `tipo_contrato_id` numérico en vez de `tc.descripcion`), el método de pago, y todos los servicios (Internet/Teléfono/etc). Además se estaba mandando `churn_historico`, que es el target de entrenamiento, no un input válido. El payload final a Lambda debe reconstruirse en JS con las keys exactas que espera el modelo (`Contract`, `InternetService`, `OnlineSecurity`, `TechSupport`, `PhoneService`, `tenure`, `MonthlyCharges`, `TotalCharges`, `PaperlessBilling`, `SeniorCitizen` como 0/1, `Partner`/`Dependents` como 'Yes'/'No', `gender`, `PaymentMethod`) — **pendiente confirmar con el usuario los strings exactos de `tipos_contrato.descripcion`** antes de implementar el fix.
Flujo: (1) ¿vino `sesion_id` propio y `estado='abierta'`? → reconexión, saltar a (4). (2) si no, `INSERT INTO sesiones_chat (...) VALUES (..., 'abierta', NOW())`, resolviendo/creando `contacto_id` en `crm_contactos`. (3) query de perfil + AWS Lambda (try/catch, timeout corto) usando `@aws-sdk/client-lambda` con `InvokeCommand` (ARN: arn:aws:lambda:us-east-1:277778298937:function:invocar-sagemaker-churn, auth via AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY). (4) `sessionContext.set(sesion_id, {...})`. (5) `SELECT * FROM historial_mensajes WHERE sesion_id=$1 ORDER BY fecha_hora ASC`. (6) responder `{ sesion_id, historial_previo }`.

## Socket.io — chat.socket.js
```javascript
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch { next(new Error('unauthorized')); }
});

io.on('connection', (socket) => {
  socket.on('chat:message', async ({ sesion_id, contenido_texto }) => {
    // 1. Validar que sesion_id pertenece a socket.user.customer_id
    // 2. INSERT historial_mensajes (usuario) + UPDATE sesiones_chat.ultima_actividad
    // 3. POST síncrono al Flujo 1 de n8n (mensaje + sesion_id + sessionContext si aplica)
    // 4. INSERT historial_mensajes (bot)
    // 5. socket.emit('chat:response', { contenido_texto, fecha_hora })
  });
});
```

## POST /api/chat/end
```sql
UPDATE sesiones_chat SET estado = 'cerrada'
WHERE id = $1 AND contacto_id IN (SELECT id FROM crm_contactos WHERE customer_id = $2);
```
Luego `axios.post(N8N_CLOSE_WEBHOOK_URL, { sesion_id }).catch(err => console.error(...))` — sin `await` antes del `res.status(200)` (fire-and-forget real).

## Garbage Collector — sessionGarbageCollector.js
```javascript
cron.schedule('*/30 * * * *', async () => {
  const { rows } = await pool.query(
    `UPDATE sesiones_chat SET estado = 'cerrada_por_inactividad'
     WHERE estado = 'abierta' AND ultima_actividad < NOW() - INTERVAL '2 hours'
     RETURNING id`
  );
  for (const row of rows) {
    axios.post(N8N_CLOSE_WEBHOOK_URL, { sesion_id: row.id }).catch(err => console.error(...));
  }
  console.log(`[GC] ${rows.length} sesiones cerradas por inactividad`);
});
```

## Consideraciones futuras (fuera de alcance ahora)
- **Escalado horizontal:** más de una instancia de Express detrás de un load balancer necesita el adaptador Redis de Socket.io (`@socket.io/redis-adapter`) — no aplica a la escala actual.
- **Integración frontend:** `ChatWidget.jsx` necesita `socket.io-client` — spec aparte.

## Criterios de verificación
| Requirement | Verificación |
|---|---|
| 1.1–1.2 | Abrir el chat sin sesion_id crea fila nueva; recargar con el mismo sesion_id lo reutiliza y trae historial |
| 1.5 | Simular fallo de SageMaker y confirmar que la sesión igual se crea, con `probabilidad_churn_ml: null` |
| 2.1 | Conectar el socket sin token o con token inválido SHALL rechazar la conexión |
| 2.3–2.4 | Simular fallo de INSERT o de n8n y confirmar que no aparecen mensajes fantasma |
| 3.1–3.3 | `POST /api/chat/end` responde 200 sin esperar a n8n |
| 4.1–4.3 | Adelantar `ultima_actividad` manualmente, correr el cron y confirmar que cambia el estado y dispara el webhook |
