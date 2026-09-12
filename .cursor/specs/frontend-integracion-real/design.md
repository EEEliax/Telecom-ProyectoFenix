# Design — Frontend: Integración de Datos Reales (Dashboard + Chat)

## Overview
Dos frentes independientes, mismo patrón: `getToken()` para autenticar, loading/error states, sin tocar el diseño visual ya aprobado (Card, Header, Status, colores).

## Dashboard — patrón por página (repetir en las 4, cambiando la URL)
```javascript
import { getToken } from '../utils/auth';

useEffect(() => {
  fetch('/api/dashboard/inicio', { headers: { Authorization: `Bearer ${getToken()}` } })
    .then(r => r.json())
    .then(setData)
    .catch(() => setError(true))
    .finally(() => setLoading(false));
}, []);
```

## ChatWidget — conexión de socket
```javascript
import { io } from 'socket.io-client';
import { getToken } from '../utils/auth';

const socket = io({ auth: { token: getToken() } }); // mismo origen, mismo puerto que Express

useEffect(() => {
  socket.on('chat:response', (msg) =>
    setMessages((c) => [...c, { from: 'bot', text: msg.contenido_texto }])
  );
  socket.on('chat:error', (err) =>
    setMessages((c) => [...c, { from: 'bot', text: `⚠️ ${err.message}` }])
  );
  return () => {
    socket.off('chat:response');
    socket.off('chat:error');
  };
}, []);
```
- Al abrir (Requirement B.2): `POST /api/chat/start` con `sesion_id` de `sessionStorage` si existe → guardar el `sesion_id` devuelto → si vino `historial_previo`, usarlo como estado inicial de mensajes en vez de `welcome`.
- En `send()` (Requirement B.3): `socket.emit('chat:message', { sesion_id, contenido_texto: text })` en vez de la respuesta local hardcodeada.
- En `finalize()` (Requirement B.5): `POST /api/chat/end` con el `sesion_id` actual, luego `sessionStorage.removeItem('sesion_id')`, luego el reset que ya existe.

## Criterios de verificación
| Requirement | Verificación |
|---|---|
| A.1–A.4 | Las 4 vistas muestran datos reales del customer_id logueado, no los valores hardcodeados actuales |
| A.5 | Apagar el backend y confirmar que las vistas muestran error legible, no pantalla en blanco |
| B.2 | Recargar la página con un chat abierto conserva el historial (no vuelve al mensaje de bienvenida) |
| B.3 | La respuesta ya no es siempre "Gracias por tu mensaje..." — varía según lo que devuelva n8n |
| B.5 | Al finalizar, se crea un ticket real en `tickets_soporte` (verificable en Soporte tras refrescar) |
