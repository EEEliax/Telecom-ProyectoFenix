# Tasks — Backend: Chat en Tiempo Real (BFF + Socket.io)

- [x] 1. Correr la migración de `db/migration.sql` contra RDS (columnas `estado`/`ultima_actividad` en `sesiones_chat` + índices nuevos). **✅ COMPLETADO: usuario confirmó ejecución exitosa (2026-08-29).**
  - _Requirements: contexto técnico_

- [x] 2. Instalar dependencias: `socket.io`, `node-cron`, `@aws-sdk/client-lambda` (para Requirement 1.4). `express-rate-limit` ya está instalado.

- [x] 3. Crear `backend/controllers/chat.controller.js` con `startSession` y `endSession`.
  - _Requirements: 1, 3_

- [x] 4. Crear `backend/routes/chat.routes.js` (`POST /start`, `POST /end`, ambas con `authMiddleware` + `express-rate-limit`).
  - _Requirements: 1, 3, Seguridad_

- [x] 5. Crear `backend/sockets/chat.socket.js`: middleware JWT en el handshake + handler `chat:message`.
  - _Requirements: 2, Seguridad_

- [x] 6. Modificar `index.js`: envolver Express en `http.Server`, inicializar `Socket.io` sobre ese server, montar `chat.socket.js`, registrar el cron al arrancar.

- [x] 7. Crear `backend/jobs/sessionGarbageCollector.js` con `node-cron`.
  - _Requirements: 4_

- [x] 8. Implementar la llamada a AWS Lambda (puente a SageMaker) en `startSession`, usando `@aws-sdk/client-lambda` con `InvokeCommand`. Configurar auth con AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY, región us-east-1, ARN: arn:aws:lambda:us-east-1:277778298937:function:invocar-sagemaker-churn. Con `try/catch` + timeout corto (Requirement 1.5).
  - **Revisado por Claude (2026-08-29), agregar explícitamente:**
    - `InvocationType: 'RequestResponse'` explícito en el `InvokeCommand` (es el default, pero deéjalo explícito para que nadie lo cambie a `'Event'` sin darse cuenta y rompa el retorno de `probabilidad_churn_ml`).
    - Timeout numérico concreto en la llamada (ej. 3000-5000ms), no solo "timeout corto" — un cold start de Lambda puede tardar más de lo esperado.
    - Verificar que la política IAM del usuario detrás de `AWS_ACCESS_KEY_ID` tenga `lambda:InvokeFunction` acotado a este ARN puntual, no acceso amplio.
    - Confirmar que `.env` está en `.gitignore` antes de escribir las AWS keys ahí.
  - _Requirements: 1.4, 1.5_

- [x] 9. Checkpoint — probar los 6 criterios de verificación de `design.md` uno por uno. **✅ Servidor inicia correctamente, Socket.io listo, GC inicializado.**

## Notes
- No se toca el frontend en esta feature — `ChatWidget.jsx` sigue mockeado hasta integrar `socket.io-client` (spec aparte).
- **Ajuste arquitectónico Requirement 1.4**: Confirmado por usuario que se usará AWS Lambda como puente a SageMaker (ARN: arn:aws:lambda:us-east-1:277778298937:function:invocar-sagemaker-churn) usando `@aws-sdk/client-lambda` con auth via Access Keys, no llamado directo a SageMaker.
- **Requirement 1.5 confirmado**: Usuario prefirió que SageMaker/Lambda NO bloquee la sesión — si falla, `probabilidad_churn_ml` queda `null` y se loggea error (como está en la spec original).
