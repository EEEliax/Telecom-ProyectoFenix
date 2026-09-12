# Requirements — Backend: Chat en Tiempo Real (BFF + Socket.io)

## Introduction
Pivot de arquitectura del chat: Express pasa a ser un verdadero BFF que orquesta la sesión, persiste cada mensaje, y delega a n8n solo el trabajo pesado (LLM por mensaje, procesamiento de cierre). Reemplaza el diseño anterior de `POST /api/chat/message` por turno HTTP — el bucle de conversación ahora usa WebSockets (Socket.io). n8n se divide en 2 flujos: Flujo 1 (Cerebro LLM, LangChain con memoria) y Flujo 2 (Procesamiento de Cierre).

Esta spec reemplaza, en lo referido a la mensajería del chat, el contrato anterior documentado en `Proyecto Fénix V2 - Arquitectura.md` (vault). El fire-and-forget de cierre se mantiene conceptualmente igual, solo cambia de `/api/chat/close` a `/api/chat/end` y se le suma el Garbage Collector.

## Contexto técnico ya verificado
- `middleware/auth.js` ya valida JWT en rutas HTTP — se reutiliza la misma lógica (`jwt.verify` con el mismo `JWT_SECRET`) para el handshake de Socket.io.
- El JWT trae `customer_id` — se usa para resolver `crm_contactos`/cliente sin pedirle nada al frontend.
- `db/pool.js` (pg) y su SSL se reutilizan sin cambios.
- `sesiones_chat` NO tenía columnas de estado/actividad — se agregan en esta feature (`estado`, `ultima_actividad`), ver `db/migration.sql`.

## Requirements

### Requirement 1 — POST /api/chat/start (inicialización de sesión)
1.1 SI el frontend no envía un `sesion_id` existente, THE endpoint SHALL crear una fila nueva en `sesiones_chat` (`estado = 'abierta'`, `ultima_actividad = NOW()`), resolviendo/creando `contacto_id` en `crm_contactos` por `customer_id` del JWT.
1.2 SI el frontend envía un `sesion_id` existente que pertenece al `customer_id` del JWT y tiene `estado = 'abierta'`, THE endpoint SHALL tratarlo como reconexión: no crea sesión nueva, devuelve el historial de `historial_mensajes` para ese `sesion_id`.
1.3 THE endpoint SHALL ejecutar una única consulta SQL combinada (JOIN `clientes` + `cuentas_contrataciones`) para el contexto del cliente.
1.4 THE endpoint SHALL invocar una única vez a una función AWS Lambda (ARN: arn:aws:lambda:us-east-1:277778298937:function:invocar-sagemaker-churn) que actúa como puente hacia SageMaker para obtener `probabilidad_churn_ml` inicial. La invocación SHALL usar AWS SDK v3 (`@aws-sdk/client-lambda`) con `InvokeCommand`, autenticación via AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY (región us-east-1).
1.5 SI la llamada a la función Lambda falla o excede el timeout, THE endpoint SHALL continuar sin bloquear la sesión — `probabilidad_churn_ml` queda `null` y se loggea la falla server-side. **Confirmado por usuario:** comportamiento no bloqueante es el deseado.
1.6 THE endpoint SHALL guardar el perfil del cliente + `probabilidad_churn_ml` en memoria de proceso (Map por `sesion_id`), NO en Postgres — es contexto de trabajo para el Flujo 1 de n8n, no un dato de negocio a persistir.
1.7 THE endpoint SHALL devolver `{ sesion_id, historial_previo }`.

### Requirement 2 — Bucle de conversación (Socket.io)
2.1 THE conexión de Socket.io SHALL validar el JWT en el handshake (`socket.handshake.auth.token`) antes de aceptar la conexión.
2.2 AL recibir un mensaje por WebSocket, THE servidor SHALL, en orden: (a) `INSERT` inmediato en `historial_mensajes` (remitente='usuario') + actualizar `sesiones_chat.ultima_actividad`, (b) `POST` HTTP síncrono al Flujo 1 de n8n con el mensaje + `sesion_id`, (c) `INSERT` de la respuesta del bot, (d) emitir la respuesta por WebSocket.
2.3 SI el `INSERT` del paso (a) falla, THE servidor SHALL NO llamar a n8n — sin persistencia garantizada no hay conversación.
2.4 SI la llamada a n8n falla o excede el timeout, THE servidor SHALL emitir un error al frontend sin insertar una respuesta de bot falsa.

### Requirement 3 — POST /api/chat/end (cierre manual)
3.1 THE endpoint SHALL actualizar `sesiones_chat.estado = 'cerrada'` para el `sesion_id` recibido, validado contra el `customer_id` del JWT.
3.2 THE endpoint SHALL disparar el Flujo 2 de n8n (POST fire-and-forget, sin esperar respuesta) pasando `sesion_id`.
3.3 THE endpoint SHALL responder `200 OK` inmediatamente después de disparar el webhook, sin esperar a que n8n termine su procesamiento.

### Requirement 4 — Garbage Collector de sesiones zombie (cron)
4.1 THE cron (node-cron) SHALL ejecutarse cada 30 minutos.
4.2 THE cron SHALL buscar sesiones con `estado = 'abierta'` y `ultima_actividad < NOW() - INTERVAL '2 hours'`.
4.3 POR CADA sesión encontrada, THE cron SHALL actualizar `estado = 'cerrada_por_inactividad'` y disparar el mismo webhook fire-and-forget del Requirement 3.2.
4.4 THE cron SHALL loggear cuántas sesiones procesó por corrida (server-side, no expuesto por API).

## Seguridad
- `/api/chat/start`, `/api/chat/end` y el handshake de Socket.io SHALL validar JWT.
- `express-rate-limit` SHALL aplicarse a `/api/chat/start` y a la emisión de mensajes por WebSocket (por `customer_id`, no solo por IP).
- Ninguna query SHALL construirse por concatenación de strings.
- Variables de entorno requeridas nuevas: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` (us-east-1) para la llamada a Lambda. Validar su presencia al arrancar el servidor.

## Fuera de alcance (explícito)
- Cambios al Flujo 1/Flujo 2 de n8n en sí — responsabilidad de n8n, no de este backend.
- Integración de `socket.io-client` en `ChatWidget.jsx` (hoy 100% mockeado) — spec aparte, posterior.
- Escalado horizontal de Socket.io (adaptador Redis, sticky sessions) — no aplica a la escala actual, documentado como consideración futura en design.md.
