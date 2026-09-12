# Tasks — Backend: Datos Reales del Dashboard

- [x] 1. Crear `backend/controllers/dashboard.controller.js` con las 4 funciones (`getInicio`, `getFacturacion`, `getServicios`, `getTicketsHistory`), cada una en `try/catch`, usando `pool.query` con parámetros.
  - _Requirements: 1, 2, 3, 4, Seguridad_

- [x] 2. Crear `backend/routes/dashboard.routes.js`, registrando los 4 GET, todos con `authMiddleware`.
  - _Requirements: Seguridad_

- [x] 3. Registrar las rutas en `index.js` bajo `/api/dashboard`.

- [x] 4. Implementar `getInicio` (Endpoint 1).
  - _Requirements: 1_

- [x] 5. Implementar `getFacturacion` (Endpoint 2).
  - _Requirements: 2_

- [x] 6. Implementar `getServicios` (Endpoint 3), con el mapeo de categorías → estructura jerárquica en JS.
  - _Requirements: 3_

- [x] 7. Implementar `getTicketsHistory` (Endpoint 4), con el join de 3 tablas.
  - _Requirements: 4_

- [x] 8. Conectar el frontend: reemplazar los mocks de `InicioPage`, `FacturacionPage`, `ServiciosPage`, `SoportePage` por `fetch`/`axios` a estos 4 endpoints, usando el JWT ya disponible vía `useAuth`.

- [x] 9. Checkpoint — probar con al menos 2 customer_id reales: uno con Internet+Teléfono activos y con tickets, otro sin Internet o sin tickets, para validar los casos "vacío"/"desactivado".

## Notes
- No se toca `chat.controller.js` ni `chat.routes.js` en esta feature — la persistencia de chat es una spec aparte.
- El botón "Nuevo ticket" y el ChatWidget siguen abriendo el chat mockeado; no se conectan a estos endpoints (son solo de lectura de cuentas/servicios/tickets ya existentes).
