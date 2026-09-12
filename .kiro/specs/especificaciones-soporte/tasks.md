# Implementation Plan: Sistema Web Modular Telecom FyB

> **⚠️ DOCUMENTO HISTÓRICO — V1, YA IMPLEMENTADO.** Todas las tareas marcadas `[x]` corresponden al sistema V1 realmente construido y testeado. El Proyecto Fénix V2 agrega persistencia de chat, sistema de tickets, y 4 vistas nuevas de dashboard (Inicio/Facturación/Servicios/Soporte) sobre un esquema de DB mucho más amplio — ninguna de esas tareas está todavía en este documento. **No uses este plan para implementar V2 tal cual** — específicamente, la Tarea 10.1 (`useChatHistory` efímero) y la nota final sobre "el historial vive únicamente en useState" quedan anuladas. Fuente de verdad para V2: vault de Obsidian, `Elias/01 - Proyectos/Telecom/Proyecto Fénix V2 - Arquitectura.md` (incluye la checklist de qué conectar a datos reales vs. qué queda mockeado) y `Proyecto Fénix V2 - Chat y Tickets.md`.

## Overview

Implementación incremental del sistema completo: migración de base de datos → backend (Auth_Service + Chat_Service + JWT middleware) → frontend (Landing + Login + Dashboard + ChatWindow). Cada tarea construye sobre la anterior y termina con la integración de todos los componentes. El lenguaje de implementación es JavaScript (Node.js en backend, React/JSX en frontend) con Vite + Tailwind CSS.

---

## Tasks

- [x] 1. Configurar estructura del proyecto y migración de base de datos
  - Crear directorios del proyecto: `backend/` con subcarpetas `routes/`, `controllers/`, `middleware/`; y `frontend/` generado con `vite create` usando plantilla React.
  - Crear el archivo de migración SQL `backend/db/migration.sql` con la sentencia `CREATE TABLE IF NOT EXISTS usuarios` incluyendo los campos `id SERIAL PRIMARY KEY`, `customer_id INT NOT NULL`, `email VARCHAR(254) UNIQUE NOT NULL`, `password_hash VARCHAR(72) NOT NULL`, `created_at TIMESTAMP NOT NULL DEFAULT NOW()`, la constraint `FOREIGN KEY (customer_id) REFERENCES clientes(customer_id) ON DELETE CASCADE`, y el índice `idx_usuarios_email`.
  - Crear `backend/db/pool.js` que exporta el Pool de `pg` configurado con las variables de entorno `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 9.4_

- [ ] 2. Implementar el punto de entrada del Backend (`index.js`)
  - [x] 2.1 Crear `backend/index.js` con validación de variables de entorno y arranque del servidor
    - Llamar `dotenv.config()` como primera instrucción del archivo.
    - Validar la presencia de `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `N8N_WEBHOOK_URL`, `CORS_ALLOWED_ORIGINS`; registrar error y llamar `process.exit(1)` si alguna falta.
    - Verificar la conexión al Pool de PostgreSQL con `pool.query('SELECT 1')` antes de montar rutas; llamar `process.exit(1)` si falla.
    - Registrar middleware CORS usando `cors_allowed_origins` con lista parseada de `CORS_ALLOWED_ORIGINS`, y `express.json({ limit: '1mb' })`.
    - Montar `authRouter` en `/api/auth` y `chatRouter` en `/api/chat`.
    - Iniciar HTTP listener en `PORT` (default 3001).
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [ ]* 2.2 Escribir property test para validación de variables de entorno (Property 10)
    - **Property 10: Variables de entorno faltantes terminan el proceso con código de salida no-cero**
    - **Validates: Requirements 9.5**
    - Usar `fast-check` con `fc.subarray(REQUIRED_VARS, { minLength: 1 })` para generar subconjuntos faltantes.
    - Invocar función de startup aislada (sin `listen`) con el entorno mutilado y verificar que retorna código de salida distinto de cero.

- [ ] 3. Implementar JWT Middleware
  - [x] 3.1 Crear `backend/middleware/auth.js`
    - Extraer el header `Authorization: Bearer <token>`.
    - Verificar con `jwt.verify(token, process.env.JWT_SECRET)`.
    - Si no hay header o el valor no tiene formato Bearer: responder HTTP 401 `{ message: 'Token ausente' }`.
    - Si el token falla la verificación por firma: HTTP 401 `{ message: 'Token inválido' }`.
    - Si el token está expirado (`error.name === 'TokenExpiredError'`): HTTP 401 `{ message: 'Token expirado' }`.
    - Si es válido: adjuntar payload decodificado a `req.user` y llamar `next()`.
    - Envolver toda la lógica en `try/catch`.
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 3.2 Escribir property test para JWT Middleware (Property 5)
    - **Property 5: JWT Middleware rechaza cualquier token no válido con causa específica**
    - **Validates: Requirements 3.1, 3.2**
    - Usar `fast-check` con arbitrarios para token `null`, string malformado, JWT expirado generado, JWT con firma alterada.
    - Verificar que la respuesta es siempre HTTP 401 y que `message` es uno de `['Token ausente', 'Token inválido', 'Token expirado']`.

- [ ] 4. Implementar Auth_Service (rutas y controlador)
  - [x] 4.1 Crear `backend/routes/auth.routes.js` y `backend/controllers/auth.controller.js`
    - En `auth.routes.js`: definir `router.post('/login', authController.login)` y exportar el router.
    - En `auth.controller.js`:
      - Envolver toda la lógica en `try/catch`; en el `catch` responder HTTP 500 con mensaje genérico.
      - **Paso 1 — Validación de entrada:** si `email` o `password` son ausentes, vacíos, o `email` > 254 chars / `password` > 128 chars → HTTP 400 con mensaje indicando el campo inválido. **No consultar la DB.**
      - **Paso 2 — JOIN con clientes:** ejecutar `SELECT u.id, u.email, u.password_hash, c.churn FROM usuarios u JOIN clientes c ON u.customer_id = c.customer_id WHERE u.email = $1` con `pool.query`. Si no hay filas → HTTP 401 `{ message: 'Credenciales inválidas' }`.
      - **Paso 3 — Churn check:** si `row.churn === 1` → HTTP 403 `{ message: 'Cuenta inactiva o cliente dado de baja' }`. **Antes de llamar a bcrypt.**
      - **Paso 4 — bcrypt:** `bcrypt.compare(password, row.password_hash)`. Si no coincide → HTTP 401 `{ message: 'Credenciales inválidas' }`.
      - **Paso 5 — JWT:** firmar `{ userId: row.id, email: row.email }` con `JWT_SECRET`, `expiresIn: '24h'` y retornar HTTP 200 `{ token }`.
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 4.2 Escribir property test: churn bloquea autenticación independientemente de la contraseña (Property 1)
    - **Property 1: Churn siempre bloquea, independientemente de la contraseña**
    - **Validates: Requirements 2.1, 2.3**
    - Usar `fc.emailAddress()` y `fc.oneof(fc.string({ minLength: 1, maxLength: 128 }), validPasswordArb)`.
    - Setup: insertar usuario en DB de test con `churn = 1`. Verificar que la respuesta es siempre HTTP 403.

  - [ ]* 4.3 Escribir property test: credenciales inválidas siempre producen 401 (Property 2)
    - **Property 2: Credenciales inválidas → 401**
    - **Validates: Requirements 2.2, 2.4**
    - Cubrir casos: email inexistente y email existente con contraseña incorrecta para cliente activo.
    - Verificar que la respuesta es siempre HTTP 401 con `message === 'Credenciales inválidas'`.

  - [ ]* 4.4 Escribir property test: JWT emitido correcto para clientes activos (Property 3)
    - **Property 3: JWT válido contiene campos requeridos y expira en ≤ 24h**
    - **Validates: Requirements 2.5**
    - Usar `validCredentialsArb` (email/password de usuario con `churn = 0` en DB de test).
    - Verificar HTTP 200, `payload.userId` numérico, `payload.email === email`, `payload.exp <= now + 86400`.

  - [ ]* 4.5 Escribir property test: campos inválidos en login → 400 sin consultar la DB (Property 4)
    - **Property 4: Campos inválidos en login → 400 sin query DB**
    - **Validates: Requirements 2.6**
    - Generar cuerpos con email vacío, password vacío, email > 254 chars, password > 128 chars.
    - Espiar `pool.query` con `jest.spyOn` y verificar que no es llamado; respuesta HTTP 400.

- [ ] 5. Checkpoint — verificar Auth_Service
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implementar Chat_Service (rutas y controlador)
  - [x] 6.1 Crear `backend/routes/chat.routes.js` y `backend/controllers/chat.controller.js`
    - En `chat.routes.js`: aplicar `jwtMiddleware` antes del handler; definir `router.post('/', chatController.send)` y exportar.
    - En `chat.controller.js`:
      - Envolver toda la lógica en `try/catch`.
      - Validar que `message` no sea vacío y tenga ≤ 2000 caracteres; si falla → HTTP 400.
      - Llamar `axios.post(process.env.N8N_WEBHOOK_URL, { message }, { timeout: 30_000 })`.
      - Si respuesta 200 y body no vacío → HTTP 200 con el body de n8n.
      - Si `axios` lanza error de timeout (`error.code === 'ECONNABORTED'`) → HTTP 502 `{ message: 'Timeout al conectar con el servicio de soporte' }`.
      - Si n8n retorna status non-200 → HTTP 502 `{ message: 'El servicio de soporte retornó un error: {código}' }`.
      - Si body vacío o no parseable → HTTP 502 `{ message: 'El servicio de soporte retornó una respuesta vacía' }`.
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 6.2 Escribir property test: Chat_Service mapea correctamente toda respuesta de n8n (Property 6)
    - **Property 6: Chat_Service mapea correctamente toda respuesta de n8n**
    - **Validates: Requirements 4.2, 4.3**
    - Usar `fc.oneof` para generar escenarios: éxito (200 + body), timeout, HTTP error (400-599), body vacío.
    - Usar `nock` o servidor Express local para simular el webhook de n8n.
    - Verificar: éxito → HTTP 200; cualquier fallo → HTTP 502 con `message` de tipo string.

- [ ] 7. Checkpoint — verificar Backend completo
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Configurar proyecto Frontend (React + Vite + Tailwind CSS)
  - [x] 8.1 Inicializar proyecto Vite con plantilla React en `frontend/` e instalar dependencias
    - Instalar dependencias de producción: `react-router-dom`, `jwt-decode`, `axios` (o usar `fetch` nativo).
    - Instalar dependencias de desarrollo: `tailwindcss`, `postcss`, `autoprefixer`, `@testing-library/react`, `@testing-library/user-event`, `vitest`, `fast-check`, `jsdom`.
    - Ejecutar `npx tailwindcss init -p` para generar `tailwind.config.js` y `postcss.config.js`.
    - En `frontend/src/index.css` añadir las directivas de Tailwind: `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`.
    - Configurar `tailwind.config.js` con el glob `content: ['./index.html', './src/**/*.{js,jsx}']`.
    - Configurar `vitest.config.js` (o en `vite.config.js`) con `environment: 'jsdom'` y `globals: true`.
    - _Requirements: 5.1, 6.1, 7.1, 8.1_

- [ ] 9. Implementar componente ProtectedRoute y sistema de autenticación de sesión
  - [x] 9.1 Crear `frontend/src/components/ProtectedRoute.jsx` y `frontend/src/utils/auth.js`
    - En `auth.js`: exportar `getToken()` (lee `sessionStorage.getItem('token')`), `setToken(jwt)`, `removeToken()`, y `isTokenValid(token)` que usa `jwt-decode` para comprobar si `exp > Date.now() / 1000`.
    - En `ProtectedRoute.jsx`:
      - Leer token con `getToken()`.
      - Si ausente → `<Navigate to="/login" replace />`.
      - Si presente pero `isTokenValid` devuelve false → llamar `removeToken()` y `<Navigate to="/login" replace />`.
      - Si válido → renderizar `{children}`.
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 9.2 Escribir property test: ProtectedRoute redirige ante cualquier estado de JWT inválido (Property 9)
    - **Property 9: ProtectedRoute redirige ante JWT inválido o ausente**
    - **Validates: Requirements 7.1, 7.2, 7.3, 5.4, 6.5**
    - Usar `fc.oneof(fc.constant(null), expiredJwtArb, tamperedJwtArb)`.
    - Renderizar con `MemoryRouter` y verificar que el contenido del Dashboard no es renderizado y el token es eliminado de `sessionStorage`.

- [ ] 10. Implementar hook `useChatHistory` y lógica de envío con cleanup
  - [x] 10.1 Crear `frontend/src/hooks/useChatHistory.js` *(V1 — **❌ V2: ANULADO**, ver banner al inicio del documento)*
    - ~~Estado: `const [messages, setMessages] = useState([])` — historial en memoria, jamás escrito a `localStorage`, `sessionStorage` ni a ningún endpoint de persistencia.~~ **V2:** cada mensaje se persiste en tiempo real contra `POST /api/chat/message` → tabla `historial_mensajes`.
    - Ref para `AbortController`: `const abortRef = useRef(null)`.
    - `useEffect` con cleanup: al desmontar, llamar `abortRef.current?.abort()` para cancelar peticiones en vuelo y no hacer nada más (el estado de React ya se libera).
    - Función `sendMessage(content, token)`:
      1. Validar `content.length <= 2000`; si excede, retornar `{ error: 'Límite máximo de 2000 caracteres.' }` sin modificar el historial.
      2. Añadir `{ id: crypto.randomUUID(), role: 'user', content }` al historial (≤ 100 ms).
      3. Crear nuevo `AbortController`; asignar a `abortRef.current`.
      4. Llamar `fetch('/api/chat', { method: 'POST', headers: { Authorization: 'Bearer '+token, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: content }), signal: abortRef.current.signal })`.
      5. Si OK: añadir `{ role: 'assistant', content: responseText }`.
      6. Si error: añadir `{ role: 'error', content: 'Error: ' + causa }`.
    - _Requirements: 8.1, 8.2, 8.3, 8.6, 8.7_

  - [ ]* 10.2 Escribir property test: historial de chat es completamente efímero (Property 7)
    - **Property 7: Historial es efímero tras desmontar ChatWindow**
    - **Validates: Requirements 8.1, 8.2, 4.4**
    - Usar `fc.array(fc.string({ minLength: 1, maxLength: 200 }), { minLength: 1, maxLength: 20 })`.
    - Renderizar `<ChatWindow />`, enviar mensajes, desmontar y verificar que `sessionStorage` y `localStorage` no contienen datos de chat.

  - [ ]* 10.3 Escribir property test: ChatWindow bloquea mensajes que exceden 2000 caracteres (Property 8)
    - **Property 8: Mensajes > 2000 chars son bloqueados**
    - **Validates: Requirements 8.7**
    - Usar `fc.string({ minLength: 2001, maxLength: 10000 })`.
    - Llamar a `validateChatMessage(longMessage)` (función extraída de `useChatHistory`) y verificar que retorna `{ canSend: false }` sin modificar historial ni hacer fetch.

- [ ] 11. Implementar componente ChatWindow
  - [x] 11.1 Crear `frontend/src/components/ChatWindow.jsx`
    - Usar hook `useChatHistory` para gestionar mensajes y envíos.
    - Estado local: `const [inputValue, setInputValue] = useState('')`, `const [isLoading, setIsLoading] = useState(false)`.
    - Mostrar contador de caracteres `inputValue.length / 2000`; bloquear el botón de envío si `inputValue.length > 2000` y mostrar mensaje de error de límite.
    - Al enviar: deshabilitar el `<input>` y el `<button>`, llamar `sendMessage`, volver a habilitarlos al terminar.
    - Indicador de carga: mientras `isLoading === true`, mostrar un elemento con clases `animate-pulse` (o `animate-bounce`) de Tailwind, visible en el historial de mensajes.
    - Renderizar cada mensaje del historial diferenciando estilos por `role`: `user` (alineado derecha), `assistant` (alineado izquierda), `error` (texto rojo con ícono de alerta).
    - _Requirements: 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 12. Implementar Landing Page
  - [x] 12.1 Crear `frontend/src/pages/LandingPage.jsx`
    - Renderizar sección Hero con nombre y descripción de Telecom FyB, estilizada con Tailwind CSS.
    - Renderizar sección de Servicios/Productos ofrecidos.
    - Renderizar sección de Contacto o Información adicional.
    - Incluir botón/enlace `<Link to="/login">` de React Router que redirija a `/login`.
    - Si existe token válido en `sessionStorage` (usar `getToken()` y `isTokenValid()`), hacer `<Navigate to="/dashboard" />` sin renderizar el contenido.
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 13. Implementar Login Page con AbortController y manejo de errores
  - [x] 13.1 Crear `frontend/src/pages/LoginPage.jsx` y `frontend/src/hooks/useAuth.js`
    - En `useAuth.js`: función `login(email, password)` que:
      1. Crea `AbortController` con timeout de 10 segundos (`setTimeout(() => controller.abort(), 10_000)`).
      2. Llama `fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }), signal })`.
      3. Si la respuesta es HTTP 200: llama `setToken(jwt)` y retorna `{ success: true }`.
      4. Si HTTP 401: retorna `{ error: 'Credenciales inválidas.' }`.
      5. Si HTTP 403: retorna `{ error: 'Cuenta inactiva o cliente dado de baja.' }`.
      6. Si el fetch es abortado por timeout: retorna `{ error: 'No se pudo conectar con el servidor. Intente nuevamente.' }`.
    - En `LoginPage.jsx`:
      - Formulario controlado con estados para `email`, `password`, `errorMsg`, `isSubmitting`.
      - Validación client-side al enviar: si algún campo está vacío, mostrar mensaje indicando qué campo es requerido y **no llamar a `useAuth.login`**.
      - Si usuario ya tiene JWT válido (mismo check que Landing) → `<Navigate to="/dashboard" />`.
      - Redirigir a `/dashboard` con `useNavigate` tras login exitoso.
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 14. Implementar Dashboard Page y ensamblar React Router
  - [x] 14.1 Crear `frontend/src/pages/DashboardPage.jsx` y configurar rutas en `frontend/src/App.jsx`
    - En `DashboardPage.jsx`:
      - Obtener el JWT de `sessionStorage` con `getToken()` y pasarlo como prop al `<ChatWindow token={token} />`.
      - Incluir botón de cierre de sesión que llame a `removeToken()` y haga `navigate('/login')` sin confirmación adicional.
    - En `App.jsx`: configurar `<BrowserRouter>` con las rutas:
      - `/` → `<LandingPage />`
      - `/login` → `<LoginPage />`
      - `/dashboard` → `<ProtectedRoute><DashboardPage /></ProtectedRoute>`
    - _Requirements: 7.1, 7.4, 7.5_

- [ ] 15. Checkpoint final — integración y pruebas end-to-end
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para una entrega MVP más rápida.
- El orden de validación en el login (campo → DB JOIN → churn → bcrypt) es un requisito de negocio estricto, no una recomendación.
- ~~El historial del chat vive únicamente en `useState`; no usar `localStorage`, `sessionStorage` ni ninguna llamada de inserción a la DB para los mensajes.~~ **❌ V2: ANULADO** — el historial se persiste en tiempo real en `historial_mensajes` vía `POST /api/chat/message`. Ver banner al inicio del documento.
- Todos los controladores Express deben estar envueltos en `try/catch` y nunca exponer stack traces al cliente.
- Los property tests usan `fast-check` con `numRuns: 100` mínimo y el tag `// Feature: especificaciones-soporte, Property N`.
- Para ejecutar los tests de Vitest en modo único (sin watcher): `vitest --run`.
- Para ejecutar los tests de Jest en modo único: `jest --passWithNoTests`.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "4.4", "4.5", "6.1"] },
    { "id": 4, "tasks": ["6.2", "8.1"] },
    { "id": 5, "tasks": ["9.1", "10.1"] },
    { "id": 6, "tasks": ["9.2", "10.2", "10.3", "11.1"] },
    { "id": 7, "tasks": ["12.1", "13.1"] },
    { "id": 8, "tasks": ["14.1"] }
  ]
}
```
