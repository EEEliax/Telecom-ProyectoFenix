# Requirements — Frontend: Integración de Datos Reales (Dashboard + Chat)

## Introduction
Cierra el círculo: reemplaza los mocks del portal por datos y chat reales. Depende de `backend-datos-dashboard` (ya speceado, verificar si ya está implementado) y `backend-chat-tiempo-real` (ya implementado y verificado, con los 2 bugs corregidos). Cubre las 4 vistas del dashboard y el `ChatWidget`.

## Contexto técnico ya verificado
- Token JWT: `getToken()` en `frontend/src/utils/auth.js`, guardado en `sessionStorage` bajo la key `'token'`. Ya existe `isTokenValid()` y `removeToken()` en el mismo archivo.
- Socket.io corre sobre el mismo `http.Server` que Express (mismo origen, mismo puerto) — el cliente no necesita una URL distinta.
- `ChatWidget.jsx` hoy es 100% local (`useState`, mensaje de respuesta hardcodeado "Gracias por tu mensaje...") — se reemplaza el `send()` local, no todo el componente.

## Requirements

### Requirement A — Dashboard: reemplazar mocks por datos reales
A.1 `InicioPage.jsx` SHALL hacer fetch a `/api/dashboard/inicio` con `Authorization: Bearer ${getToken()}`, reemplazando `Fibra Hogar 300`/`$24.990`/`300 Mbps` por `internetService` y `monthlyCharges` reales. Los Mbps siguen inventados en frontend (no vienen del backend).
A.2 `FacturacionPage.jsx` SHALL consumir `/api/facturacion` (`activeServices`, `monthlyCharges`, `contractType`, `paymentMethod` reales), generando en frontend el desglose de montos por ítem (mock proporcional que suma exacto a `monthlyCharges`).
A.3 `ServiciosPage.jsx` SHALL consumir `/api/servicios`, reflejando el estado activo/inactivo real por card, incluyendo "Desactivado" a nivel card padre si no está contratado.
A.4 `SoportePage.jsx` SHALL consumir `/api/tickets/history`, reemplazando el import de `mockData.js` por los tickets reales del cliente logueado.
A.5 CADA vista SHALL mostrar un estado de carga mientras espera la respuesta, y un estado de error legible si el fetch falla — nunca pantalla en blanco o datos `undefined`.
A.6 El método de pago (tarjeta enmascarada) y el consumo del ciclo en Inicio, el historial de facturación y "Pagar Ahora" en Facturación, y "Upgrade Plan" en Servicios SHALL seguir 100% mockeados — no tienen endpoint, por diseño ya acordado.

### Requirement B — ChatWidget: conectar a Socket.io real
B.1 `ChatWidget.jsx` SHALL instalar y usar `socket.io-client`, conectando con `auth: { token: getToken() }`.
B.2 AL abrirse el chat, THE componente SHALL llamar `POST /api/chat/start` (enviando el `sesion_id` guardado en `sessionStorage` si existe, para reconexión). SI la respuesta trae `historial_previo` con mensajes, THE componente SHALL cargarlos en el estado de mensajes. SI `historial_previo` viene vacío (sesión nueva), THE componente SHALL mostrar un único mensaje de bienvenida estático (no viene del backend, sigue siendo mock) que invite al cliente a detallar su consulta o problema — esto ayuda a que el primer mensaje real del cliente tenga contenido útil para el LLM y el modelo de churn, en vez de un saludo genérico tipo "Hola".
B.3 AL enviar un mensaje, THE componente SHALL emitir `chat:message` por el socket (elimina la respuesta local hardcodeada) y esperar el evento `chat:response`.
B.4 SI el socket emite `chat:error`, THE componente SHALL mostrarlo como mensaje visible en el chat, no fallar en silencio.
B.5 AL confirmar "Finalizar Chat", THE componente SHALL llamar `POST /api/chat/end` con el `sesion_id` actual, limpiar el `sesion_id` de `sessionStorage`, y recién ahí resetear el estado local (como ya hace `finalize()`).
B.6 EL `sesion_id` activo SHALL guardarse en `sessionStorage` para sobrevivir un refresh de página, consistente con el Requirement 1.2 del backend (reconexión).

## Fuera de alcance
- Cualquier cambio a los 4 endpoints GET ni al backend de chat — ya están definidos/implementados, no se tocan acá.
- UI de "adjuntar ticket anterior" — backlog futuro.
