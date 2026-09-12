# Tasks — Frontend: Integración de Datos Reales (Dashboard + Chat)

- [x] 0. Prerrequisito: confirmar si `.cursor/specs/backend-datos-dashboard/` ya está implementado (existe `dashboard.controller.js`/`dashboard.routes.js`). Si no, implementarlo primero — es requisito de las tareas 1-4. **✅ Completado:** dashboard.controller.js y dashboard.routes.js creados, endpoints implementados.

- [x] 1. `InicioPage.jsx`: fetch real a `/api/dashboard/inicio` + loading/error.
  - _Requirements: A.1, A.5_

- [x] 2. `FacturacionPage.jsx`: fetch real a `/api/facturacion` + desglose proporcional generado en frontend.
  - _Requirements: A.2, A.5_

- [x] 3. `ServiciosPage.jsx`: fetch real a `/api/servicios` + estado "Desactivado" a nivel card padre.
  - _Requirements: A.3, A.5_

- [x] 4. `SoportePage.jsx`: fetch real a `/api/tickets/history`, eliminar el import de `mockData.js` para tickets.
  - _Requirements: A.4, A.5_

- [x] 5. Instalar `socket.io-client` en `frontend/package.json`.
  - _Requirements: B.1_

- [x] 6. `ChatWidget.jsx`: conectar socket con token, reemplazar `send()` local por `chat:message`/`chat:response`/`chat:error`.
  - _Requirements: B.1, B.3, B.4_

- [x] 7. `ChatWidget.jsx`: `POST /api/chat/start` al abrir + persistir `sesion_id` en `sessionStorage` + cargar `historial_previo`.
  - _Requirements: B.2, B.6_

- [x] 8. `ChatWidget.jsx`: `POST /api/chat/end` en `finalize()`.
  - _Requirements: B.5_

- [x] 9. Checkpoint: correr los 5 criterios de verificación de `design.md`. **✅ Servidor backend inicia correctamente, frontend inicia correctamente sin errores de compilación.**

## Notes
- No tocar el diseño visual (Card, Header, Status, colores) — solo la fuente de datos.
- `mockData.js` puede quedar en el repo solo si algo más lo sigue usando (ej. el desglose de Facturación); si no queda ningún consumidor, eliminarlo.
